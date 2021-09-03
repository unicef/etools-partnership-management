/* eslint-disable lit-a11y/anchor-is-valid */
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';

import CONSTANTS from '../../../../../../../config/app-constants';
import CommonMixin from '../../../../../../mixins/common-mixin';
import {gridLayoutStyles} from '../../../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../../../styles/shared-styles';
import {buttonsStyles} from '../../../../../../styles/buttons-styles';
import '../../../../../../mixins/common-mixin.js';
import './add-ag-amendment-dialog.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../../../redux/store';
import {isJsonStrMatch} from '../../../../../../utils/utils';
import {fireEvent} from '../../../../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import {openDialog} from '../../../../../../utils/dialog';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 */
class AgreementAmendments extends connect(store)(CommonMixin(PolymerElement)) {
  static get template() {
    return html`
      ${gridLayoutStyles} ${SharedStyles} ${buttonsStyles}
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

      <etools-content-panel panel-title="[[_getTranslation('AMENDMENTS')]] ([[dataItems.length]])">
        <div slot="panel-btns">
          <paper-icon-button
            icon="add-box"
            hidden$="[[!editMode]]"
            disabled$="[[!editMode]]"
            title="Add"
            on-click="_openAddAgAmendmentDialog"
          >
          </paper-icon-button>
        </div>

        <div id="download-template-wrapper" class="row-h flex-c row-second-bg b-border">
          <!-- Amendments template download -->
          <div id="download-template-msg">
            [[_getTranslation('USE_THE_AMENDMENT_TEMPLATE_FOR_DOCUMENTING_CHANGES_AND_SIGNING')]]
          </div>
          <!-- Download template btn -->
          <a id="download-template-a" target="_blank" href="/static/agreements/amendment_template.docx" download>
            <paper-button id="download-template-btn" class="secondary-btn">
              <iron-icon icon="file-download"></iron-icon>
              [[_getTranslation('DOWNLOAD_TEMPLATE')]]
            </paper-button>
          </a>
        </div>

        <div id="amendments-wrapper" hidden$="[[_emptyList(dataItems.length)]]">
          <etools-data-table-header id="listHeader" no-collapse no-title>
            <etools-data-table-column class="col-1"
              >[[_getTranslation('AGREEMENT_REFERENCE_NUMBER')]]</etools-data-table-column
            >
            <etools-data-table-column class="col-4">[[_getTranslation('AMENDMENT_TYPE')]]</etools-data-table-column>
            <etools-data-table-column class="col-2">[[_getTranslation('SIGNED_DATE')]]</etools-data-table-column>
            <etools-data-table-column class="flex-c">[[_getTranslation('SIGNED_AMENDMENT')]]</etools-data-table-column>
          </etools-data-table-header>

          <template is="dom-repeat" items="{{dataItems}}">
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <span class="col-data col-1">
                  <template is="dom-if" if="[[item.id]]" restamp>[[item.number]]</template>
                  <template is="dom-if" if="[[!item.id]]" restamp>
                    <etools-info-tooltip class="unsaved-amendment" icon="info-outline" position="right">
                      <span slot="field">[[_getTranslation('NOT_SAVED')]]</span>
                      <span slot="message"
                        >[[_getTranslation('USE_RIGHT_SIDEBAR_SAVE_BTN_TO_SAVE_THIS_AMENDMENT')]]</span
                      >
                    </etools-info-tooltip>
                  </template>
                </span>
                <span class="col-data col-4">[[_getReadonlyAmendmentTypes(item.types)]]</span>
                <span class="col-data col-2">[[getDateDisplayValue(item.signed_date)]]</span>
                <span class="col-data flex-c">
                  <iron-icon icon="attachment" class="attachment"></iron-icon>
                  <span class="break-word">
                    <!-- target="_blank" is there for IE -->
                    <template is="dom-if" if="[[item.id]]" restamp>
                      <a href$="[[item.signed_amendment_attachment]]" target="_blank" download
                        >[[getFileNameFromURL(item.signed_amendment_attachment)]]</a
                      >
                    </template>
                    <template is="dom-if" if="[[!item.id]]" restamp>
                      <span>[[item.signed_amendment.name]]</span>
                    </template>
                  </span>
                </span>
              </div>
            </etools-data-table-row>
          </template>
        </div>

        <div class="row-h" hidden$="[[!_emptyList(dataItems.length)]]">
          <p>[[_getTranslation('THERE_ARE_NO_AMENDMENTS_ADDED')]]</p>
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

  @property({type: Array, notify: true})
  selectedAo: [] = [];

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
        authorizedOfficers: this.authorizedOfficers,
        showAuthorizedOfficers: this.showAuthorizedOfficers,
        amendmentTypes: amendmentTypes
      }
    }).then(({confirmed, response}) => {
      if (!confirmed || !response) {
        return;
      }
      this.saveNewAmendment(response);
    });
  }

  saveNewAmendment(data: any) {
    const unsavedAmendment = data.amendment;
    if (unsavedAmendment) {
      this.push('dataItems', unsavedAmendment);

      if (data.ao instanceof Array && data.ao.length > 0) {
        this.set('selectedAo', data.ao);
      }

      fireEvent(this, 'save-agreement');
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

  _getReadonlyAmendmentTypes(types: any) {
    if (types instanceof Array && types.length > 0) {
      const legacyAmTypesFiltered = [];
      let amTypesFiltered = [];

      // search for item amendments types
      const amTypes = this._amendmentTypes.filter((t: any) => types.indexOf(t.value) > -1);

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

  _emptyList(listLength: number) {
    return listLength === 0;
  }
}

window.customElements.define('agreement-amendments', AgreementAmendments);
