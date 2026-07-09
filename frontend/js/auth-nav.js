// Shared navbar auth state: shows username + logout when logged in,
// shows "Login / signUp" when logged out. Included on every page.
(function () {
  function getSession() {
    var token = localStorage.getItem('rideToken');
    var user = null;
    try {
      user = JSON.parse(localStorage.getItem('rideUser') || 'null');
    } catch (e) {
      user = null;
    }
    return token && user ? { token: token, user: user } : null;
  }

  function logout() {
    localStorage.removeItem('rideToken');
    localStorage.removeItem('rideUser');
    window.location.href = 'index.html';
  }

  function renderNav() {
    var container = document.querySelector('.user_option');
    if (!container) return;

    var session = getSession();

    if (session) {
      var firstName = (session.user.name || 'Account').split(' ')[0];
      container.innerHTML =
        '<div class="user_menu">' +
          '<button type="button" class="user_menu_btn">' +
            '<i class="fa fa-user-circle"></i> ' + firstName + ' <i class="fa fa-caret-down"></i>' +
          '</button>' +
          '<div class="user_menu_dropdown">' +
            '<a href="#" id="logoutLink">Logout</a>' +
          '</div>' +
        '</div>';

      var btn = container.querySelector('.user_menu_btn');
      var dropdown = container.querySelector('.user_menu_dropdown');

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });

      document.addEventListener('click', function () {
        dropdown.classList.remove('show');
      });

      container.querySelector('#logoutLink').addEventListener('click', function (e) {
        e.preventDefault();
        logout();
      });
    } else {
      container.innerHTML = '<a href="auth.html">Login / signUp</a>';
    }
  }

  document.addEventListener('DOMContentLoaded', renderNav);
})();
