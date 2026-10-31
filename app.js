const $ = id => document.getElementById(id);

const library = [
  {
    type: 'folder',
    id: 'year-1',
    name: 'Year 1',
    description: 'First-year nursing study materials.',
    icon: 'Ⅰ',
    children: [
      {
        type: 'subject',
        id: 'first-aid',
        name: 'First Aid',
        description: 'Emergency care, CPR, injuries, burns and more.',
        icon: '＋',
        ready: true,
        collections: [
          {
            name: 'First Aid',
            subjectName: 'First Aid',
            description: 'Emergency care and first-aid practice.',
            file: 'subjects/year-1/first-aid/questions.json',
            count: 35
          }
        ]
      }
    ]
  },
  {
    type: 'folder',
    id: 'year-2',
    name: 'Year 2',
    description: 'Second-year nursing study materials.',
    icon: 'Ⅱ',
    children: [
      {
        type: 'folder',
        id: 'semester-1',
        name: 'First Semester',
        description: 'Second-year, first-semester subjects.',
        icon: 'Ⅰ',
        children: [
          {
            type: 'subject',
            id: 'physiology-ii',
            name: 'Physiology II',
            description: 'Understand the functions of the human body.',
            icon: 'Ⅱ',
            ready: true,
            collections: [
              {
                name: 'NBB GIT RN',
                subjectName: 'Physiology II',
                description: 'Physiology of the Digestive System.',
                file: 'subjects/year-2/semester-1/physiology-ii/nbb-git-rn/questions.json',
                count: 30
              }
            ]
          },
          ...[
            'Environment Health',
            'Parasitology',
            'Fundamental II',
            'Entrepreneurship',
            'ORT',
            'Microbiology II',
            'Biochemistry II',
            'Pharmacology',
            'Inclusiveness',
            'Pathophysiology',
            'Anatomy II'
          ].map((name, index) => ({
            type: 'subject',
            id: `year-2-subject-${index + 1}`,
            name,
            description: 'Study materials and interactive quizzes will be added here.',
            icon: 'Ⅱ',
            ready: false,
            collections: []
          }))
        ]
      },
      {
        type: 'folder',
        id: 'semester-2',
        name: 'Second Semester',
        description: 'Second-year, second-semester subjects.',
        icon: 'Ⅱ',
        comingSoon: true,
        children: []
      }
    ]
  }
];

let questions = [];
let currentSubject = null;
let index = 0;
let choice = null;
let checked = [];
let answers = [];

let currentCollection = null;
const viewStack = [{ type: 'root' }];

function pushView(view, fragment) {
  viewStack.push(view);
  window.history.pushState(
    { nusphereView: fragment },
    '',
    window.location.pathname + window.location.search + '#' + fragment
  );
}

function goBack() {
  if (viewStack.length > 1) {
    window.history.back();
  }
}

function displayLibrary() {
  renderLibrary();
}

window.addEventListener('popstate', () => {
  if (viewStack.length > 1) viewStack.pop();
  renderLibrary();
});


function showLibrary() {
  goBack();
}

