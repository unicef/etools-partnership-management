import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';

import '../../../../../endpoints/endpoints.js';
import CommonMixin from '../../../../../mixins/common-mixin.js';

import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles.js';
import {SharedStyles} from '../../../../../styles/shared-styles.js';
import '../../../../../layout/icons-actions.js';

import './assessment-dialog.js';
import {etoolsCpHeaderActionsBarStyles} from '../../../../../styles/etools-cp-header-actions-bar-styles';
import {store} from '../../../../../../store.js';
import {DECREASE_UPLOADS_IN_PROGRESS, INCREASE_UNSAVED_UPLOADS} from '../../../../../../actions/upload-status.js';
import {property} from '@polymer/decorators';
import {PartnerAssessment} from '../../../../../../models/partners.models.js';
import {AssessmentDialog} from './assessment-dialog.js';
import {IconsActionsEl} from '../../../../../layout/icons-actions.js';
import {fireEvent} from '../../../../../utils/fire-custom-event.js';

/**
 * @customElement
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMixin
 */
class AssessmentsItems extends CommonMixin(PolymerElement) {
  static get template() {
    // language=HTML
    return html`
      ${gridLayoutStyles} ${SharedStyles} ${etoolsCpHeaderActionsBarStyles}
      <style include="data-table-styles">
        [hidden] {
          display: none !important;
        }

        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
        }

        .no-assessments-warning {
          padding-top: 0;
        }

        iron-icon {
          color: var(--dark-icon-color);
          margin-right: 8px;
        }

        icons-actions {
          visibility: hidden;
        }

        etools-data-table-row:hover icons-actions {
          visibility: visible;
        }
      </style>

      <etools-content-panel panel-title="Other Assessments ([[dataItems.length]])" class="content-section">
        <div slot="panel-btns" class="cp-header-actions-bar">
          <paper-toggle-button id="showArchived" checked="{{showArchived}}">
            Show archived
          </paper-toggle-button>
          <div class="separator" hidden$="[[!editMode]]"></div>
          <paper-icon-button
            icon="add-box"
            disabled="[[!editMode]]"
            hidden$="[[!editMode]]"
            title="Add other assessment"
            on-tap="_openAddAssessmentDialog"
          >
          </paper-icon-button>
        </div>

        <div hidden$="[[_emptyList(dataItems.length)]]">
          <etools-data-table-header no-collapse no-title>
            <etools-data-table-column class="col-3">
              Assessment Type
            </etools-data-table-column>
            <etools-data-table-column class="col-2">
              Date of Assessment
            </etools-data-table-column>
            <etools-data-table-column class="col-6">
              Report
            </etools-data-table-column>
            <etools-data-table-column class="col-1 center-align">
              Archived
            </etools-data-table-column>
          </etools-data-table-header>

          <template is="dom-repeat" items="{{dataItems}}">
            <etools-data-table-row
              secondary-bg-on-hover
              no-collapse
              hidden$="[[!_isVisible(item.active, showArchived)]]"
            >
              <div slot="row-data" class="p-relative">
                <span class="col-data col-3">
                  [[item.type]]
                </span>
                <span class="col-data col-2">
                  [[getDateDisplayValue(item.completed_date)]]
                </span>
                <span class="col-data col-6">
                  <iron-icon icon="attachment" class="attachment"></iron-icon>
                  <span class="break-word">
                    <!-- target="_blank" is there for IE -->
                    <a href$="[[item.report_attachment]]" target="_blank" download>
                      [[getFileNameFromURL(item.report_attachment)]]
                    </a>
                  </span>
                </span>
                <span class="col-data col-1 center-align">
                  <span hidden$="[[!item.active]]" class="placeholder-style">&#8212;</span>
                  <iron-icon icon="check" hidden$="[[item.active]]"></iron-icon>
                </span>
                <icons-actions
                  item-id$="[[item.id]]"
                  hidden$="[[!editMode]]"
                  on-edit="_editAssessment"
                  show-delete="[[showDelete]]"
                >
                </icons-actions>
              </div>
            </etools-data-table-row>
          </template>
        </div>

        <div class="row-h no-assessments-warning" hidden$="[[!_emptyList(dataItems.length)]]">
          <p>There are no assessments added.</p>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  dataItems!: PartnerAssessment[];

  @property({type: Number})
  partnerId: number | null = null;

  @property({type: Boolean, reflectToAttribute: true})
  open = true;

  @property({
    type: Boolean,
    reflectToAttribute: true,
    observer: '_editModeChanged'
  })
  editMode!: boolean;

  @property({type: Boolean})
  showArchived = false;

  @property({type: Object})
  assessmentDialog!: AssessmentDialog;

  @property({type: Boolean})
  showDelete = false;

  ready() {
    super.ready();
    this._createAssessmentDialog();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeAssessmentDialog();
  }

  _createAssessmentDialog() {
    this.assessmentDialog = document.createElement('assessment-dialog') as any;
    this.assessmentDialog.setAttribute('id', 'assessmentDialog');
    this.assessmentDialog.toastEventSource = this;

    this.newAssessmentAdded = this.newAssessmentAdded.bind(this);
    this.assessmentUpdated = this.assessmentUpdated.bind(this);
    this.assessmentDialog.addEventListener('assessment-added', this.newAssessmentAdded as any);
    this.assessmentDialog.addEventListener('assessment-updated', this.assessmentUpdated as any);

    document.querySelector('body')!.appendChild(this.assessmentDialog);
  }

  _removeAssessmentDialog() {
    if (this.assessmentDialog) {
      this.assessmentDialog.removeEventListener('assessment-added', this.newAssessmentAdded as any);
      this.assessmentDialog.removeEventListener('assessment-updated', this.assessmentUpdated as any);
      document.querySelector('body')!.removeChild(this.assessmentDialog);
    }
  }

  newAssessmentAdded(e: CustomEvent) {
    this.push('dataItems', e.detail);
    fireEvent(this, 'assessment-added-step2', e.detail);
  }

  assessmentUpdated(e: CustomEvent) {
    const updatedAss = e.detail.after;
    const assessments = JSON.parse(JSON.stringify(this.dataItems));
    const idx = this.dataItems.findIndex((a: any) => a.id === updatedAss.id);
    if (idx > -1) {
      assessments.splice(idx, 1, updatedAss);
    }
    this.set('dataItems', assessments);

    fireEvent(this, 'assessment-updated-step2', e.detail);
  }

  _openAddAssessmentDialog() {
    if (this.assessmentDialog) {
      this.assessmentDialog.initAssessment(null, this.partnerId);
      this.assessmentDialog.opened = true;
    }
  }

  _editAssessment(e: CustomEvent) {
    const assessment = this.dataItems.find(
      (a: any) => a.id === Number((e.target as IconsActionsEl).getAttribute('item-id'))
    );
    this.assessmentDialog.initAssessment(JSON.parse(JSON.stringify(assessment)));
    this.assessmentDialog.opened = true;
  }

  _editModeChanged() {
    this.updateStyles();
  }

  _uploadFinished(e: CustomEvent) {
    store.dispatch({type: DECREASE_UPLOADS_IN_PROGRESS});
    if (e.detail.success) {
      const assessmentIndex = Number((e.target as any).getAttribute('data-args-index')); // TODO - who is e.target
      const uploadResponse = JSON.parse(e.detail.success);
      this.set(['dataItems', assessmentIndex, 'report_attachment'], uploadResponse.id);
      store.dispatch({type: INCREASE_UNSAVED_UPLOADS});
    }
  }

  _isVisible(active: boolean, showArchived: boolean) {
    return active || showArchived;
  }

  _emptyList(length: number) {
    return length === 0;
  }
}

window.customElements.define('assessments-items', AssessmentsItems);
