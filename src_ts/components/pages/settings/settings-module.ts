import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../common/components/page-content-header';
import './components/disaggregation-list.js';

import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import CommonMixinLit from '../../common/mixins/common-mixin-lit';

/**
 * @LitElement
 * @customElement
 */

@customElement('settings-module')
export class SettingsModule extends CommonMixinLit(LitElement) {
  render() {
    // language=HTML
    return html`
      ${pageLayoutStyles}
      <style></style>

      <page-content-header>
        <div slot="page-title">${this._getTranslation('SETTINGS')}</div>
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
