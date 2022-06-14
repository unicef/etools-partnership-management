import {LitElement, html, property, customElement} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '../../../../common/components/etools-form-element-wrapper';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {AnyObject} from '@unicef-polymer/etools-types';

/*
 * @customElement
 * @polymer
 */
@customElement('sent-bk-comments')
export class SentBkComments extends LitElement {
  render() {
    return html`
      <style>
        :host {
          display: block;
        }
        etools-dialog::part(ed-title) {
          border-bottom: solid 1px var(--dark-divider-color);
        }
      </style>

      <etools-dialog opened @close="${this._onClose}" dialog-title="Sent Back Comments" size="md" hide-confirm-btn>
        <etools-form-element-wrapper2
          .label="${this._getHeading(this.report.review_date, this.report.reviewed_by_name)}"
          .value="${this.report.sent_back_feedback}"
        >
        </etools-form-element-wrapper2>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  report: AnyObject = {};

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
