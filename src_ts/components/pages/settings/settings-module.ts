import {PolymerElement, html} from '@polymer/polymer';
import '../../layout/page-content-header';
import './components/disaggregation-list.js';

import {pageLayoutStyles} from '../../styles/page-layout-styles';
import {fireEvent} from '../../utils/fire-custom-event';
import CommonMixin from '../../mixins/common-mixin';

/**
 * @polymer
 * @customElement
 */
class SettingsModule extends CommonMixin(PolymerElement) {
  static get template() {
    // language=HTML
    return html`
      ${pageLayoutStyles}
      <style></style>

      <page-content-header>
        <div slot="page-title">[[_getTranslation('SETTINGS')]]</div>
      </page-content-header>

      <div id="main">
        <div id="pageContent">
          <disaggregation-list></disaggregation-list>
        </div>
      </div>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    // deactivate main page loading msg triggered in app-shell
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'main-page'
    });
  }
}

window.customElements.define('settings-module', SettingsModule);
