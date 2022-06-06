import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';

import CONSTANTS from '../../../../../../../config/app-constants';
import CommonMixinLit from '../../../../../../common/mixins/common-mixin-lit';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {buttonsStyles} from '../../../../../../styles/buttons-styles-lit';

import './add-ag-amendment-dialog.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../../../redux/store';
import {isJsonStrMatch} from '../../../../../../utils/utils';
import {fireEvent} from '../../../../../../utils/fire-custom-event';
import {isEmptyObject} from '@unicef-polymer/etools-modules-common/dist/utils/utils';

import {LabelAndValue} from '@unicef-polymer/etools-types';
import {openDialog} from '../../../../../../utils/dialog';
import {translate} from 'lit-translate';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 */
@customElement('agreement-amendments')
export class AgreementAmendments extends connect(store)(CommonMixinLit(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      ${sharedStyles} ${buttonsStyles}
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

        #amendments-wrapper {
          margin-top: 16px;
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
          margin: 0 0 0 24px;
          padding: 0;
        }

        #download-template-a {
          display: inherit;
        }

        /* amendment template download section styles end */

        .attachment {
          color: var(--dark-icon-color);
          margin-right: 8px;
        }
        .unsaved-amendment {
          color: var(--warning-color);
        }
      </style>

      <etools-content-panel panel-title="${translate('AMENDMENTS')} (${(this.dataItems || []).length})">
        <div slot="panel-btns">
          <paper-icon-button
            icon="add-box"
            ?hidden="${!this.editMode}"
            ?disabled="${!this.editMode}"
            title="${translate('ADD')}"
            @click="${this._openAddAgAmendmentDialog}"
          >
          </paper-icon-button>
        </div>

        <div id="download-template-wrapper" class="row-h flex-c row-second-bg b-border">
          <!-- Amendments template download -->
          <div id="download-template-msg">
            ${translate('USE_THE_AMENDMENT_TEMPLATE_FOR_DOCUMENTING_CHANGES_AND_SIGNING')}
          </div>
          <!-- Download template btn -->
          <a id="download-template-a" target="_blank" href="/static/agreements/amendment_template.docx" download>
            <paper-button id="download-template-btn" class="secondary-btn">
              <iron-icon icon="file-download"></iron-icon>
              ${translate('DOWNLOAD_TEMPLATE')}
            </paper-button>
          </a>
        </div>

        <div id="amendments-wrapper" ?hidden="${isEmptyObject(this.dataItems)}">
          <etools-data-table-header id="listHeader" no-collapse no-title>
            <etools-data-table-column class="col-1"
              >${translate('AGREEMENT_REFERENCE_NUMBER')}</etools-data-table-column
            >
            <etools-data-table-column class="col-4">${translate('AMENDMENT_TYPE')}</etools-data-table-column>
            <etools-data-table-column class="col-2">${translate('SIGNED_DATE')}</etools-data-table-column>
            <etools-data-table-column class="flex-c">${translate('SIGNED_AMENDMENT')}</etools-data-table-column>
          </etools-data-table-header>

          ${(this.dataItems || []).map(
            (item: any) => html`
              <etools-data-table-row no-collapse>
                <div slot="row-data">
                  <span class="col-data col-1"> ${item.id ? html`${item.number}` : ``} </span>
                  <span class="col-data col-4"
                    >${this._getReadonlyAmendmentTypes(this._amendmentTypes, item.types)}</span
                  >
                  <span class="col-data col-2">${this.getDateDisplayValue(item.signed_date)}</span>
                  <span class="col-data flex-c">
                    <iron-icon icon="attachment" class="attachment"></iron-icon>
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

        <div class="row-h" ?hidden="${!isEmptyObject(this.dataItems)}">
          <p>${translate('THERE_ARE_NO_AMENDMENTS_ADDED')}</p>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: String}) // TODO: check/implement delete option
  _deleteEpName = 'agreementAmendmentsDelete';

  @property({type: String})
  agreementType = '';

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
        agrAuthorizedOfficers: this.authorizedOfficers,
        showAuthorizedOfficers: this.showAuthorizedOfficers,
        amendmentTypes: amendmentTypes
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
