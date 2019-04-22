import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import {DynamicDialogMixin} from 'etools-dialog/dynamic-dialog-mixin.js';
import CommonMixin from '../../../../../../mixins/common-mixin.js';

import 'etools-content-panel/etools-content-panel.js';
import 'etools-data-table/etools-data-table.js';

import './add-amendment-dialog.js';
import { SharedStyles } from '../../../../../../styles/shared-styles.js';
import { gridLayoutStyles } from '../../../../../../styles/grid-layout-styles.js';
import { fireEvent } from '../../../../../../utils/fire-custom-event.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../../../store.js';
import { setInAmendment } from '../../../../../../../actions/page-data.js';
import { isJsonStrMatch } from '../../../../../../utils/utils.js';
import { LabelAndValue } from '../../../../../../../typings/globals.types.js';
import {property} from '@polymer/decorators';
import {AddAmendmentDialog} from "./add-amendment-dialog";


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ReduxInAmendmentMixin
 * @appliesMixin EtoolsMixins.DynamicDialogMixin
 * @appliesMixin Common
 */
class PdAmendments extends connect(store)(DynamicDialogMixin(CommonMixin(PolymerElement))) {
  static get template() {
    return html`
    ${SharedStyles} ${gridLayoutStyles}
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
      .attachment {
        color: var(--dark-icon-color);
        margin-right: 8px;
      }
      .file-label {
        width: calc(100% - 32px);
      }
      /* for IE */
      .other-description {
        display: block;
        width: 100%;
      }
    </style>

    <etools-content-panel panel-title="Amendments">
      <template is="dom-if" if="[[editMode]]">
        <div slot="panel-btns">
          <paper-icon-button icon="add-box"
                            title="Add Amendment"
                            on-tap="_showAddAmendmentDialog">
          </paper-icon-button>
        </div>
      </template>
      <div class="p-relative" id="amendments-wrapper">
        <etools-data-table-header id="listHeader"
                                  no-collapse
                                  no-title
                                  hidden$="[[_emptyList(amendments.length)]]">
          <etools-data-table-column class="col-1">
            Ref #
          </etools-data-table-column>
          <etools-data-table-column class="col-2">
            Signed Date
          </etools-data-table-column>
          <etools-data-table-column class="col-2">
            Amendment Types
          </etools-data-table-column>
          <etools-data-table-column class="col-2">
            Signed Amendment
          </etools-data-table-column>
          <etools-data-table-column class="flex-c">
            Internal / PRC Reviews
          </etools-data-table-column>
          <etools-data-table-column class="flex-c">
            Other Info
          </etools-data-table-column>
        </etools-data-table-header>

        <template is="dom-repeat" items="[[amendments]]">
          <etools-data-table-row no-collapse>
            <div slot="row-data">
              <span class="col-data col-1">
                [[item.amendment_number]]
              </span>
              <span class="col-data col-2">
                [[getDateDisplayValue(item.signed_date)]]
              </span>
              <span class="col-data col-2">
                [[_getReadonlyAmendmentTypes(item.types)]]
              </span>
              <span class="col-data col-2">
                <iron-icon icon="attachment" class="attachment"></iron-icon>
                <span class="break-word file-label">
                  <!-- target="_blank" is there for IE -->
                  <a href$="[[item.signed_amendment_attachment]]" target="_blank" download>
                    [[getFileNameFromURL(item.signed_amendment_attachment)]]
                  </a>
                </span>
              </span>
              <span class="col-data flex-c">
                <span hidden$="[[item.internal_prc_review]]" class="placeholder-style">&#8212;</span>
                <iron-icon icon="attachment" class="attachment" hidden$="[[!item.internal_prc_review]]"></iron-icon>
                <span class="break-word file-label">
                  <!-- target="_blank" is there for IE -->
                  <a href$="[[item.internal_prc_review]]" target="_blank" download>
                    [[getFileNameFromURL(item.internal_prc_review)]]
                  </a>
                </span>
              </span>
              <div class="col-data flex-c break-word">
                <span hidden$="[[_showOtherInput(item.types, item.types.length, index)]]"
                      class="placeholder-style">&#8212;</span>
                <template is="dom-if" if="[[_showOtherInput(item.types, item.types.length, index)]]">
                  <div class="other-description">
                    [[item.other_description]]
                  </div>
                </template>
              </div>
            </div>
          </etools-data-table-row>
        </template>
        <template is="dom-if" if="[[_emptyList(amendments.length)]]">
          <div class="row-h">
            <p>There are no amendments added.</p>
          </div>
        </template>
      </div>
    </etools-content-panel>
    `;
  }

