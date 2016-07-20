(function(document) {
  'use strict';

  var app = document.querySelector('#app');

  app.baseUrl = '/';

  if (window.location.port === '') {  // if production
    app.baseUrl = '/partnership_management_partners/';
  }

  // window.addEventListener('WebComponentsReady', function() {
  // });

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    app.$.headerPanelMain.scrollToTop(true);
  };

  app.closeDrawer = function() {
    app.$.paperDrawerPanel.closeDrawer();
  };

  app._toggleDrawer = function(e) {
    app.$.paperDrawerPanel.togglePanel();
  };
})(document);
