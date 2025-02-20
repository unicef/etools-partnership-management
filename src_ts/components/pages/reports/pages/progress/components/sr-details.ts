import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {AnyObject, GenericObject} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';

@customElement('sr-details')
export class SrDetails extends LitElement {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
          background-color: var(--primary-background-color);
        }
        label {
          display: block;
          font-size: var(--etools-font-size-12, 12px);
          color: var(--secondary-text-color);
        }
        div[elevation] {
          padding: 15px 20px;
        }
        .att {
          margin-bottom: 24px;
        }
      </style>

      <div class="elevation" elevation="1">
        <div class="row-h">
          <etools-textarea
            readonly
            placeholder="—"
            label="${translate('NARRATIVE')}"
            .value="${this.report?.narrative}"
          >
          </etools-textarea>
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
