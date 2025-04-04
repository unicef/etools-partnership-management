import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '../../common/components/page-content-header';
import './components/disaggregation-list.js';

import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';

/**
 * @LitElement
 * @customElement
 */

@customElement('settings-module')
export class SettingsModule extends CommonMixin(LitElement) {
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
}