function renderLibrary() {
  const view = viewStack[viewStack.length - 1];
  const list = $('subjects-list');
  const heading = document.querySelector('#library .section-head h2');
  const labels = document.querySelectorAll('#library .section-head .small-label');
  const future = document.querySelector('#library .future');
  const librarySection = $('library');

  $('hero').classList.toggle('hidden', view.type !== 'root');
  librarySection.classList.remove('hidden');
  $('quiz').classList.add('hidden');
  $('results').classList.add('hidden');

  let items = [];
  let title = 'Choose a year';

  if (view.type === 'root') {
    items = library;
    title = 'Choose a year';
  } else if (view.type === 'folder') {
    items = view.folder.children || [];
    title = view.folder.name;
  } else if (view.type === 'subject') {
    items = view.subject.collections || [];
    title = view.subject.name;
  }

  heading.textContent = title;
  labels[0].textContent = view.type === 'root' ? 'YOUR LIBRARY' : 'STUDY LIBRARY';
  labels[1].textContent =
    `${String(items.length).padStart(2, '0')} ${view.type === 'subject' ? 'COLLECTIONS' : 'ITEMS'}`;

  let back = $('library-back');
  if (!back) {
    back = document.createElement('button');
    back.id = 'library-back';
    back.className = 'back library-back';
    back.type = 'button';
    back.addEventListener('click', goBack);
    librarySection.insertBefore(back, librarySection.firstChild);
  }

  back.classList.toggle('hidden', view.type === 'root');
  if (view.type !== 'root') {
    const parent = viewStack[viewStack.length - 2];
    const parentName = parent.type === 'root'
      ? 'Library'
      : parent.type === 'folder'
        ? parent.folder.name
        : parent.subject.name;
    back.textContent = `← ${parentName}`;
  }

  future.textContent = view.type === 'subject'
    ? 'More quiz collections from additional lecture materials will be added here.'
    : view.type === 'root'
      ? 'Choose your study year to explore its subjects and learning materials.'
      : 'More subjects and learning materials will be added as we progress.';

  list.replaceChildren();

  function addCard(item, options = {}) {
    const button = document.createElement('button');
    button.className = 'subject';
    button.type = 'button';
    button.disabled = Boolean(options.disabled);

    const icon = document.createElement('div');
    icon.className = 'subject-icon';
    icon.textContent = options.icon || item.icon || 'Ⅱ';

    const info = document.createElement('div');
    info.className = 'subject-info';

    const label = document.createElement('div');
    label.className = 'small-label';
    label.textContent = options.label || 'NURSING · AVAILABLE';

    const name = document.createElement('h3');
    name.textContent = item.name;

    const description = document.createElement('p');
    description.textContent = item.description || '';

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = options.meta || '';

    info.append(label, name, description, meta);

    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    arrow.textContent = options.disabled ? '…' : '↗';

    button.append(icon, info, arrow);

    if (!options.disabled && options.onClick) {
      button.addEventListener('click', options.onClick);
    }

    list.append(button);
  }

  for (const item of items) {
    if (view.type === 'subject') {
      addCard(item, {
        label: 'QUIZ COLLECTION · AVAILABLE',
        meta: `${item.count} questions · Interactive practice`,
        icon: '▤',
        onClick: () => start({
          ...item,
          subjectName: view.subject.name
        })
      });
      continue;
    }

    if (item.type === 'folder') {
      const disabled = Boolean(item.comingSoon);
      addCard(item, {
        label: disabled ? 'COMING SOON' : 'STUDY FOLDER',
        meta: disabled ? 'Being prepared' : `${item.children.length} sections · Explore`,
        disabled,
        onClick: () => {
          pushView({ type: 'folder', folder: item }, `folder-${item.id}`);
          renderLibrary();
        }
      });
      continue;
    }

    const disabled = !item.ready;
    const collectionCount = item.collections.length;

    addCard(item, {
      label: disabled ? 'NURSING · COMING SOON' : 'NURSING · AVAILABLE',
      meta: disabled
        ? 'Study materials being prepared'
        : `${collectionCount} quiz collection${collectionCount === 1 ? '' : 's'}`,
      disabled,
      onClick: () => {
        pushView({ type: 'subject', subject: item }, `subject-${item.id}`);
        renderLibrary();
      }
    });
  }

  window.scrollTo(0, 0);
}

