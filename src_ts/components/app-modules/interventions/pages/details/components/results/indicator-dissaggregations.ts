import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import 'etools-dropdown/etools-dropdown.js';

import RepeatableDataSetsMixin from '../../../../../../mixins/repeatable-data-sets-mixin';
import { DomRepeatEvent } from '../../../../../../../typings/globals.types';
import { Disaggregation } from '../../../../../../../typings/intervention.types';
import { fireEvent } from '../../../../../../utils/fire-custom-event';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../../../store';
import { gridLayoutStyles } from '../../../../../../styles/grid-layout-styles';
import { SharedStyles } from '../../../../../../styles/shared-styles';
import { repeatableDataSetsStyles } from '../../../../../../styles/repeatable-data-sets-styles';
import { buttonsStyles } from '../../../../../../styles/buttons-styles';
import { isJsonStrMatch } from '../../../../../../utils/utils';
import { property } from '@polymer/decorators';
import { PaperInputElement } from '@polymer/paper-input/paper-input.js';
import { EtoolsDropdownEl } from 'etools-dropdown/etools-dropdown.js';


/**
 * @polymer
 * @customElement
 * @applies MixinRepeatableDataSets
 */
class IndicatorDisaggregations extends connect(store)(RepeatableDataSetsMixin(PolymerElement)) {

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

      </style>
      <div hidden$="[[_isEmptyList(dataItems, dataItems.length)]]">
        <template is="dom-repeat" items="{{dataItems}}">
          <div class="row-h item-container no-h-margin">
            <div class="item-actions-container">
              <div class="actions">
                <paper-icon-button class="action delete"
                                  on-tap="_openDeleteConfirmation"
                                  data-args$="[[index]]"
                                  icon="cancel"></paper-icon-button>
              </div>
            </div>
            <div class="item-content">
              <div class="row-h">
                <div class="col col-4">
                  <etools-dropdown id="disaggregate_by_[[index]]" label="Disaggregate By"
                                  options="{{preDefinedDisaggregtions}}"
                                  selected="{{item.disaggregId}}"
                                  option-value="id"
                                  option-label="name"
                                  trigger-value-change-event
                                  on-etools-selected-item-changed="_onDisaggregationSelected"
                                  disable-on-focus-handling
                                  fit-into="etools-dialog">
                  </etools-dropdown>
                </div>
                <div class="col col-8">
                  <paper-input id="disaggregationGroups_[[index]]" readonly label="Disaggregation Groups"
                              placeholder="&#8212;"></paper-input>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>


      <div class="row-padding-v" hidden$="[[!_isEmptyList(dataItems, dataItems.length)]]">
        <p>There are no disaggregations added.</p>
      </div>

      <div class="row-padding-v">
        <paper-button class="secondary-btn" on-tap="_addNewDisaggregation"
                      title="Add Disaggregation">ADD DISAGGREGATION
        </paper-button>
      </div>

    `;
  }

  @property({type: Array})
  preDefinedDisaggregtions!: Disaggregation[];

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.preDefinedDisaggregtions, state.commonData!.disaggregations)) {
      this.preDefinedDisaggregtions = [...state.commonData!.disaggregations.filter(x => x.active)];
    }
  }

  ready() {
    super.ready();
    this.dataSetModel = {disaggregId: null};
    this.editMode = true;
  }


  _isEmptyList(disaggregations: Disaggregation[], disaggregLength: number) {
    return (!disaggregations || !disaggregLength);
  }

  _addNewDisaggregation() {
    this._addElement();
    fireEvent(this, 'add-new-disaggreg');
  }

  _onDisaggregationSelected(event: DomRepeatEvent) {
    let selectedDisagreg = event.detail.selectedItem;
    if (!selectedDisagreg) {
      return;
    }

    let splitElId = (event.target as EtoolsDropdownEl).id.split('_');
    let index = parseInt(splitElId[splitElId.length - 1]);

    if (this.isAlreadySelected(selectedDisagreg.id, index, 'disaggregId')) {
      if (event.model.item.disaggregId === null) {
        // an extra reset
        event.model.set('item.disaggregId', 0);
      }
      event.model.set('item.disaggregId', null);
      this._clearDisagregGroups(index);
      fireEvent(this, 'show-toast', {error: {response: 'Disaggregation already selected'}});
      return;
    }
    this._displayDisaggregationGroups(selectedDisagreg, index);

  }

  _displayDisaggregationGroups(selectedDisagreg: Disaggregation, index: number){
    this._getDisagregGroupElem(index).value =
        selectedDisagreg.disaggregation_values.map(d => d.value).join('; ');
  }

  _clearDisagregGroups(index: number) {
    this._getDisagregGroupElem(index).value = '';
  }

  _getDisagregGroupElem(index: number) {
    return this.shadowRoot!.querySelector('#disaggregationGroups_' + index) as PaperInputElement;
  }

}

window.customElements.define('indicator-dissaggregations', IndicatorDisaggregations);
