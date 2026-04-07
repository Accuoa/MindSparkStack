// MindSparkAI — Lesson Progress Tracking
// Depends on: supabase-config.js (sb), auth-guard.js (currentUser)

var TOTAL_LESSONS = 33;

// In-memory cache of completed lesson slugs
var _completedSlugs = [];

// Mark a lesson as complete for the current user
// Updates the Supabase progress table, refreshes UI state
function markComplete(lessonSlug) {
  if (!currentUser) return;
  if (!lessonSlug) return;

  var userId = currentUser.id;

  sb.from('progress')
    .upsert(
      { user_id: userId, lesson_slug: lessonSlug, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,lesson_slug' }
    )
    .then(function(result) {
      if (result.error) {
        console.error('Progress save error:', result.error.message);
        return;
      }

      // Update in-memory cache
      if (_completedSlugs.indexOf(lessonSlug) === -1) {
        _completedSlugs.push(lessonSlug);
      }

      // Update complete button if present
      var btn = document.getElementById('btn-complete');
      if (btn) {
        btn.textContent = '\u2713 Completed';
        btn.classList.add('done');
        btn.disabled = true;
      }

      // Update sidebar checkmark for this lesson
      _updateSidebarCheckmark(lessonSlug, true);

      // Update any progress bars on the page
      _refreshProgressBar();
    });
}

// Fetch all completed lessons for the current user
// Returns a Promise that resolves to an array of lesson slugs
function getProgress() {
  if (!currentUser) return Promise.resolve([]);

  return sb.from('progress')
    .select('lesson_slug')
    .eq('user_id', currentUser.id)
    .then(function(result) {
      if (result.error) {
        console.error('Progress fetch error:', result.error.message);
        return [];
      }

      var slugs = (result.data || []).map(function(row) {
        return row.lesson_slug;
      });

      _completedSlugs = slugs;
      return slugs;
    });
}

// Returns current completion percentage (0–100)
function getProgressPercent() {
  if (TOTAL_LESSONS === 0) return 0;
  return Math.round((_completedSlugs.length / TOTAL_LESSONS) * 100);
}

// Returns true if the given lesson slug is completed
function isLessonComplete(lessonSlug) {
  return _completedSlugs.indexOf(lessonSlug) !== -1;
}

// Internal: update a sidebar link's completed state
function _updateSidebarCheckmark(lessonSlug, completed) {
  var links = document.querySelectorAll('[data-slug="' + lessonSlug + '"]');
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    var icon = link.querySelector('.check-icon');
    if (completed) {
      link.classList.add('completed');
      if (icon) icon.textContent = '\u2713';
    } else {
      link.classList.remove('completed');
      if (icon) icon.textContent = '\u25CB';
    }
  }
}

// Internal: update all .progress-fill and .progress-percent elements
function _refreshProgressBar() {
  var pct = getProgressPercent();
  var fills = document.querySelectorAll('.progress-fill');
  var labels = document.querySelectorAll('.progress-percent');

  for (var i = 0; i < fills.length; i++) {
    fills[i].style.width = pct + '%';
  }
  for (var j = 0; j < labels.length; j++) {
    labels[j].textContent = pct + '%';
  }
}

// Initialize progress state from DB and apply to sidebar + progress bars
// Call this inside onAuthReady() on each page
function initProgress(currentSlug) {
  getProgress().then(function(slugs) {
    // Apply checkmarks to all sidebar links
    for (var i = 0; i < slugs.length; i++) {
      _updateSidebarCheckmark(slugs[i], true);
    }

    // Update progress bar
    _refreshProgressBar();

    // Update the complete button for the current lesson
    if (currentSlug && isLessonComplete(currentSlug)) {
      var btn = document.getElementById('btn-complete');
      if (btn) {
        btn.textContent = '\u2713 Completed';
        btn.classList.add('done');
        btn.disabled = true;
      }
    }
  });
}
