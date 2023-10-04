import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-upload/etools-upload.js';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {AnyObject, GenericObject} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

@customElement('sr-details')
export class SrDetails extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      ${sharedStyles}
      <style include="paper-material-styles">
        :host {
          display: block;
          background-color: var(--primary-background-color);
        }
        label {
          display: block;
          font-size: 12px;
          color: var(--secondary-text-color);
        }

        .att {
          margin-bottom: 24px;
        }
      </style>

      <div class="paper-material elevation" elevation="1">
        <div class="row-h">
          <etools-input readonly placeholder="—" label="${translate('NARRATIVE')}" .value="${this.report?.narrative}">
          </etools-input>
        </div>
        <div class="row-padding">
          ${(this.reportAttachments || []).map(
            (item: AnyObject, index: number) => html`
              <div class="att">
                <label for="file_${index}">${getTranslatedValue(item.type, 'COMMON_DATA.FILETYPES')}</label>
                <a class="primary" id="file_${index}" href="${item.path}" target="_blank">${item.file_name}</a>
              </div>
            `
          )}
        </div>
      </div>
    `;
  }

  @property({type: Object})
  report!: GenericObject;

  @property({type: Array})
  reportAttachments!: any[];
}
