import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';

import CONSTANTS from '../../../../../../../config/app-constants';
import CommonMixinLit from '../../../../../../common/mixins/common-mixin-lit';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import './add-ag-amendment-dialog.js';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {store, RootState} from '../../../../../../../redux/store';
import {isJsonStrMatch, isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

import {LabelAndValue} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {translate} from 'lit-translate';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';

/**
 * @LitElement
 * @customElement
 * @appliesMixin CommonMixin
 */
@customElement('agreement-amendments')
export class AgreementAmendments extends connect(store)(CommonMixinLit(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }
  render() {
    return html`
      ${sharedStyles}
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
        }

        .file-wrapper {
          width: 100%;
          max-width: 100%;
        }

        :host(:not([edit-mode])) #amendments-wrapper {
          margin-bottom: 24px;
        }

        /* amendment template download section styles start */
        #download-template-msg {
          max-width: calc(100% - 210px);
        }

        #download-template-btn {
          max-width: 220px;
          margin: 0;
          margin-inline-start: 24px;
          padding: 0;
          --sl-input-height-medium: 24px;
        }
        #download-template-btn::part(label) {
          font-size: var(--etools-font-size-14, 14px);
          font-weight: 600;
        }
        etools-icon[name='file-download'] {
          --etools-icon-font-size: var(--etools-font-size-20, 20px);
          vertical-align: middle;
          margin-inline-end: 5px;
        }

        /* amendment template download section styles end */

        .attachment {
          color: var(--dark-icon-color);
          margin-inline-end: 8px;
        }
        .unsaved-amendment {
          color: var(--warning-color);
        }
        .row.row-second-bg.b-border,
        .row.no-data {
          margin: 0;
          padding: 16px 11px;
        }
      </style>
      <etools-media-query
        query="(max-width: 1000px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-content-panel panel-title="${translate('AMENDMENTS')} (${(this.dataItems || []).length})">
        <div slot="panel-btns">
          <etools-icon-button
            name="add-box"
            ?hidden="${!this.editMode}"
            ?disabled="${!this.editMode}"
            title="${translate('GENERAL.ADD')}"
            @click="${this._openAddAgAmendmentDialog}"
          >
          </etools-icon-button>
        </div>

        <div id="download-template-wrapper" class="row row-second-bg b-border">
          <!-- Amendments template download -->
          <div id="download-template-msg" class="col-md-5 col-12">
            ${translate('USE_THE_AMENDMENT_TEMPLATE_FOR_DOCUMENTING_CHANGES_AND_SIGNING')}
          </div>
          <!-- Download template btn -->
          <etools-button
            class="col-md-7 col-12"
            id="download-template-btn"
            variant="text"
            target="_blank"
            href="/static/agreements/amendment_template.docx"
            download
          >
            <etools-icon name="file-download"></etools-icon>
            ${translate('DOWNLOAD_TEMPLATE')}
          </etools-button>
        </div>

        <div id="amendments-wrapper" ?hidden="${isEmptyObject(this.dataItems)}">
          <etools-data-table-header
            id="listHeader"
            no-collapse
            no-title
            .lowResolutionLayout="${this.lowResolutionLayout}"
          >
            <etools-data-table-column class="col-1"
              >${translate('AGREEMENT_REFERENCE_NUMBER')}</etools-data-table-column
            >
            <etools-data-table-column class="col-4">${translate('AMENDMENT_TYPE')}</etools-data-table-column>
            <etools-data-table-column class="col-2">${translate('SIGNED_DATE')}</etools-data-table-column>
            <etools-data-table-column class="col-5">${translate('SIGNED_AMENDMENT')}</etools-data-table-column>
          </etools-data-table-header>

          ${(this.dataItems || []).map(
            (item: any) => html`
              <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
                <div slot="row-data">
                  <span class="col-data col-1" data-col-header-label="${translate('AGREEMENT_REFERENCE_NUMBER')}">
                    ${item.id ? html`${item.number}` : ``}
                  </span>
                  <span class="col-data col-4" data-col-header-label="${translate('AMENDMENT_TYPE')}"
                    >${this._getReadonlyAmendmentTypes(this._amendmentTypes, item.types)}</span
                  >
                  <span class="col-data col-2" data-col-header-label="${translate('SIGNED_DATE')}"
                    >${this.getDateDisplayValue(item.signed_date)}</span
                  >
                  <span class="col-data col-5" data-col-header-label="${translate('SIGNED_AMENDMENT')}">
                    <etools-icon name="attachment" class="attachment"></etools-icon>
                    <span class="break-word">
                      <!-- target="_blank" is there for IE -->
                      ${item.id
                        ? html` <a href="${item.signed_amendment_attachment}" target="_blank" download
                            >${this.getFileNameFromURL(item.signed_amendment_attachment)}</a
                          >`
                        : ``}
                      ${!item.id ? html`<span>${item.signed_amendment?.name}</span>` : ``}
                    </span>
                  </span>
                </div>
              </etools-data-table-row>
            `
          )}
        </div>

        <div class="row no-data" ?hidden="${!isEmptyObject(this.dataItems)}">
          <p class="col-12">${translate('THERE_ARE_NO_AMENDMENTS_ADDED')}</p>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: String}) // TODO: check/implement delete option
  _deleteEpName = 'agreementAmendmentsDelete';

  @property({type: String})
  agreementType = '';

  @property({type: String})
  agreementStart!: string;

  @property({type: Array})
  _amendmentTypes: LabelAndValue[] = [];

  @property({type: Object})
  legacyAmendmentTypes: {[key: string]: string} = {
    'CP extension': 'Extension of Country Programme Cycle'
  };

  @property({type: Array})
  authorizedOfficers: [] = [];

  @property({type: Boolean})
  showAuthorizedOfficers = false;

  @property({type: Array})
  dataItems: any[] = [];

  @property({type: Boolean})
  editMode = false;

  @property({type: Boolean})
  lowResolutionLayout = false;

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this._amendmentTypes, state.commonData!.agreementAmendmentTypes)) {
      this._amendmentTypes = state.commonData!.agreementAmendmentTypes;
    }
  }

  _openAddAgAmendmentDialog() {
    const amendmentTypes = this._getAmendmentTypes(this.agreementType, this._amendmentTypes);
    openDialog({
      dialog: 'add-ag-amendment-dialog',
      dialogData: {
        allStaffMembers: this.authorizedOfficers,
        showAuthorizedOfficers: this.showAuthorizedOfficers,
        amendmentTypes: amendmentTypes,
        agreementStart: this.agreementStart
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return;
      }
      this.fireSaveAmendment(response);
    });
  }

  fireSaveAmendment(data: any) {
    const unsavedAmendment = data.amendment;
    if (unsavedAmendment) {
      fireEvent(this, 'save-amendment', {amendment: unsavedAmendment, ao: data.ao});
    }
  }

  _getAmendmentTypes(agreementType: any, _amendmentTypes: any) {
    if (
      [CONSTANTS.AGREEMENT_TYPES.PCA, CONSTANTS.AGREEMENT_TYPES.SSFA].indexOf(agreementType) === -1 ||
      !(_amendmentTypes instanceof Array && _amendmentTypes.length > 0)
    ) {
      return [];
    }

    if (agreementType === CONSTANTS.AGREEMENT_TYPES.SSFA) {
      return _amendmentTypes.filter((type) => type.value === 'Change authorized officer');
    }
    return _amendmentTypes;
  }

  _getReadonlyAmendmentTypes(amendmentTypes: LabelAndValue[], types: any) {
    if (amendmentTypes instanceof Array && types instanceof Array && types.length > 0) {
      const legacyAmTypesFiltered = [];
      let amTypesFiltered = [];

      // search for item amendments types
      const amTypes = amendmentTypes.filter((t: any) => types.indexOf(t.value) > -1);

      if (amTypes.length) {
        // map to get the labels
        amTypesFiltered = amTypes.map((t: any) => t.label);
      }

      for (const key in this.legacyAmendmentTypes) {
        if (types.indexOf(key) > -1) {
          const value = this.legacyAmendmentTypes[key];
          legacyAmTypesFiltered.push(value);
        }
      }

      return amTypesFiltered.concat(legacyAmTypesFiltered).join(' | ');
    }
    return null;
  }
}
