import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-button/paper-button.js';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';

import CONSTANTS from '../../../../../../../config/app-constants';
import CommonMixin from '../../../../../../mixins/common-mixin';
import {gridLayoutStyles} from '../../../../../../styles/grid-layout-styles.js';
import {SharedStyles} from '../../../../../../styles/shared-styles.js';
import {buttonsStyles} from '../../../../../../styles/buttons-styles.js';
import '../../../../../../mixins/common-mixin.js';
import './add-ag-amendment-dialog.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../../../store';
import {isJsonStrMatch} from '../../../../../../utils/utils';
import {fireEvent} from '../../../../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import {LabelAndValue} from '../../../../../../../typings/globals.types';
import {AddAgAmendmentDialog} from './add-ag-amendment-dialog.js';

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

      <etools-content-panel panel-title="Amendments ([[dataItems.length]])">
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
            Use the amendment template for documenting changes and signing.
          </div>
          <!-- Download template btn -->
          <a id="download-template-a" target="_blank" href="/static/agreements/amendment_template.docx" download>
            <paper-button id="download-template-btn" class="secondary-btn">
              <iron-icon icon="file-download"></iron-icon>
              Download template
            </paper-button>
          </a>
        </div>

        <div id="amendments-wrapper" hidden$="[[_emptyList(dataItems.length)]]">
          <etools-data-table-header id="listHeader" no-collapse no-title>
            <etools-data-table-column class="col-1">
              Agreement Reference Number
            </etools-data-table-column>
            <etools-data-table-column class="col-4">
              Amendment Type
            </etools-data-table-column>
            <etools-data-table-column class="col-2">
              Signed Date
            </etools-data-table-column>
            <etools-data-table-column class="flex-c">
              Signed Amendment
            </etools-data-table-column>
          </etools-data-table-header>

          <template is="dom-repeat" items="{{dataItems}}">
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <span class="col-data col-1">
                  <template is="dom-if" if="[[item.id]]" restamp>
                    [[item.number]]
                  </template>
                  <template is="dom-if" if="[[!item.id]]" restamp>
                    <etools-info-tooltip class="unsaved-amendment" icon="info-outline" position="right">
                      <span slot="field">Not saved</span>
                      <span slot="message">Use right sidebar 'Save' button to save this amendment</span>
                    </etools-info-tooltip>
                  </template>
                </span>
                <span class="col-data col-4">
                  [[_getReadonlyAmendmentTypes(item.types)]]
                </span>
                <span class="col-data col-2">
                  [[getDateDisplayValue(item.signed_date)]]
                </span>
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
          <p>There are no amendments added.</p>
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

  @property({type: Object})
  _addAgAmendmentDialog!: AddAgAmendmentDialog;

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

  ready() {
    super.ready();
    this._createAddAgAmendmentDialog();
  }

  _createAddAgAmendmentDialog() {
    this.saveNewAmendment = this.saveNewAmendment.bind(this);
    this._addAgAmendmentDialog = document.createElement('add-ag-amendment-dialog') as any;
    this._addAgAmendmentDialog.setAttribute('id', 'addAgAmendmentDialog');
    this._addAgAmendmentDialog.toastEventSource = this;
    this._addAgAmendmentDialog.addEventListener('update-amendment-and-ao', this.saveNewAmendment as any);
    document.querySelector('body')!.appendChild(this._addAgAmendmentDialog);
  }

  _removeAddAgAmendmentDialog() {
    if (this._addAgAmendmentDialog) {
      this._addAgAmendmentDialog.removeEventListener('update-amendment-and-ao', this.saveNewAmendment as any);
      document.querySelector('body')!.removeChild(this._addAgAmendmentDialog);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeAddAgAmendmentDialog();
  }

  _openAddAgAmendmentDialog() {
    if (this._addAgAmendmentDialog) {
      const amendmentTypes = this._getAmendmentTypes(this.agreementType, this._amendmentTypes);
      this._addAgAmendmentDialog.initData(this.authorizedOfficers, this.showAuthorizedOfficers, amendmentTypes);
      this._addAgAmendmentDialog.set('opened', true);
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

  saveNewAmendment(e: CustomEvent) {
    const unsavedAmendment = e.detail.amendment;
    if (unsavedAmendment) {
      this.push('dataItems', unsavedAmendment);

      if (e.detail.ao instanceof Array && e.detail.ao.length > 0) {
        this.set('selectedAo', e.detail.ao);
      }

      fireEvent(this, 'save-agreement');
    }
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
