const $ = id => document.getElementById(id);

const subjects = [
  {
    id: 'first-aid',
    name: 'First Aid',
    description: 'Emergency care, CPR, injuries, burns and more.',
    file: 'subjects/first-aid.json',
    count: 35,
    icon: '＋',
    ready: true
  },
  {
    id: 'physiology-ii',
    name: 'Physiology II',
    description: 'Physiology of the digestive system.',
    file: 'subjects/physiology-ii.json',
    count: 30,
    icon: 'Ⅱ',
    ready: true
  }
];

let questions = [];
let currentSubject = null;
let index = 0;
let choice = null;
let checked = [];
let answers = [];

function showLibrary() {
  $('hero').classList.remove('hidden');
  $('library').classList.remove('hidden');
  $('quiz').classList.add('hidden');
  $('results').classList.add('hidden');
  window.scrollTo(0, 0);
}

function renderLibrary() {
  const list = $('subjects-list');
  list.replaceChildren();

  subjects.forEach(subject => {
    const button = document.createElement('button');
    button.className = 'subject';
    button.type = 'button';
    button.disabled = !subject.ready;

    const icon = document.createElement('div');
    icon.className = 'subject-icon';
    icon.textContent = subject.icon;

    const info = document.createElement('div');
    info.className = 'subject-info';

    const label = document.createElement('div');
    label.className = 'small-label';
    label.textContent = `NURSING · ${subject.ready ? 'AVAILABLE' : 'COMING SOON'}`;

    const title = document.createElement('h3');
    title.textContent = subject.name;

    const description = document.createElement('p');
    description.textContent = subject.description;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = subject.ready
      ? `${subject.count} questions · Interactive practice`
      : `${subject.count} questions · Being prepared`;

    info.append(label, title, description, meta);

    const arrow = document.createElement('div');
    arrow.className = 'arrow';
    arrow.textContent = subject.ready ? '↗' : '…';

    button.append(icon, info, arrow);

    if (subject.ready) {
      button.addEventListener('click', () => start(subject));
    }

    list.append(button);
  });
}

async function start(subject) {
  try {
    const response = await fetch(subject.file);

    if (!response.ok) {
      throw new Error(`Could not load ${subject.file}`);
    }

    const data = await response.json();

    if (!Array.isArray(data) || data.length !== subject.count) {
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

    questions = data;
    currentSubject = subject;
    index = 0;
    answers = Array(questions.length).fill(null);
    checked = Array(questions.length).fill(false);

    $('hero').classList.add('hidden');
    $('library').classList.add('hidden');
    $('results').classList.add('hidden');
    $('quiz').classList.remove('hidden');

    $('subject-heading').textContent = `${subject.name.toUpperCase()} · PRACTICE`;

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
$('restart').addEventListener('click', () => start(currentSubject));
$('review-toggle').addEventListener('click', review);

renderLibrary();
