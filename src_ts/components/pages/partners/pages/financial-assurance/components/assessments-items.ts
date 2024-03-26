/* eslint-disable lit-a11y/anchor-is-valid */
import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';

import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';

import '../../../../../endpoints/endpoints.js';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '../../../../../styles/shared-styles-lit';
import '../../../../../common/components/icons-actions';
import './assessment-dialog.js';
import {etoolsCpHeaderActionsBarStyles} from '../../../../../styles/etools-cp-header-actions-bar-styles-lit';
import {store} from '../../../../../../redux/store';
import {DECREASE_UPLOADS_IN_PROGRESS, INCREASE_UNSAVED_UPLOADS} from '../../../../../../redux/actions/upload-status';
import {PartnerAssessment} from '../../../../../../models/partners.models';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {translate} from 'lit-translate';
import cloneDeep from 'lodash-es/cloneDeep.js';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';

/**
 * @customElement
 * @LitElement
 * @mixinFunction
 * @appliesMixin CommonMixin
 */
@customElement('assessments-items')
export class AssessmentsItems extends CommonMixin(LitElement) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    // language=HTML
    return html`
      ${sharedStyles} ${etoolsCpHeaderActionsBarStyles}
      <style>
        ${dataTableStylesLit} [hidden] {
          display: none !important;
        }

        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          --ecp-header-height: auto;
        }

        .no-assessments-warning {
          padding-top: 0;
        }

        etools-icon {
          color: var(--dark-icon-color);
          margin-inline-end: 8px;
        }

        icons-actions2 {
          visibility: hidden;
        }

        etools-data-table-row:hover icons-actions2 {
          visibility: visible;
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
      <etools-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-content-panel
        panel-title="${translate('OTHER_ASSESSMENTS')} (${this.dataItems?.length})"
        class="content-section"
      >
        <div slot="panel-btns" class="cp-header-actions-bar">
          <sl-switch id="showArchived" ?checked="${this.showArchived}" @sl-change="${this.showArchivedChange}">
            ${translate('SHOW_ARCHIVED')}
          </sl-switch>
          <div class="separator" ?hidden="${!this.editMode}"></div>
          <etools-icon-button
            name="add-box"
            ?disabled="${!this.editMode}"
            ?hidden="${!this.editMode}"
            title="${translate('ADD_OTHER_ASSESSMENT')}"
            @click="${this._addAssessment}"
          >
          </etools-icon-button>
        </div>

        <div ?hidden="${this._emptyList(this.dataItems?.length)}">
          <etools-data-table-header no-collapse no-title .lowResolutionLayout="${this.lowResolutionLayout}">
            <etools-data-table-column class="col-3"> ${translate('ASSESSMENT_TYPE')} </etools-data-table-column>
            <etools-data-table-column class="col-2"> ${translate('DATE_OF_ASSESSMENT')} </etools-data-table-column>
            <etools-data-table-column class="col-5"> ${translate('REPORT')} </etools-data-table-column>
            <etools-data-table-column class="col-2 center-align"> ${translate('ARCHIVED')} </etools-data-table-column>
          </etools-data-table-header>

          ${this.dataItems?.map(
            (item) => html`
              <etools-data-table-row
                .lowResolutionLayout="${this.lowResolutionLayout}"
                secondary-bg-on-hover
                no-collapse
                ?hidden="${!this._isVisible(item.active, this.showArchived)}"
              >
                <div slot="row-data" class="layout-horizontal p-relative">
                  <span class="col-data col-3" data-col-header-label="${translate('ASSESSMENT_TYPE')}">
                    ${translateValue(item.type || '', 'COMMON_DATA.ASSESSMENTTYPES')}
                  </span>
                  <span class="col-data col-2" data-col-header-label="${translate('DATE_OF_ASSESSMENT')}">
                    ${this.getDateDisplayValue(item.completed_date || '')}
                  </span>
                  <span class="col-data col-5" data-col-header-label="${translate('REPORT')}">
                    <etools-icon name="attachment" class="attachment"></etools-icon>
                    <span class="break-word">
                      <!-- target="_blank" is there for IE -->
                      <a href="${item.report_attachment}" target="_blank" download>
                        ${this.getFileNameFromURL(item.report_attachment)}
                      </a>
                    </span>
                  </span>
                  <span
                    class="col-data col-2 ${this.lowResolutionLayout ? '' : 'center-align'}"
                    data-col-header-label="${translate('ARCHIVED')}"
                  >
                    <span ?hidden="${!item.active}" class="placeholder-style">&#8212;</span>
                    <etools-icon name="check" ?hidden="${item.active}"></etools-icon>
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

        <div class="layout-vertical no-assessments-warning" ?hidden="${!this._emptyList(this.dataItems?.length)}">
          <p>${translate('THERE_ARE_NO_ASSESSMENTS_ADDED')}</p>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  dataItems: PartnerAssessment[] = [];

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

  @property({type: Boolean})
  lowResolutionLayout = false;

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
        assessment: cloneDeep(assessment),
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
    if (!e.currentTarget) {
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
