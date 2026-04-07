var COURSE_STRUCTURE = [
  {
    title: 'Module 1: Why Most People Use AI Wrong',
    lessons: [
      { slug: 'module-1/lesson-1', title: 'The Copy-Paste Trap' },
      { slug: 'module-1/lesson-2', title: 'How AI Actually Thinks' },
      { slug: 'module-1/lesson-3', title: 'The Input-Output Principle' },
      { slug: 'module-1/lesson-4', title: 'The 3 Mistakes That Make AI Useless' },
      { slug: 'module-1/lesson-5', title: 'Your First AI Win' }
    ]
  },
  {
    title: 'Module 2: Role-Context-Constraints',
    lessons: [
      { slug: 'module-2/lesson-1', title: 'What Is RCC and Why It Works' },
      { slug: 'module-2/lesson-2', title: 'Role: Telling AI Who To Be' },
      { slug: 'module-2/lesson-3', title: 'Context: The Background AI Needs' },
      { slug: 'module-2/lesson-4', title: 'Constraints That Improve Output' },
      { slug: 'module-2/lesson-5', title: 'RCC in Practice: 5 Scenarios' }
    ]
  },
  {
    title: 'Module 3: The 5 Workflow Patterns',
    lessons: [
      { slug: 'module-3/lesson-1', title: 'The Research Synthesizer' },
      { slug: 'module-3/lesson-2', title: 'The Draft-Refine Loop' },
      { slug: 'module-3/lesson-3', title: 'The Decision Matrix Builder' },
      { slug: 'module-3/lesson-4', title: 'The Content Multiplier' },
      { slug: 'module-3/lesson-5', title: 'The Automation Chain' }
    ]
  },
  {
    title: 'Module 4: Your Personal AI Stack',
    lessons: [
      { slug: 'module-4/lesson-1', title: 'The AI Tool Landscape in 2026' },
      { slug: 'module-4/lesson-2', title: 'Choosing Your Core AI Tool' },
      { slug: 'module-4/lesson-3', title: 'Specialist Tools' },
      { slug: 'module-4/lesson-4', title: 'Building Your Daily AI Workflow' },
      { slug: 'module-4/lesson-5', title: 'The $0 Stack vs The Power Stack' }
    ]
  },
  {
    title: 'Module 5: Real Use Cases',
    lessons: [
      { slug: 'module-5/lesson-1', title: 'Emails That Write Themselves' },
      { slug: 'module-5/lesson-2', title: 'Reports and Summaries' },
      { slug: 'module-5/lesson-3', title: 'Zero to Expert in 20 Min' },
      { slug: 'module-5/lesson-4', title: 'Meeting Prep and Follow-Ups' },
      { slug: 'module-5/lesson-5', title: 'Data Analysis with AI' }
    ]
  },
  {
    title: 'Module 6: Coding & Technical Work',
    lessons: [
      { slug: 'module-6/lesson-1', title: 'AI-Assisted Coding' },
      { slug: 'module-6/lesson-2', title: 'Debugging with AI' },
      { slug: 'module-6/lesson-3', title: 'Automations Without Code' },
      { slug: 'module-6/lesson-4', title: 'Idea to Prototype in an Afternoon' }
    ]
  },
  {
    title: 'Module 7: Agents & Automation',
    lessons: [
      { slug: 'module-7/lesson-1', title: 'What Are AI Agents' },
      { slug: 'module-7/lesson-2', title: 'Your First Agent Workflow' },
      { slug: 'module-7/lesson-3', title: 'Multi-Step Automations' },
      { slug: 'module-7/lesson-4', title: 'The Future of AI' }
    ]
  }
];

async function renderSidebar(containerId, currentSlug) {
  var container = document.getElementById(containerId);
  if (!container) return;

  var completed = getProgress();
  var html = [];

  // Logo
  html.push('<div class="sidebar-logo">MindSparkAI</div>');

  // Dashboard link
  var dashClass = !currentSlug ? ' active' : '';
  html.push('<a href="/course/dashboard.html" class="sidebar-link' + dashClass + '">Dashboard</a>');

  // Modules and lessons
  for (var m = 0; m < COURSE_STRUCTURE.length; m++) {
    var mod = COURSE_STRUCTURE[m];
    html.push('<div class="sidebar-module">' + mod.title + '</div>');

    for (var l = 0; l < mod.lessons.length; l++) {
      var lesson = mod.lessons[l];
      var isActive = lesson.slug === currentSlug;
      var isCompleted = completed && completed.indexOf(lesson.slug) !== -1;

      var linkClass = 'sidebar-link';
      if (isActive) linkClass += ' active';
      if (isCompleted) linkClass += ' completed';

      var checkChar = isCompleted ? '\u2713' : '\u25CB';

      html.push(
        '<a href="/course/' + lesson.slug + '.html" class="' + linkClass + '" data-slug="' + lesson.slug + '">' +
          '<span class="check">' + checkChar + '</span>' +
          lesson.title +
        '</a>'
      );
    }
  }

  // Resources section
  html.push('<div class="sidebar-module">Resources</div>');
  html.push('<a href="/course/prompts.html" class="sidebar-link">Prompt Library</a>');
  html.push('<a href="/course/tools.html" class="sidebar-link">Tool Comparison</a>');

  // Logout
  html.push('<a href="#" class="sidebar-link" onclick="logout(); return false;">Logout</a>');

  container.innerHTML = html.join('');
}

function getLessonNav(currentSlug) {
  var allLessons = [];
  for (var m = 0; m < COURSE_STRUCTURE.length; m++) {
    var lessons = COURSE_STRUCTURE[m].lessons;
    for (var l = 0; l < lessons.length; l++) {
      allLessons.push(lessons[l]);
    }
  }

  var currentIndex = -1;
  for (var i = 0; i < allLessons.length; i++) {
    if (allLessons[i].slug === currentSlug) {
      currentIndex = i;
      break;
    }
  }

  var prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  var nextLesson = currentIndex !== -1 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  var html = [];
  html.push('<div class="lesson-nav">');

  if (prevLesson) {
    html.push(
      '<a href="/course/' + prevLesson.slug + '.html" class="lesson-nav-prev">' +
        '&#8592; ' + prevLesson.title +
      '</a>'
    );
  } else {
    html.push('<span></span>');
  }

  if (nextLesson) {
    html.push(
      '<a href="/course/' + nextLesson.slug + '.html" class="lesson-nav-next">' +
        nextLesson.title + ' &#8594;' +
      '</a>'
    );
  } else {
    html.push('<a href="/course/dashboard.html" class="lesson-nav-next">Back to Dashboard</a>');
  }

  html.push('</div>');

  return html.join('');
}
