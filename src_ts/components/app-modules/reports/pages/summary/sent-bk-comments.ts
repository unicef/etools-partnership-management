import {PolymerElement, html} from '@polymer/polymer';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '../../../interventions/pages/intervention-tab-pages/common/layout/etools-form-element-wrapper';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';

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
          display: block;
        }
      </style>

      <etools-dialog opened on-close="_onClose" dialog-title="Sent Back Comments" size="md" hide-confirm-btn>
        <etools-form-element-wrapper
          label="[[_getHeading(report.review_date, report.reviewed_by_name)]]"
          value="[[report.sent_back_feedback]]"
        >
        </etools-form-element-wrapper>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  report = {};

  set dialogData(data: any) {
    const {report}: any = data;
    this.report = report;
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  _getHeading(reviewDt: string, reviewedBy: string) {
    if (!reviewDt && !reviewedBy) {
      return '';
    }
    return (reviewDt ? reviewDt : 'N/A') + ' ' + (reviewedBy ? reviewedBy : 'N/A');
  }
}

window.customElements.define(SentBkComments.is, SentBkComments);
