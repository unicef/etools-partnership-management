import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-button/paper-button.js';
import moment from 'moment';
import 'etools-dialog/etools-dialog.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import 'etools-data-table/etools-data-table.js';
import 'etools-date-time/calendar-lite';
import 'etools-date-time/datepicker-lite.js';
import './hru-list.js';
import CONSTANTS from '../../../../../../../../config/app-constants.js';
import { fireEvent } from '../../../../../../../utils/fire-custom-event.js';
import { gridLayoutStyles } from '../../../../../../../styles/grid-layout-styles.js';
import { buttonsStyles } from '../../../../../../../styles/buttons-styles.js';
import { requiredFieldStarredStyles } from '../../../../../../../styles/required-field-styles.js';
import DateMixin from '../../../../../../../mixins/date-mixin.js';
import EndpointsMixin from '../../../../../../../endpoints/endpoints-mixin.js';
import AjaxErrorsParserMixin from '../../../../../../../mixins/ajax-errors-parser-mixin.js';
import { isEmptyObject } from '../../../../../../../utils/utils.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { store } from '../../../../../../../../store.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsDataReduxStore
 * @appliesMixin DateMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxErrorsParser
 */
class EditHruDialog extends connect(store)(EtoolsMixinFactory.combineMixins([
  DateMixin,
  EndpointsMixin,
  AjaxErrorsParserMixin
], PolymerElement)) {
  [x: string]: any;

  static get template() {
    return html`
    ${gridLayoutStyles} ${buttonsStyles} ${requiredFieldStarredStyles}
    <style include="data-table-styles">
      *[hidden] {
        display: none !important;
      }

      #add-selected-date {
        display: inline-block;
        width: auto;
        margin-top: 24px;
        padding-right: 0;
      }

      .start-date {
        padding-bottom: 24px;
        max-width: 300px;
      }
    </style>

    <etools-dialog id="editHruDialog"
                  size="lg"
                  dialog-title="Add/Edit Dates for Humanitarian Report - UNICEF"
                  on-confirm-btn-clicked="_saveHurData"
                  ok-btn-text="Save"
                  keep-dialog-open
                  hidden$="[[datePickerOpen]]"
                  spinner-text="Saving...">
      <div class="start-date">
      <datepicker-lite id="dtPickerStDate"
                        label="Select start date"
                        value="{{repStartDate}}"
                        required
                        min-date="[[minDate]]"
                        auto-validate
                        open="{{datePickerOpen}}"
                        no-init show-clear-btn>
      </datepicker-lite>
      </div>
      <div>
        Use the date picker to select end dates of humanitarian report requirements.
      </div>

      <div class="layout-horizontal row-padding-v">
        <div class="col layout-vertical col-6">
          <calendar-lite id="datepicker"
                                    date="[[prepareDatepickerDate(selectedDate)]]"
                                    pretty-date="{{selectedDate}}"
                                    format="YYYY-MM-DD"></calendar-lite>

          <paper-button id="add-selected-date" class="secondary-btn" on-click="_addToList">
            Add Selected Date to List
          </paper-button>
        </div>
        <div class="col col-6">
          <div class="row-h" hidden$="[[!_empty(hruData.length)]]">No dates added.</div>
          <hru-list id="hruList"
                    class="flex-c"
                    with-scroll
                    hru-data="[[hruData]]"
                    hidden$="[[_empty(hruData.length)]]"
                    edit-mode
                    in-amendment="[[inAmendment]]"
                    on-delete-hru="_deleteHruDate">
          </hru-list>
        </div>
      </div>

    </etools-dialog>
    `;
  }

  static get properties() {
    return {
      interventionId: Number,
      interventionStart: {
        type: Date
      },
      inAmendment: {
        type: Boolean,
        statePath: 'pageData.in_amendment'
      },
      repStartDate: {
        type: Date
      },
      minDate: Date,
      selectedDate: String,
      hruData: {
        type: Array,
        value: []
      },
      toastMsgLoadingSource: Object,
      _hruEditedIndex: {
        type: Number,
        value: -1
      },
      datePickerOpen: {
        type: Boolean,
        value: false
      }
    };
  }

  static get observers() {
    return [
      'intervDataChanged(interventionStart, interventionId)'
    ];
  }

  intervDataChanged() {
    this.minDate = this._getMinDate();
  }

  _getMinDate() {
    if (!this.interventionStart) {
      return null;
    }
    let stDt = this._convertDate(this.interventionStart);
    if (stDt) {
      return moment(stDt).add(-1, 'days').toDate();
    }
    return null;
  }

  _setDefaultStartDate() {
    if (isEmptyObject(this.hruData)) {
      this.repStartDate = this.interventionStart;
    } else {
      this.repStartDate = this._getSavedStartDate();
    }
  }
  _getSavedStartDate() {
    this.hruData.sort((a: any, b: any) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });

    return this.hruData[0].start_date;
  }

  openDialog() {
    this._setDefaultStartDate();
    this.$.editHruDialog.opened = true;
  }

  closeDialog() {
    this.$.editHruDialog.opened = false;
  }

  _empty(listLength: number) {
    return listLength === 0 || !listLength;
  }

  _addToList() {
    let alreadySelected = this.hruData.find((d: any) => d.end_date === this.selectedDate);
    if (alreadySelected) {
      fireEvent(this.toastMsgLoadingSource, 'toast',
          {text: 'This date is already added to the list.', showCloseBtn: true});
      return;
    }
    this.push('hruData', {end_date: this.selectedDate, due_date: this._oneDayAfterEndDate(this.selectedDate)});
  }

  _oneDayAfterEndDate(endDt: string) {
    return moment(endDt).add(1, 'days').format('YYYY-MM-DD');
  }

  _deleteHruDate(e: CustomEvent) {
    this.splice('hruData', e.detail.index, 1);
  }

  _hideEditedIndexInfo(index: number) {
    return index === -1;
  }

  updateStartDates(startDate: any) {
    if (isEmptyObject(this.hruData)) {
      return;
    }

    this.set('hruData.0.start_date', startDate);

    this._calculateStartDateForTheRestOfItems();
  }

  _calculateStartDateForTheRestOfItems() {
    let i;
    for (i = 1; i < this.hruData.length; i++) {
      this.set('hruData.' + i + '.start_date', this._computeStartDate(i));
    }
  }

  _computeStartDate(i: number) {
    return moment(this.hruData[i-1].end_date).add(1, 'days').format('YYYY-MM-DD');
  }

  _saveHurData() {
    this.updateStartDates(this.repStartDate);

    let endpoint = this.getEndpoint('reportingRequirements', {
      intervId: this.interventionId,
      reportType: CONSTANTS.REQUIREMENTS_REPORT_TYPE.HR
    });
    let dialog = this.$.editHruDialog;
    dialog.startSpinner();
    this.sendRequest({
      method: 'POST',
      endpoint: endpoint,
      body: {reporting_requirements: this.hruData}
    }).then((response: any) => {
      fireEvent(this, 'reporting-requirements-saved', response.reporting_requirements);
      dialog.stopSpinner();
      this.closeDialog();
    }).catch((error: any) => {
      this.logError('Failed to save/update HR data!', 'edit-hru-dialog', error);
      this.parseRequestErrorsAndShowAsToastMsgs(error, this.toastMsgLoadingSource);
      dialog.stopSpinner();
    });
  }

}

window.customElements.define('edit-hru-dialog', EditHruDialog);
