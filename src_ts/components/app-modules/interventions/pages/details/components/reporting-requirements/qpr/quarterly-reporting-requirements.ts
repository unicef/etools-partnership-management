import {PolymerElement, html} from '@polymer/polymer';
import ReportingRequirementsCommonMixin from '../mixins/reporting-requirements-common-mixin';
import CONSTANTS from '../../../../../../../../config/app-constants';
import {buttonsStyles} from '../../../../../../../styles/buttons-styles';
import {gridLayoutStyles} from '../../../../../../../styles/grid-layout-styles';
import GenerateQuarterlyReportingRequirementsMixin from '../mixins/generate-quarterly-reporting-requirements-mixin';

import '@polymer/paper-button/paper-button.js';
import {fireEvent} from '../../../../../../../utils/fire-custom-event';

import './edit-qpr-dialog.js';
import './qpr-list.js';
import {property} from '@polymer/decorators';
import {EditQprDialogEl} from './edit-qpr-dialog.js';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ReportingRequirementsCommonMixin
 * @appliesMixin GenerateQuarterlyReportingRequirementsMixin
 */
class QuarterlyReportingRequirements extends
  GenerateQuarterlyReportingRequirementsMixin(
    ReportingRequirementsCommonMixin(PolymerElement)) {

  static get template() {
    return html`
    ${buttonsStyles} ${gridLayoutStyles}
    <style>
      *[hidden] {
        display: none !important;
      }
    </style>

    <div class="flex-c" hidden$="[[_empty(reportingRequirements)]]">
      <qpr-list qpr-data="[[reportingRequirements]]"></qpr-list>
    </div>

    <div hidden$="[[!_empty(reportingRequirements)]]">
      <div class="row-h">
        There are no quarterly reporting requirements set.
      </div>
      <div class="row-h" hidden$="[[!editMode]]">
        <paper-button class="secondary-btn" on-click="openQuarterlyRepRequirementsDialog">
          Add Requirements
        </paper-button>
      </div>
    </div>
    `;
  }

  @property({type: String})
  interventionStart!: string;

  @property({type: String})
  interventionEnd!: string;

  @property({type: Object})
  editQprDialog!: EditQprDialogEl;

  @property({type: Boolean})
  editMode!: boolean;


  ready() {
    super.ready();
    this._createEditQprDialog();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeEditQprDialog();
  }

  _createEditQprDialog() {
    this.editQprDialog = document.createElement('edit-qpr-dialog') as any;
    this.editQprDialog.set('toastMsgLoadingSource', this);
    this._onReportingRequirementsSaved = this._onReportingRequirementsSaved.bind(this);
    this.editQprDialog.addEventListener('reporting-requirements-saved', this._onReportingRequirementsSaved as any);
    document.querySelector('body')!.appendChild(this.editQprDialog);
  }

  _removeEditQprDialog() {
    if (this.editQprDialog) {
      this.editQprDialog.removeEventListener('reporting-requirements-saved', this._onReportingRequirementsSaved as any);
      document.querySelector('body')!.removeChild(this.editQprDialog);
    }
  }

  openQuarterlyRepRequirementsDialog() {
    if (!this.interventionStart || !this.interventionEnd) {
      fireEvent(this, 'toast', {text: 'You have to fill PD Start Date and End Date first!', showCloseBtn: true});
      return;
    }
    let qprData = [];
    if (this.requirementsCount === 0) {
      qprData = this.generateQPRData(this.interventionStart, this.interventionEnd);
    } else {
      qprData = JSON.parse(JSON.stringify(this.reportingRequirements));
    }
    this.editQprDialog.set('qprData', qprData);
    this.editQprDialog.set('interventionId', this.interventionId);
    this.editQprDialog.openQprDialog();
  }

  _getReportType() {
    return CONSTANTS.REQUIREMENTS_REPORT_TYPE.QPR;
  }

}

window.customElements.define('quarterly-reporting-requirements', QuarterlyReportingRequirements);
export {QuarterlyReportingRequirements as QuarterlyReportingRequirementsEL};
