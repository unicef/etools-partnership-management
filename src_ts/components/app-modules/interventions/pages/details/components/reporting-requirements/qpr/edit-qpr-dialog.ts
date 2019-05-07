import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-label/iron-label.js';
import '@polymer/paper-button/paper-button.js';

import 'etools-dialog/etools-dialog.js';

import {prepareDatepickerDate} from '../../../../../../../utils/date-utils.js';
import EndpointsMixin from '../../../../../../../endpoints/endpoints-mixin.js';
import './qpr-list.js';
import { fireEvent } from '../../../../../../../utils/fire-custom-event.js';
import CONSTANTS from '../../../../../../../../config/app-constants.js';

import 'etools-date-time/calendar-lite.js';
import { gridLayoutStyles } from '../../../../../../../styles/grid-layout-styles.js';
import { buttonsStyles } from '../../../../../../../styles/buttons-styles.js';
import { logError } from 'etools-behaviors/etools-logging';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../../../../../utils/ajax-errors-parser.js';
import { property } from '@polymer/decorators';
import { GenericObject } from '../../../../../../../../typings/globals.types.js';
import EtoolsDialog from 'etools-dialog/etools-dialog.js';
import { QprListEl } from './qpr-list.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class EditQprDialog extends EndpointsMixin(PolymerElement) {

  static get template() {
    return html`
    ${gridLayoutStyles} ${buttonsStyles}
    <style>
      *[hidden] {
        display: none !important;
      }

      #qpr-edit-info {
        margin-right: 24px;
      }

      qpr-list {
        margin-top: 24px;
      }

      iron-label {
        margin-bottom: 24px;
      }

      calendar-lite {
        position: relative;
        width: 268px;
        height: 100%;
      }

    </style>

    <etools-dialog id="editQprDialog"
                  size="lg"
                  dialog-title="Edit Quarterly Progress Reporting Requirements"
                  hidden$="[[addOrModifyQprDialogOpened]]"
                  on-confirm-btn-clicked="_saveModifiedQprData"
                  ok-btn-text="Save"
                  keep-dialog-open
                  spinner-text="Saving...">

      <div class="layout-horizontal">
        <span id="qpr-edit-info">All dates in the future can be edited before saving. | Or</span>
        <paper-button class="secondary-btn" on-click="_addNewQpr">
          Add Requirement
        </paper-button>
      </div>

      <qpr-list id="qprList"
                with-scroll
                qpr-data="[[qprData]]"
                edit-mode
                in-amendment="[[inAmendment]]"
                on-edit-qpr="_editQprDatesSet"
                on-delete-qpr="_deleteQprDatesSet"
                always-show-row-actions></qpr-list>

    </etools-dialog>

    <!-- add or edit a QPR row -->
    <etools-dialog id="addOrModifyQprDialog"
                  size="lg"
                  dialog-title="Edit Standard Quarterly Report Requirements"
                  opened="{{addOrModifyQprDialogOpened}}"
                  no-padding
                  on-close="_updateQprData"
                  ok-btn-text="Save">

      <div class="row-h" hidden$="[[_hideEditedIndexInfo(_qprDatesSetEditedIndex)]]">
        You are editing ID [[_getEditedQprDatesSetId(_qprDatesSetEditedIndex)]]
      </div>

      <div class="row-h">
        <div class="col layout-vertical">
          <iron-label for="startDate">
            Start Date
          </iron-label>
          <calendar-lite id="startDate"
                    date="[[prepareDatepickerDate(_editedQprDatesSet.start_date)]]"
                    pretty-date="{{_editedQprDatesSet.start_date}}"
                    format="YYYY-MM-DD"
                    hide-header>
                                    </calendar-lite>
        </div>
        <div class="col layout-vertical">
          <iron-label for="endDate">
            End Date
          </iron-label>
          <calendar-lite id="endDate"
                    date="[[prepareDatepickerDate(_editedQprDatesSet.end_date)]]"
                    pretty-date="{{_editedQprDatesSet.end_date}}"
                    format="YYYY-MM-DD"
                    hide-header>
                                  </calendar-lite>
        </div>
        <div class="col layout-vertical">
          <iron-label for="dueDate">
            Due Date
          </iron-label>
          <calendar-lite id="dueDate"
                    date="[[prepareDatepickerDate(_editedQprDatesSet.due_date)]]"
                    pretty-date="{{_editedQprDatesSet.due_date}}"
                    format="YYYY-MM-DD"
                    hide-header>
                                    </calendar-lite>
        </div>
      </div>

    </etools-dialog>
    `;
  }

  @property({type: Number})
  interventionId!: number;

  @property({type: Boolean})
  inAmendment!: boolean;

  @property({type: Array})
  qprData: GenericObject[] = [];

  @property({type: Boolean})
  addOrModifyQprDialogOpened: boolean = false;

  @property({type: Object})
  toastMsgLoadingSource!: PolymerElement;

  @property({type: Object})
  _qprDatesSetModel = {
      start_date: null,
      end_date: null,
      due_date: null
    };

  @property({type: Object})
  _editedQprDatesSet!: GenericObject;

  @property({type: Number})
  _qprDatesSetEditedIndex: number = -1;

  openQprDialog() {
    (this.$.editQprDialog as EtoolsDialog).opened = true;
  }

  closeQprDialog() {
    (this.$.editQprDialog as EtoolsDialog).opened = false;
  }

  _addNewQpr() {
    this.set('_editedQprDatesSet', Object.assign({}, this._qprDatesSetModel));
    this.set('addOrModifyQprDialogOpened', true);
  }

  _duplicateDueDate(dueDate: any) {
    let foundQpr = this.qprData.find((d: any) => d.due_date === dueDate);
    if (this._qprDatesSetEditedIndex > -1 && foundQpr) {
      let foundQprIndex = this.qprData.indexOf(foundQpr);
      return foundQprIndex !== +this._qprDatesSetEditedIndex;
    }
    return !!foundQpr;
  }

  _updateQprData(e: CustomEvent) {
    if (e.detail.confirmed) {
      if (this._duplicateDueDate(this._editedQprDatesSet.due_date)) {
        fireEvent(this.toastMsgLoadingSource, 'toast',
            {text: 'Requirement dates not added, selected Due Date is already in the list.', showCloseBtn: true});
        return;
      }
      if (this._qprDatesSetEditedIndex < 0) {
        // add
        this.push('qprData', this._editedQprDatesSet);
      } else {
        // edit
        this.splice('qprData', this._qprDatesSetEditedIndex, 1, this._editedQprDatesSet);
      }
    }
    this.set('_qprDatesSetEditedIndex', -1);
  }

  _editQprDatesSet(e: CustomEvent) {
    this.set('_qprDatesSetEditedIndex', e.detail.index);
    this.set('_editedQprDatesSet', Object.assign({}, this.qprData[this._qprDatesSetEditedIndex]));
    this.set('addOrModifyQprDialogOpened', true);
  }

  _deleteQprDatesSet(e: CustomEvent) {
    this.splice('qprData', e.detail.index, 1);
  }

  _hideEditedIndexInfo(index: number) {
    return index === -1;
  }

  _getEditedQprDatesSetId(index: number) {
    return (this.$.qprList as QprListEl).getIndex(index, this.qprData.length);
  }

  _saveModifiedQprData() {
    let endpoint = this.getEndpoint('reportingRequirements', {
      intervId: this.interventionId,
      reportType: CONSTANTS.REQUIREMENTS_REPORT_TYPE.QPR
    });
    let dialog = this.$.editQprDialog as EtoolsDialog;
    dialog.startSpinner();
    this.sendRequest({
      method: 'POST',
      endpoint: endpoint,
      body: {reporting_requirements: this.qprData}
    }).then((response: any) => {
      fireEvent(this, 'reporting-requirements-saved', response.reporting_requirements);
      dialog.stopSpinner();
      this.closeQprDialog();
    }).catch((error: any) => {
      logError('Failed to save/update qpr data!', 'edit-qpr-dialog', error);
      parseRequestErrorsAndShowAsToastMsgs(error, this.toastMsgLoadingSource);
      dialog.stopSpinner();
    });
  }

  prepareDatepickerDate(dateStr: string) {
    return prepareDatepickerDate(dateStr);
  }

}

window.customElements.define('edit-qpr-dialog', EditQprDialog);

export {EditQprDialog as EditQprDialogEl};
