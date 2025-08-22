(function(){
  function renderUserBadge() {
    const badge = document.getElementById('userBadge');
    if (!badge) return;
    const user = window.BMStorage.getCurrentUser();
    if (user) {
      badge.innerHTML = `Signed in as <strong>${user.username}</strong>`;
    } else {
      badge.innerHTML = `Guest <a class="btn" style="margin-left:8px" href="signup.html">Sign in</a>`;
    }
  }

  window.BMUI = { renderUserBadge };
})();

