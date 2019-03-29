import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import 'etools-dialog/etools-dialog.js';
import EtoolsAjaxRequestMixin from 'etools-ajax/etools-ajax-request-mixin.js';

import EndpointsMixin from '../../../endpoints/endpoints-mixin.js';
import RepeatableDataSetsMixin from '../../../mixins/repeatable-data-sets-mixin.js';

import { gridLayoutStyles } from '../../../styles/grid-layout-styles.js';
import {buttonsStyles} from '../../../styles/buttons-styles';
import { SharedStyles } from '../../../styles/shared-styles.js';
import { requiredFieldStarredStyles } from '../../../styles/required-field-styles.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store} from '../../../../store';
import {addDisaggregation} from '../../../../actions/common-data';
import { actionIconBtnsStyles } from '../../../styles/action-icon-btns-styles.js';
import {Disaggregation, DisaggregationValue} from '../../../../typings/intervention.types';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../utils/ajax-errors-parser.js';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsAjaxRequestMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin RepeatableDataSetsMixin
 */
class AddDisaggregationDialog extends connect(store)(EtoolsAjaxRequestMixin(EndpointsMixin(RepeatableDataSetsMixin(PolymerElement)))) {

  static get template() {
    // language=HTML
    return html`
        ${gridLayoutStyles} ${buttonsStyles} ${SharedStyles} ${requiredFieldStarredStyles}
        ${actionIconBtnsStyles}
      <style>
        paper-input {
          width: 100%
        }

        .groups {
          align-items: center;
          flex-wrap: wrap;
          width: 520px; /* For IE */
        }

        .newGroup {
          width: 80px;
        }

        .action.delete.no-padding {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          height: 20px;
        }

        etools-dialog paper-input.newGroup {
          --paper-input-container: {
            padding: 0 0 !important;
          };
        }

      </style>

      <etools-dialog keep-dialog-open id="etoolsDialog" size="lg" ok-btn-text="Save"
                     dialog-title="Add Disaggregation" disable-confirm-btn="[[disableConfirmBtn]]"
                     on-confirm-btn-clicked="_validateAndSaveDisaggregation">
        <div class="layout-horizontal flex-c row-padding-v">
          <div class="col col-4">
            <paper-input id="disaggregateByEl" label="Disaggregation" value="{{disaggregation.name}}"
                         required auto-validate error-message="Please add disaggregation" placeholder="&#8212;">
            </paper-input>
          </div>
          <div class="col col-8">
            <div class="layout-vertical">
              <label class="paper-label">Disaggregation Group</label>
              <div class="layout-horizontal groups">
                <template is="dom-repeat" items="[[dataItems]]">
                  <paper-input class="newGroup" no-label-float
                               label="New Group"
                               value="{{item.value}}">
                  </paper-input>
                  <paper-icon-button class="action delete no-padding" icon="cancel"
                                     on-tap="_openDeleteConfirmation"
                                     data-args$="[[index]]"
                                     title="Delete">
                  </paper-icon-button>
                </template>
                <paper-button class="secondary-btn" on-tap="_addNewGroup"
                              title="Add Disaggregation Group">+Add
                </paper-button>
              </div>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  static get properties() {
    return {
      disaggregation: {
        type: Object,
        observer: '_disaggregationChanged'
      },
      dataItems: {
        type: Array
      },
      toastEventSource: {
        type: Object
      },
      disableConfirmBtn: {
        type: Boolean,
        value: false
      }
    };
  }

  ready() {
    super.ready();
    this.dataSetModel = {
      value: null,
      active: true
    };
    this.editMode = true;
  }

  broadcastAddDisaggregToOtherTabs(disaggregation: Disaggregation) {
    localStorage.setItem('update-redux', JSON.stringify({
      type: 'ADD_DISAGGREGATION',
      disaggregation: disaggregation
    }));
    localStorage.removeItem('update-redux');
  }

  initializeDisaggregation() {
    this.disaggregation = new Disaggregation();
  }

  open() {
    this.$.etoolsDialog.opened = true;
  }

  close() {
    this.$.etoolsDialog.opened = false;
  }

  startSpinner() {
    this.disableConfirmBtn = true;
    this.$.etoolsDialog.startSpinner();
  }

  stopSpinner() {
    this.disableConfirmBtn = false;
    this.$.etoolsDialog.stopSpinner();
  }

  _disaggregationChanged(disaggreg: Disaggregation) {
    this.set('dataItems', disaggreg.disaggregation_values);
    if (!this.dataItems) {
      this.dataItems = [];
    }
  }

  _addNewGroup() {
    this._addElement();
  }

  _validateAndSaveDisaggregation() {
    if (!this.validate()) {
      return;
    }
    this.startSpinner();
    let self = this;
    let requestParams = {
      method: 'POST',
      endpoint: this.getEndpoint('disaggregations'),
      body: this._getBody()
    };
    this.sendRequest(requestParams).then(function(response: any) {
      self.disaggregation = response;
      store.dispatch(addDisaggregation(response));
      self.broadcastAddDisaggregToOtherTabs(response);
      self.stopSpinner();
      self.close();
    }).catch(function(error: any) {
      self.stopSpinner();
      parseRequestErrorsAndShowAsToastMsgs(error, self.toastEventSource);
    });

  }

  _getBody() {
    this.disaggregation.disaggregation_values = this.dataItems;
    this._cleanUpDisaggregations(this.disaggregation.disaggregation_values);
    return this.disaggregation;
  }

  _cleanUpDisaggregations(disaggregs: DisaggregationValue[]) {
    if (!disaggregs || !disaggregs.length) {
      return;
    }

    let i;
    for (i = 0; i < disaggregs.length; i++) {
      if (disaggregs[i] !== undefined && this._isEmpty(disaggregs[i].value)) {
        disaggregs.splice(i, 1);
      }
    }
  }

  _isEmpty(value: any) {
    return (value === null || typeof value === 'undefined' || value === '');
  }

  validate() {
    return this.shadowRoot.querySelector('#disaggregateByEl').validate();
  }

  resetValidations() {
    this.shadowRoot.querySelector('#disaggregateByEl').invalid = false;
  }

}

window.customElements.define('add-disaggregation-dialog', AddDisaggregationDialog);
