import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import 'etools-upload/etools-upload.js';

import '../../../../../layout/etools-form-element-wrapper.js';
import { gridLayoutStyles } from '../../../../../styles/grid-layout-styles.js';
import { property } from '@polymer/decorators';
import { GenericObject } from '../../../../../../typings/globals.types.js';
import { SharedStyles } from '../../../../../styles/shared-styles.js';


class SrDetails extends PolymerElement {

  static get is() {
    return 'sr-details';
  }

  static get template() {
    return html`
     ${gridLayoutStyles}
      <style include="paper-material-styles">
        :host {
          display: block;
          background-color: var(--primary-background-color);
        }
        iron-label {
          display: block;
          font-size: 12px;
          color: var(--secondary-text-color);
        }

        .att {
          margin-bottom: 24px;
        }
      </style>
      ${SharedStyles}
      <div class="paper-material" elevation="1">
        <div class="row-h">
          <etools-form-element-wrapper label="Narrative" value="[[report.narrative]]">
          </etools-form-element-wrapper>
        </div>
        <div class="row-h">
          <template is="dom-repeat" items="[[reportAttachments]]">
            <div class="att">
              <iron-label for="file_[[index]]">
                [[item.type]]
              </iron-label>

              <a class="primary" id="file_[[index]]" href="[[item.path]]" target="_blank">
                [[item.file_name]]
              </a>
            </div>
        </template>
        </div>
      </div>
    `;
  }

  @property({type: Object})
  report!: GenericObject;

  @property({type: Array})
  reportAttachments!: any[];

}

window.customElements.define(SrDetails.is, SrDetails);
