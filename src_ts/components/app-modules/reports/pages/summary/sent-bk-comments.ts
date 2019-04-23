import { PolymerElement, html } from '@polymer/polymer';
import 'etools-dialog/etools-dialog.js';
import '../../../../layout/etools-form-element-wrapper.js';
import { property } from '@polymer/decorators';

/*
  * @customElement
  * @polymer
  * @extends {Polymer.Element}
  */
class SentBkComments extends PolymerElement {
  static get is() {
    return 'sent-bk-comments';
  }

  static get template() {
    return html`
      <style>
        :host {
          display: block
        }
      </style>

      <etools-dialog opened="{{opened}}"
        dialog-title="Sent Back Comments"
        size="md"
        hide-confirm-btn>
        <etools-form-element-wrapper label="[[_getHeading(report.review_date, report.reviewed_by_name)]]"
              value="[[report.sent_back_feedback]]">
        </etools-form-element-wrapper>

      </etools-dialog>
    `;
  }

  @property({type: String})
  report: string = '';

  @property({type: Boolean})
  opened: boolean = false;

  _getHeading(reviewDt: string, reviewedBy: string) {
    if (!reviewDt && !reviewedBy) {
      return '';
    }
    return (reviewDt ? reviewDt : 'N/A') + ' ' + (reviewedBy ? reviewedBy : 'N/A');
  }

}

window.customElements.define(SentBkComments.is, SentBkComments);