  @property({type: Array, notify: true})
  amendments: [] = [];

  @property({type: Array})
  filteredAmendmentTypes!: LabelAndValue[];

  @property({type: Array})
  amendmentTypes!: LabelAndValue[];

  @property({type: String})
  interventionDocumentType: string = '';

  @property({type: Boolean})
  inAmendment: boolean = false;

  @property({type: Object})
  addAmendmentDialog!: AddAmendmentDialog;

  @property({type: Boolean, reflectToAttribute: true})
  editMode: boolean = false;

  @property({type: Number})
  interventionId: number | null = null;

  static get observers() {
    return [
      '_dataHasChanged(amendments)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.amendmentTypes, state.commonData!.interventionAmendmentTypes)) {
      this.amendmentTypes = [...state.commonData!.interventionAmendmentTypes];
    }

    if (this.inAmendment !== state.pageData!.in_amendment) {
      this.inAmendment = state.pageData!.in_amendment;
    }
  }

  ready() {
    super.ready();
    this._createAddAmendmentDialog();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeAddAmendmentDialog();
  }

  _createAddAmendmentDialog() {
    this.addAmendmentDialog = document.createElement('add-amendment-dialog') as any;
    this.addAmendmentDialog.setAttribute('id', 'addAmendmentDialog');
    this.addAmendmentDialog.toastEventSource = this;

    this.newAmendmentAdded = this.newAmendmentAdded.bind(this);
    this.addAmendmentDialog.addEventListener('amendment-added', this.newAmendmentAdded as any);
    document.querySelector('body')!.appendChild(this.addAmendmentDialog);
  }

  _removeAddAmendmentDialog() {
    if (this.addAmendmentDialog) {
      this.addAmendmentDialog.removeEventListener('amendment-added', this.newAmendmentAdded as any);
      document.querySelector('body')!.removeChild(this.addAmendmentDialog);
    }
  }

  _getReadonlyAmendmentTypes(types: string[]) {
    if (!types || !types.length) {
      return null;
    }
    let amdTypes = this.amendmentTypes.filter((t: LabelAndValue) => {
      return types.indexOf(t.value) > -1;
    });
    if (amdTypes.length) {
      let amdTypesLabels = amdTypes.map((t: LabelAndValue) => {
        return t.label;
      });
      return amdTypesLabels.join(', ');
    }
    return null;
  }

  _showAddAmendmentDialog() {
    if (this.addAmendmentDialog) {
      this.addAmendmentDialog.opened = true;
      this.addAmendmentDialog.interventionId = this.interventionId;
      this.addAmendmentDialog.interventionDocumentType = this.interventionDocumentType;
    }
  }

  newAmendmentAdded(event: CustomEvent) {
    event.stopImmediatePropagation();
    let data = event.detail;
    this._unlockInterventionDetailsFields();
    this.push('amendments', data);
    store.dispatch(setInAmendment(true));
    fireEvent(this, 'new-amendment-added');
  }

  _dataHasChanged(amendments: any) {
    if (amendments instanceof Array === false) {
      this.set('amendments', []);
    }
  }

  _unlockInterventionDetailsFields() {
    if (!this.inAmendment) {
      // we need the new permissions for ammendment mode;
      // after the permissions are updated, the fields will automatically unlock
      fireEvent(this, 'refresh-intervention-permissions');
    }
  }

  _showOtherInput(selectedAmdTypes: string[], _selectedAmdTypesLength: number) {
    if (!selectedAmdTypes || !selectedAmdTypes.length) {
      return false;
    }
    return selectedAmdTypes.indexOf('other') > -1;
  }

  _emptyList(listLength: number) {
    return listLength === 0;
  }
}

window.customElements.define('pd-amendments', PdAmendments);
