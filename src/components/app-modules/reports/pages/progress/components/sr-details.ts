import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import 'etools-upload/etools-upload.js';

import '../../../../../layout/etools-form-element-wrapper.js';


class SrDetails extends PolymerElement {

  static get is() {
    return 'sr-details';
  }

  static get template() {
    return html`
      <style include="paper-material-styles grid-layout-styles">
        :host {
          display: block;
          background-color: var(--primary-background-color);
        }
      </style>

      <div class="paper-material" elevation="1">
        <div class="row-h">
          <etools-form-element-wrapper label="Narrative" value="[[report.narrative]]">
          </etools-form-element-wrapper>
        </div>
        <div class="row-h">
          <etools-upload label="Attachment"
                        file-url="[[reportAttachment.path]]"
                        readonly>
          </etools-upload>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      report: Object,
      reportAttachment: {
        type: Object
      }
    };
  }

}

window.customElements.define(SrDetails.is, SrDetails);
