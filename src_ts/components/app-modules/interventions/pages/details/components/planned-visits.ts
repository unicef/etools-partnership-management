import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';

import 'etools-dropdown/etools-dropdown.js';
import '../../../../../layout/etools-form-element-wrapper.js';
import RepeatableDataSetsMixin from '../../../../../mixins/repeatable-data-sets-mixin';
import {DomRepeatEvent} from '../../../../../../typings/globals.types';
import {PlannedVisit} from '../../../../../../typings/intervention.types';
import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles.js';
import {SharedStyles} from '../../../../../styles/shared-styles.js';
import {repeatableDataSetsStyles} from '../../../../../styles/repeatable-data-sets-styles.js';
import {buttonsStyles} from '../../../../../styles/buttons-styles.js';
import {fireEvent} from '../../../../../utils/fire-custom-event.js';
import {property} from '@polymer/decorators';
import {EtoolsDropdownEl} from 'etools-dropdown/etools-dropdown.js';
import {PaperInputElement} from '@polymer/paper-input/paper-input.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin RepeatableDataSetsMixin
 */
class PlannedVisits extends RepeatableDataSetsMixin(PolymerElement) {

  static get template() {
    return html`
     ${gridLayoutStyles} ${SharedStyles} ${repeatableDataSetsStyles} ${buttonsStyles}
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

        paper-input {
          width: 100%;
        }

        etools-form-element-wrapper {
          text-align: center;
          --paper-input-container: {
            text-align: center;
          };
        }

        div.col-1 {
          min-width: 85px;
        }

        div.col-1.yearContainer {
          min-width: 100px;
        }

        .error-msg {
          color: var(--error-color);
          font-size: 12px;

          @apply --layout-vertical;
          @apply --layout-flex;
          @apply --layout-center-justified;
        }

        .no-top-padd {
          padding-top: 0;
        }

        .padd-left-when-items {
          margin-left: 46px;
        }

        .extra-top-padd {
          padding-top: 24px;
        }

        .pv-container {
          @apply --layout-vertical-reverse;
        }

      </style>

      <div class="row-h extra-top-padd" hidden$="[[!editMode]]">
        <paper-button class$="secondary-btn [[_getAddBtnPadding(dataItems.length)]]" on-tap="_addNewPlannedVisit">
          ADD YEAR
        </paper-button>
      </div>

      <div hidden$="[[_emptyList(dataItems.length)]]" class="pv-container">
        <template is="dom-repeat" items="{{dataItems}}">
          <div class="row-h item-container">
            <div class="item-actions-container">
              <div class="actions">
                <paper-icon-button class="action delete"
                                  on-tap="_openDeleteConfirmation"
                                  data-args$="[[index]]"
                                  disabled="[[!_canBeRemoved(index, editMode, item.id)]]"
                                  icon="cancel">
                </paper-icon-button>
              </div>
            </div>
            <div class="item-content">
              <div class="row-h">
                <div class="col col-1 yearContainer">
                  <etools-dropdown id$="year_[[index]]"
                                  class="year"
                                  label="Year"
                                  placeholder="&#8212;"
                                  selected="{{item.year}}"
                                  options="[[years]]"
                                  required
                                  error-message="Required"
                                  trigger-value-change-event
                                  on-etools-selected-item-changed="_yearChanged"
                                  readonly$="[[!editMode]]"
                                  auto-validate>
                  </etools-dropdown>
                </div>
                <div class="col col-1">
                  <paper-input id$="visit_[[index]]_q1"
                              label="Quarter 1"
                              value="{{item.programmatic_q1}}"
                              type="number"
                              min="0"
                              allowed-pattern="[0-9\.]"
                              placeholder="&#8212;"
                              required$="[[item.year]]"
                              error-message="Required"
                              auto-validate
                              readonly$="[[!editMode]]">
                  </paper-input>
                </div>
                <div class="col col-1">
                  <paper-input id$="visit_[[index]]_q2"
                              label="Quarter 2"
                              value="{{item.programmatic_q2}}"
                              type="number"
                              min="0"
                              allowed-pattern="[0-9\.]"
                              placeholder="&#8212;"
                              required$="[[item.year]]"
                              error-message="Required"
                              auto-validate
                              readonly$="[[!editMode]]">
                  </paper-input>
                </div>
                <div class="col col-1">
                  <paper-input id$="visit_[[index]]_q3"
                              label="Quarter 3"
                              value="{{item.programmatic_q3}}"
                              type="number"
                              min="0"
                              allowed-pattern="[0-9\.]"
                              placeholder="&#8212;"
                              required$="[[item.year]]"
                              error-message="Required"
                              auto-validate
                              readonly$="[[!editMode]]">
                  </paper-input>
                </div>
                <div class="col col-1">
                  <paper-input id$="visit_[[index]]_q4"
                              label="Quarter 4"
                              value="{{item.programmatic_q4}}"
                              type="number"
                              min="0"
                              allowed-pattern="[0-9\.]"
                              placeholder="&#8212;"
                              required$="[[item.year]]"
                              error-message="Required"
                              auto-validate
                              readonly$="[[!editMode]]">
                  </paper-input>
                </div>
                <div class="col col-1">
                  <etools-form-element-wrapper label="TOTAL" class="row-second-bg" no-placeholder>
                    [[_getTotal(item.programmatic_q1, item.programmatic_q2, item.programmatic_q3, item.programmatic_q4)]]
                  </etools-form-element-wrapper>

                </div>
                <div class="col col-4"
                    hidden$="[[!_showErrorMsg(item.year, item.programmatic_q1, item.programmatic_q2, item.programmatic_q3, item.programmatic_q4)]]">
                  <div class="error-msg">Total has to be greater than 0</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class$="row-h [[_getNoPVMsgPadding(dataItems.length)]]" hidden$="[[!_emptyList(dataItems.length)]]">
        <p>There are no planned visits added.</p>
      </div>
    `;
  }