async function start(collection) {
  try {
    const response = await fetch(collection.file);

    if (!response.ok) {
      throw new Error(`Could not load ${collection.file}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length !== collection.count) {
      throw new Error('The question file has an unexpected structure.');
    }

    for (const [i, q] of data.entries()) {
      if (
        !q.q ||
        !Array.isArray(q.o) ||
        !Number.isInteger(q.a) ||
        q.a < 0 ||
        q.a >= q.o.length ||
        !q.e
      ) {
        throw new Error(`Invalid question data at question ${i + 1}.`);
      }
    }

    if (viewStack[viewStack.length - 1].type !== 'quiz') {
      pushView({ type: 'quiz', collection }, 'quiz');
    }

    questions = data;
    currentSubject = { name: collection.subjectName };
    currentCollection = collection;
    index = 0;
    answers = Array(questions.length).fill(null);
    checked = Array(questions.length).fill(false);

    $('hero').classList.add('hidden');
    $('library').classList.add('hidden');
    $('results').classList.add('hidden');
    $('quiz').classList.remove('hidden');

    $('subject-heading').textContent = `${collection.subjectName.toUpperCase()} · ${collection.name.toUpperCase()}`;

    render();
    window.scrollTo(0, 0);
  } catch (error) {
    alert(`Unable to open this quiz.\n${error.message}`);
  }
}

function render() {
  const q = questions[index];
  choice = answers[index];

  $('count').textContent =
    `QUESTION ${String(index + 1).padStart(2, '0')} / ${questions.length}`;

  $('percent').textContent =
    `${Math.round(index / questions.length * 100)}% COMPLETE`;

  $('fill').style.width = `${index / questions.length * 100}%`;

  $('section').textContent = q.g || q.topic || currentSubject.name;
  $('question').textContent = q.q;

  const details = [
    q.difficulty,
    q.topic,
    q.slide ? `Slide ${q.slide}` : null
  ].filter(Boolean);

  $('hint').textContent = details.length
    ? details.join(' · ')
    : q.t
      ? 'Choose True or False, then check your answer.'
      : 'Choose one answer, then check your answer.';

  $('answers').replaceChildren();

  q.o.forEach((txt, i) => {
    const button = document.createElement('button');
    button.className = 'option';
    button.type = 'button';

    const letter = document.createElement('span');
    letter.className = 'letter';
    letter.textContent = String.fromCharCode(65 + i);

    const text = document.createElement('span');
    text.textContent = txt;

    button.append(letter, text);

    if (choice === i) button.classList.add('selected');

    if (checked[index]) {
      button.disabled = true;
      if (i === q.a) button.classList.add('correct');
      else if (i === choice) button.classList.add('wrong');
    } else {
      button.addEventListener('click', () => {
        choice = i;
        answers[index] = i;

        [...$('answers').children].forEach((item, j) => {
          item.classList.toggle('selected', j === i);
        });

        $('next').disabled = false;
      });
    }

    $('answers').append(button);
  });

  $('previous').disabled = index === 0;
  $('next').disabled = !checked[index] && choice === null;
  $('next').textContent = checked[index]
    ? index === questions.length - 1 ? 'See results →' : 'Next question →'
    : 'Check answer →';

  $('skip').textContent = 'Skip for now';

  if (checked[index]) {
    showFeedback();
  } else {
    $('feedback').className = 'feedback hidden';
  }
}

function showFeedback() {
  const q = questions[index];
  const correct = answers[index] === q.a;

  $('feedback').className = `feedback${correct ? '' : ' wrong'}`;
  $('feedback-title').textContent = correct
    ? 'Correct. Well done.'
    : 'Not quite — learn from it.';

  $('feedback-answer').textContent = correct
    ? `Your answer: ${q.o[q.a]}`
    : `Correct answer: ${q.o[q.a]}`;

  const explanation = [q.e];

  if (q.why && Array.isArray(q.why)) {
    explanation.push(
      'Why the other options are incorrect:',
      ...q.why.map(item => `• ${item}`)
    );
  }

  $('explanation').textContent = explanation.join('\n\n');

  $('fill').style.width = `${(index + 1) / questions.length * 100}%`;
  $('percent').textContent =
    `${Math.round((index + 1) / questions.length * 100)}% COMPLETE`;
}

function check() {
  if (choice === null || checked[index]) return;

  answers[index] = choice;
  checked[index] = true;

  render();
}

function next() {
  if (!checked[index]) {
    check();
    return;
  }

  if (index < questions.length - 1) {
    index++;
    render();
    window.scrollTo(0, 0);
  } else {
    results();
  }
}

function previous() {
  if (index === 0) return;

  index--;
  render();
  window.scrollTo(0, 0);
}

function skip() {
  if (checked[index]) {
    next();
    return;
  }

  answers[index] = null;

  if (index < questions.length - 1) {
    index++;
    render();
    window.scrollTo(0, 0);
  } else {
    results();
  }
}

function results() {
  $('quiz').classList.add('hidden');
  $('results').classList.remove('hidden');

  const total = questions.reduce(
    (score, q, i) => score + (answers[i] === q.a ? 1 : 0),
    0
  );

  $('score').textContent = `${total} / ${questions.length}`;
  $('accuracy').textContent =
    `${Math.round(total / questions.length * 100)}%`;

  $('review').classList.add('hidden');
  $('review').replaceChildren();
  $('review-toggle').textContent = 'Review answers';

  window.scrollTo(0, 0);
}

function review() {
  const box = $('review');

  if (!box.classList.contains('hidden')) {
    box.classList.add('hidden');
    $('review-toggle').textContent = 'Review answers';
    return;
  }

  box.replaceChildren();

  questions.forEach((q, i) => {
    const article = document.createElement('article');

    const heading = document.createElement('h3');
    heading.textContent = `${i + 1}. ${q.q}`;

    const result = document.createElement('p');

    if (answers[i] === q.a) {
      result.textContent = `Correct · ${q.o[q.a]}`;
      result.style.color = '#315e4d';
    } else {
      result.textContent =
        `Correct answer · ${q.o[q.a]}` +
        (answers[i] === null
          ? ' · Skipped'
          : ` · Your answer: ${q.o[answers[i]]}`);

      result.style.color = '#a64f43';
    }

    const explanation = document.createElement('p');
    explanation.textContent = q.e;

    article.append(heading, result, explanation);

    if (q.why && Array.isArray(q.why)) {
      const rationales = document.createElement('p');
      rationales.textContent =
        `Other options: ${q.why.join(' | ')}`;
      article.append(rationales);
    }

    box.append(article);
  });

  box.classList.remove('hidden');
  $('review-toggle').textContent = 'Hide review';
  box.scrollIntoView({ behavior: 'smooth' });
}

$('previous').addEventListener('click', previous);
$('next').addEventListener('click', next);
$('skip').addEventListener('click', skip);
$('back').addEventListener('click', showLibrary);
$('restart').addEventListener('click', () => start(currentCollection));
$('review-toggle').addEventListener('click', review);

renderLibrary();
