/* eslint-disable lit-a11y/anchor-is-valid */
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';

import '../../../../../endpoints/endpoints.js';
import CommonMixin from '../../../../../mixins/common-mixin.js';

import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../../styles/shared-styles';
import '../../../../../layout/icons-actions';
import './assessment-dialog.js';
import {etoolsCpHeaderActionsBarStyles} from '../../../../../styles/etools-cp-header-actions-bar-styles';
import {store} from '../../../../../../redux/store';
import {DECREASE_UPLOADS_IN_PROGRESS, INCREASE_UNSAVED_UPLOADS} from '../../../../../../redux/actions/upload-status';
import {property} from '@polymer/decorators';
import {PartnerAssessment} from '../../../../../../models/partners.models';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {openDialog} from '../../../../../utils/dialog';

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

        icons-actions2 {
          visibility: hidden;
        }

        etools-data-table-row:hover icons-actions2 {
          visibility: visible;
        }

        paper-toggle-button#showArchived {
          font-size: 16px;
          --paper-toggle-button-label-color: var(--primary-text-color);
          --paper-toggle-button-checked-bar-color: var(--primary-color);
        }
      </style>

      <etools-content-panel
        panel-title="[[_getTranslation('OTHER_ASSESSMENTS')]] ([[dataItems.length]])"
        class="content-section"
      >
        <div slot="panel-btns" class="cp-header-actions-bar">
          <paper-toggle-button id="showArchived" checked="{{showArchived}}">
            [[_getTranslation('SHOW_ARCHIVED')]]
          </paper-toggle-button>
          <div class="separator" hidden$="[[!editMode]]"></div>
          <paper-icon-button
            icon="add-box"
            disabled="[[!editMode]]"
            hidden$="[[!editMode]]"
            title="[[_getTranslation('ADD_OTHER_ASSESSMENT')]]"
            on-tap="_addAssessment"
          >
          </paper-icon-button>
        </div>

        <div hidden$="[[_emptyList(dataItems.length)]]">
          <etools-data-table-header no-collapse no-title>
            <etools-data-table-column class="col-3"> [[_getTranslation('ASSESSMENT_TYPE')]] </etools-data-table-column>
            <etools-data-table-column class="col-2">
              [[_getTranslation('DATE_OF_ASSESSMENT')]]
            </etools-data-table-column>
            <etools-data-table-column class="col-5"> [[_getTranslation('REPORT')]] </etools-data-table-column>
            <etools-data-table-column class="col-2 center-align">
              [[_getTranslation('ARCHIVED')]]
            </etools-data-table-column>
          </etools-data-table-header>

          <template is="dom-repeat" items="{{dataItems}}">
            <etools-data-table-row
              secondary-bg-on-hover
              no-collapse
              hidden$="[[!_isVisible(item.active, showArchived)]]"
            >
              <div slot="row-data" class="p-relative">
                <span class="col-data col-3"> [[item.type]] </span>
                <span class="col-data col-2"> [[getDateDisplayValue(item.completed_date)]] </span>
                <span class="col-data col-5">
                  <iron-icon icon="attachment" class="attachment"></iron-icon>
                  <span class="break-word">
                    <!-- target="_blank" is there for IE -->
                    <a href$="[[item.report_attachment]]" target="_blank" download>
                      [[getFileNameFromURL(item.report_attachment)]]
                    </a>
                  </span>
                </span>
                <span class="col-data col-2 center-align">
                  <span hidden$="[[!item.active]]" class="placeholder-style">&#8212;</span>
                  <iron-icon icon="check" hidden$="[[item.active]]"></iron-icon>
                </span>
                <icons-actions2
                  item-id$="[[item.id]]"
                  hidden$="[[!editMode]]"
                  on-edit="_editAssessment"
                  show-delete="[[showDelete]]"
                >
                </icons-actions2>
              </div>
            </etools-data-table-row>
          </template>
        </div>

        <div class="row-h no-assessments-warning" hidden$="[[!_emptyList(dataItems.length)]]">
          <p>[[_getTranslation('THERE_ARE_NO_ASSESSMENTS_ADDED')]]</p>
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

  @property({type: Boolean})
  showDelete = false;

  newAssessmentAdded(data: any) {
    this.push('dataItems', data.detail);
    fireEvent(this, 'assessment-added-step2', data.detail);
  }

  assessmentUpdated(data: any) {
    const updatedAss = data.detail.after;
    const assessments = JSON.parse(JSON.stringify(this.dataItems));
    const idx = this.dataItems.findIndex((a: any) => a.id === updatedAss.id);
    if (idx > -1) {
      assessments.splice(idx, 1, updatedAss);
    }
    this.set('dataItems', assessments);

    fireEvent(this, 'assessment-updated-step2', data.detail);
  }

  _addAssessment() {
    this._openAssessmentDialog(null, this.partnerId);
  }

  _editAssessment(e: CustomEvent) {
    const assessment = this.dataItems.find((a: any) => a.id === Number((e.target as Element).getAttribute('item-id')));
    this._openAssessmentDialog(JSON.parse(JSON.stringify(assessment)));
  }

  _openAssessmentDialog(assessment: any, partnerId?: any) {
    openDialog({
      dialog: 'assessment-dialog',
      dialogData: {
        assessment: assessment,
        partnerId: partnerId
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return;
      }
      if (response.action === 'assessment-added') {
        this.newAssessmentAdded(response);
      } else if (response.action === 'assessment-updated') {
        this.assessmentUpdated(response);
      }
    });
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
