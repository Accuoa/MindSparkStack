// MindSparkAI — Auth Guard
// Checks session on every course page, fetches user profile, enforces subscription status.
// Depends on: supabase-config.js (sb)

var currentUser = null;
var userProfile = null;

// Subscription tiers that require an active recurring subscription
var SUBSCRIPTION_TIERS = ['core', 'hive', 'vanguard'];

// Tiers that grant access to course content
var COURSE_TIERS = ['masterclass', 'vip', 'vanguard'];

function initAuth() {
  sb.auth.getSession().then(function(result) {
    var session = result.data && result.data.session;
    var error = result.error;

    if (error || !session || !session.user) {
      window.location.href = '/course/login.html';
      return;
    }

    currentUser = session.user;

    sb.from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single()
      .then(function(profileResult) {
        var profileData = profileResult.data;
        var profileError = profileResult.error;

        if (profileError || !profileData) {
          // Profile missing — redirect to login
          window.location.href = '/course/login.html';
          return;
        }

        userProfile = profileData;

        // Check subscription validity for recurring tiers
        var tier = userProfile.tier || 'free';
        if (SUBSCRIPTION_TIERS.indexOf(tier) !== -1) {
          var subStatus = userProfile.subscription_status;
          if (subStatus !== 'active' && subStatus !== 'trialing') {
            // Subscription lapsed — downgrade to free in memory (not in DB)
            userProfile.tier = 'free';
          }
        }

        // Call page-level callback if defined
        if (typeof onAuthReady === 'function') {
          onAuthReady(currentUser, userProfile);
        }
      });
  });
}

// Returns true if the current user's tier is in the requiredTiers array
// requiredTiers: array of tier strings, e.g. ['masterclass', 'vip', 'vanguard']
function canAccess(requiredTiers) {
  if (!userProfile) return false;
  if (!requiredTiers || requiredTiers.length === 0) return true;
  return requiredTiers.indexOf(userProfile.tier) !== -1;
}

// Returns true if user has any course-content tier (masterclass, vip, or vanguard)
function hasCourseTier() {
  return canAccess(COURSE_TIERS);
}

// Returns true if user has any active subscription tier (core, hive, or vanguard)
function hasSubscriptionTier() {
  return canAccess(SUBSCRIPTION_TIERS);
}

// Signs the user out and redirects to login
function logout() {
  sb.auth.signOut().then(function() {
    currentUser = null;
    userProfile = null;
    window.location.href = '/course/login.html';
  });
}

// Run on script load
initAuth();
