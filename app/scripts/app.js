(function(document) {
  'use strict';

  var app = document.querySelector('#app');

  app.baseUrl = '/';

  // if (window.location.port === '') {
  //   app.baseUrl = '/etools-partnership-management/index.html/';
  // }

  // window.addEventListener('WebComponentsReady', function() {
  // });

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    app.$.headerPanelMain.scrollToTop(true);
  };

  app.closeDrawer = function() {
    app.$.paperDrawerPanel.closeDrawer();
  };

  app._toggleDrawer = function() {
    app.$.paperDrawerPanel.togglePanel();
  };

  app.partnerResetSearch = function(event) {
    var element = Polymer.dom(event).localTarget.parentElement.parentElement;
    element.querySelector('paper-input').value = '';
    element.querySelector('paper-dropdown-menu')._setSelectedItem();
  };
})(document);