  @property({type: Array})
  years: [] = [];

  // @ts-ignore
  @property({type: Boolean, observer: PlannedVisits.prototype._editModeChanged})
  editMode!: boolean;


  static get observers() {
    return [
      '_dataItemsChanged(dataItems)'
    ];
  }

  ready() {
    super.ready();
    this.dataSetModel = new PlannedVisit();
  }

  _getAddBtnPadding(itemsLength: number) {
    return (!itemsLength ? '' : 'padd-left-when-items') + ' planned-visits';
  }
  _getNoPVMsgPadding(itemsLength: number) {
    return (!itemsLength && this.editMode) ? 'no-top-padd' : '';
  }

  _getTotal(q1: string, q2: string, q3: string, q4: string) {
    return (Number(q1) || 0) + (Number(q2) || 0) + (Number(q3) || 0) + (Number(q4) || 0);
  }

  _showErrorMsg(year: string, q1: string, q2: string, q3: string, q4: string) {
    if (!year) {
      return false;
    }
    return !this._getTotal(q1, q2, q3, q4);
  }

  validate() {
    let valid = true;
    this.dataItems.forEach((item: PlannedVisit, index: number) => {
      if (!(this._validateYear(index) && this._validateQuarters(item, index))) {
        valid = false;
      }
    });

    return valid;
  }

  _validateYear(index: number) {
    let valid = true;
    const yearEl = this.shadowRoot!.querySelector('#year_' + index) as EtoolsDropdownEl;

    if (yearEl && !yearEl.validate()) {
      valid = false;
    }
    return valid;
  }

  _validateQuarters(item: PlannedVisit, index: number) {
    let valid = true;
    const q1 = this.shadowRoot!.querySelector('#visit_' + index + '_q1') as PaperInputElement;
    const q2 = this.shadowRoot!.querySelector('#visit_' + index + '_q2') as PaperInputElement;
    const q3 = this.shadowRoot!.querySelector('#visit_' + index + '_q3') as PaperInputElement;
    const q4 = this.shadowRoot!.querySelector('#visit_' + index + '_q4') as PaperInputElement;

    [q1, q2, q3, q4].forEach(function(q) {
      if (q) {
        if (!q.validate()) {
          valid = false;
        }
      }
    });
    if (!this._getTotal(item.programmatic_q1, item.programmatic_q2, item.programmatic_q3, item.programmatic_q4)) {
      valid = false;
    }
    return valid;
  }

  _editModeChanged(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue) {
      this.updateStyles();
    }
  }

  _dataItemsChanged(dataItems: any) {
    if (!Array.isArray(dataItems)) {
      this.set('dataItems', []);
    }
  }

  /**
   * The planned visit row data can be removed only if it doesn't have and id assigned(only if is not saved)
   */
  _canBeRemoved(index: number, editMode: boolean) {
    if (!editMode || !this.dataItems || !this.dataItems.length) {
      return false;
    }
    const plannedVisit = this.dataItems[index];
    const plannedVisitId = parseInt(plannedVisit.id, 10);
    return !(plannedVisitId && isNaN(plannedVisitId) === false && plannedVisitId > 0);
  }

  _yearChanged(event: DomRepeatEvent) {
    const yearSelected = event.detail.selectedItem
      ? event.detail.selectedItem.value
      : null;
    const yearDropdown = this.shadowRoot!.querySelector('#year_' + event.model.index);

    if (this.isAlreadySelected(yearSelected, event.model.index, 'year')) {
      fireEvent(this, 'toast', {text: 'Year already selected on other planned visit item.', showCloseBtn: true});
      this._clearSelectedYear(yearDropdown, event);
    }
  }
  /**
   * Timeout because yearDropdown.selected is set after the execution of _yearChanged method
   */
  _clearSelectedYear(yearDropdown: any, event: DomRepeatEvent) {
    setTimeout(() => {
      if (yearDropdown) {
        yearDropdown.selected = null;
      }
      this.set('dataItems.' + event.model.index + '.year', null);
    });
  }

  /**
   * Validate last added planned visit and if is not empty add a new one
   */
  _addNewPlannedVisit() {
    if (!this.validate()) {
      fireEvent(this, 'toast', {text: 'Already added planned visit data is not valid yet', showCloseBtn: true});
      return;
    }
    this._addElement();
  }

}

window.customElements.define('planned-visits', PlannedVisits);

export {PlannedVisits as PlannedVisitsEl};
