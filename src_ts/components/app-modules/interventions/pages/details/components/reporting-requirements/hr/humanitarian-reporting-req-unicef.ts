import { fireEvent } from '../../../../../../../utils/fire-custom-event';
import CONSTANTS from '../../../../../../../../config/app-constants';

import '@polymer/paper-button/paper-button.js';

import './edit-hru-dialog.js';
import './hru-list.js';
import { PolymerElement, html } from '@polymer/polymer';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import FrontendPaginationMixin from '../../../../../../../mixins/frontend-pagination-mixin';
import { ExpectedResult } from '../../../../../../../../typings/intervention.types';
import { buttonsStyles } from '../../../../../../../styles/buttons-styles';
import { gridLayoutStyles } from '../../../../../../../styles/grid-layout-styles';
import { property } from '@polymer/decorators';
import { EditHruDialog } from './edit-hru-dialog.js';
import { HruListEl } from './hru-list.js';


/**
 * @customElement
 * @polymer
 * @mixinFunction
 * @appliesMixin ReportingRequirementsCommon
 * @appliesMixin FrontendPagination
 */
class HumanitarianReportingReqUnicef extends
  FrontendPaginationMixin(
    ReportingRequirementsCommonMixin(PolymerElement)) {

  static get template() {
    return html`
    ${buttonsStyles} ${gridLayoutStyles}
    <style>
    :host {
      display: block;
    }
    *[hidden] {
      display: none !important;
    }
  </style>

  <div hidden$="[[!_empty(reportingRequirements)]]">
    <div class="row-h">
      There are no humanitarian report requirements set.
    </div>
    <div class="row-h" hidden$="[[!_showAdd(expectedResults, editMode)]]">
      <paper-button class="secondary-btn" on-click="openUnicefHumanitarianRepReqDialog">
        ADD REQUIREMENTS
      </paper-button>
    </div>
    <div class="row-h" hidden$="[[_thereAreHFIndicators(expectedResults)]]">
      Can be modified only if there are High Frequency Humanitarian Indicators defined.
    </div>
  </div>

  <div class="flex-c" hidden$="[[_empty(reportingRequirements)]]">
    <hru-list id="hruList"
              class="flex-c"
              hru-data="[[dataItems]]"
              disable-sorting
              use-pagination-index>
    </hru-list>
    <etools-data-table-footer
        page-size="[[pagination.pageSize]]"
        page-number="[[pagination.pageNumber]]"
        total-results="[[pagination.totalResults]]"
        on-page-size-changed="_pageSizeChanged"
        on-page-number-changed="_pageNumberChanged">
    </etools-data-table-footer>
  </div>
    `;
  }

  @property({type: Object})
  editHruDialog!: EditHruDialog;

  @property({type: Array})
  expectedResults!: [];

  @property({type: Date})
  interventionStart!: Date;

  @property({type: Boolean})
  editMode!: boolean;


  static get observers() {
    return [
      'setTotalResults(interventionId, reportingRequirements)',
      '_paginationChanged(pagination.pageNumber, pagination.pageSize, reportingRequirements)'
    ];
  }

  ready() {
    super.ready();
    this._createEditHruDialog();
    (this.$.hruList as HruListEl).set('hruMainEl', this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEditHruDialog();
  }

  _createEditHruDialog() {
    this._reportingRequirementsSaved = this._reportingRequirementsSaved.bind(this);
    this.editHruDialog = document.createElement('edit-hru-dialog') as any;
    this.editHruDialog.set('toastMsgLoadingSource', this);
    this.editHruDialog.addEventListener('reporting-requirements-saved', this._reportingRequirementsSaved as any);
    document.querySelector('body')!.appendChild(this.editHruDialog);
  }

  _removeEditHruDialog() {
    if (this.editHruDialog) {
      this.editHruDialog.removeEventListener('reporting-requirements-saved', this._reportingRequirementsSaved as any);
      document.querySelector('body')!.removeChild(this.editHruDialog);
    }
  }

  _reportingRequirementsSaved(e: CustomEvent) {
    this._onReportingRequirementsSaved(e);
    // reset page number
    this.set('pagination.pageNumber', 1);
  }

  _sortRequirementsAsc() {
    this.reportingRequirements.sort((a: string, b: string) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }

  _getReportType() {
    return CONSTANTS.REQUIREMENTS_REPORT_TYPE.HR;
  }

  openUnicefHumanitarianRepReqDialog() {
    if (!this.interventionStart) {
      fireEvent(this, 'toast', {text: 'You have to fill PD Start Date first!', showCloseBtn: true});
      return;
    }
    let hruData = [];
    if (this.requirementsCount > 0) {
      hruData = JSON.parse(JSON.stringify(this.reportingRequirements));
    }
    this.editHruDialog.set('hruData', hruData);
    this.editHruDialog.set('selectedDate', null);
    this.editHruDialog.set('interventionId', this.interventionId);
    this.editHruDialog.set('interventionStart', this.interventionStart);
    this.editHruDialog.openDialog();
  }

  setTotalResults(interventionId: string, reportingRequirements: any) {
    if (typeof interventionId === 'undefined' ||
        typeof reportingRequirements === 'undefined') {
      return;
    }
    this.set('pagination.totalResults', reportingRequirements.length);
  }

  _getIndex(index: number) {
    return ((index + 1) + (this.pagination.pageSize * (this.pagination.pageNumber - 1)));
  }

  _thereAreHFIndicators(expectedResults: ExpectedResult[]) {
    if (!expectedResults) {
      return false;
    }
    let hfIndicator = expectedResults.find((r: any) => {
      return r.ll_results.find((llr: any) => {
        return llr.applied_indicators.find((i: any) => {
          return i.is_active && i.is_high_frequency;
        });
      });
    });
    return hfIndicator ? true : false;
  }

  _showAdd(expectedResults: ExpectedResult[], editMode: boolean) {
    if (!editMode) {
      return false;
    }
    return this._thereAreHFIndicators(expectedResults);
  }

}

window.customElements.define('humanitarian-reporting-req-unicef', HumanitarianReportingReqUnicef);
