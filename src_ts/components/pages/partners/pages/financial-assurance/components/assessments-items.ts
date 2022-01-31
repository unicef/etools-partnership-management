/* eslint-disable lit-a11y/anchor-is-valid */
import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@unicef-polymer/etools-data-table/etools-data-table';

import '../../../../../endpoints/endpoints.js';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../../../../styles/shared-styles-lit';
import '../../../../../common/components/icons-actions';
import './assessment-dialog.js';
import {etoolsCpHeaderActionsBarStyles} from '../../../../../styles/etools-cp-header-actions-bar-styles-lit';
import {store} from '../../../../../../redux/store';
import {DECREASE_UPLOADS_IN_PROGRESS, INCREASE_UNSAVED_UPLOADS} from '../../../../../../redux/actions/upload-status';
import {PartnerAssessment} from '../../../../../../models/partners.models';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {openDialog} from '../../../../../utils/dialog';
import {translate} from 'lit-translate';

/**
 * @customElement
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMixin
 */
@customElement('assessments-items')
export class AssessmentsItems extends CommonMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    // language=HTML
    return html`
      ${sharedStyles} ${etoolsCpHeaderActionsBarStyles}
      <style>
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
        *[slot='row-data'] {
          margin-top: 12px;
          margin-bottom: 12px;
        }
        div[slot='row-data'] {
          position: relative;
          padding: 12px 0;
          margin: 0;
        }
        *[slot='row-data'] .col-data {
          display: inline-flex;
          line-height: 24px;
          align-items: center;
        }
        a {
          color: var(--list-primary-color, #0099ff);
        }
      </style>

      <etools-content-panel
        panel-title="${translate('OTHER_ASSESSMENTS')} (${this.dataItems.length})"
        class="content-section"
      >
        <div slot="panel-btns" class="cp-header-actions-bar">
          <paper-toggle-button
            id="showArchived"
            ?checked="${this.showArchived}"
            @iron-change="${this.showArchivedChange}"
          >
            ${translate('SHOW_ARCHIVED')}
          </paper-toggle-button>
          <div class="separator" ?hidden="${!this.editMode}"></div>
          <paper-icon-button
            icon="add-box"
            ?disabled="${!this.editMode}"
            ?hidden="${!this.editMode}"
            title="${translate('ADD_OTHER_ASSESSMENT')}"
            @click="${this._addAssessment}"
          >
          </paper-icon-button>
        </div>

        <div ?hidden="${this._emptyList(this.dataItems.length)}">
          <etools-data-table-header no-collapse no-title>
            <etools-data-table-column class="col-3"> ${translate('ASSESSMENT_TYPE')} </etools-data-table-column>
            <etools-data-table-column class="col-2"> ${translate('DATE_OF_ASSESSMENT')} </etools-data-table-column>
            <etools-data-table-column class="col-5"> ${translate('REPORT')} </etools-data-table-column>
            <etools-data-table-column class="col-2 center-align"> ${translate('ARCHIVED')} </etools-data-table-column>
          </etools-data-table-header>

          ${this.dataItems.map(
            (item) => html`
              <etools-data-table-row
                secondary-bg-on-hover
                no-collapse
                ?hidden="${!this._isVisible(item.active, this.showArchived)}"
              >
                <div slot="row-data" class="layout-horizontal p-relative">
                  <span class="col-data col-3"> ${item.type || ''} </span>
                  <span class="col-data col-2"> ${this.getDateDisplayValue(item.completed_date || '')} </span>
                  <span class="col-data col-5">
                    <iron-icon icon="attachment" class="attachment"></iron-icon>
                    <span class="break-word">
                      <!-- target="_blank" is there for IE -->
                      <a href="${item.report_attachment}" target="_blank" download>
                        ${this.getFileNameFromURL(item.report_attachment)}
                      </a>
                    </span>
                  </span>
                  <span class="col-data col-2 center-align">
                    <span ?hidden="${!item.active}" class="placeholder-style">&#8212;</span>
                    <iron-icon icon="check" ?hidden="${item.active}"></iron-icon>
                  </span>
                  <icons-actions2
                    item-id="${item.id}"
                    ?hidden="${!this.editMode}"
                    @edit="${this._editAssessment}"
                    .showDelete="${this.showDelete}"
                  >
                  </icons-actions2>
                </div>
              </etools-data-table-row>
            `
          )}
        </div>

        <div class="row-h no-assessments-warning" ?hidden="${!this._emptyList(this.dataItems.length)}">
          <p>${translate('THERE_ARE_NO_ASSESSMENTS_ADDED')}</p>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  dataItems!: PartnerAssessment[];

  @property({type: Number})
  partnerId: number | null = null;

  @property({type: Boolean, reflect: true})
  open = true;

  _editMode!: boolean;

  set editMode(editMode) {
    this._editMode = editMode;
  }

  @property({type: Boolean, reflect: true})
  get editMode() {
    return this._editMode;
  }

  @property({type: Boolean})
  showArchived = false;

  @property({type: Boolean})
  showDelete = false;

  newAssessmentAdded(data: any) {
    this.dataItems.push(data.detail);
    this.dataItems = [...this.dataItems];
    fireEvent(this, 'assessment-added-step2', data.detail);
  }

  assessmentUpdated(data: any) {
    const updatedAss = data.detail.after;
    const assessments = JSON.parse(JSON.stringify(this.dataItems));
    const idx = this.dataItems.findIndex((a: any) => a.id === updatedAss.id);
    if (idx > -1) {
      assessments.splice(idx, 1, updatedAss);
    }
    this.dataItems = assessments;

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

  _uploadFinished(e: CustomEvent) {
    store.dispatch({type: DECREASE_UPLOADS_IN_PROGRESS});
    if (e.detail.success) {
      const assessmentIndex = Number((e.target as any).getAttribute('data-args-index')); // TODO - who is e.target
      const uploadResponse = JSON.parse(e.detail.success);
      this.dataItems[assessmentIndex].report_attachment = uploadResponse.id;
      store.dispatch({type: INCREASE_UNSAVED_UPLOADS});
    }
  }

  showArchivedChange(e: CustomEvent) {
    if (!e.detail) {
      return;
    }
    this.showArchived = (e.currentTarget as HTMLInputElement).checked;
  }

  _isVisible(active: boolean, showArchived: boolean) {
    return active || showArchived;
  }

  _emptyList(length: number) {
    return length === 0;
  }
}
