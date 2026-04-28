(function () {
  'use strict';
  document.addEventListener('click', function (e) {
    var question = e.target.closest('.faq-question');
    if (question) {
      var item = question.closest('.faq-item');
      if (item) {
        item.classList.toggle('open');
      }
    }
  });
})();
