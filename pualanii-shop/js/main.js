(function () {
  'use strict';

  // Keep the footer year current without editing HTML each January.
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
