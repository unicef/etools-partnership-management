import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

import EndpointsMixin from '../../../endpoints/endpoints-mixin.js';
import RepeatableDataSetsMixin from '../../../common/mixins/repeatable-data-sets-mixin.js';

import {gridLayoutStyles} from '../../../styles/grid-layout-styles';
import {buttonsStyles} from '../../../styles/buttons-styles';
import {SharedStyles} from '../../../styles/shared-styles';
import {requiredFieldStarredStyles} from '../../../styles/required-field-styles';
import {connect} from 'pwa-helpers/connect-mixin';
import {store} from '../../../../redux/store';
import {addDisaggregation} from '../../../../redux/actions/common-data';
import {actionIconBtnsStyles} from '../../../styles/action-icon-btns-styles';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {property} from '@polymer/decorators/lib/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {Disaggregation, DisaggregationValue} from '@unicef-polymer/etools-types';
import {fireEvent} from '../../../utils/fire-custom-event';
import CommonMixin from '../../../common/mixins/common-mixin';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin RepeatableDataSetsMixinMixin
 */
class AddDisaggregationDialog extends connect(store)(
  CommonMixin(RepeatableDataSetsMixin(EndpointsMixin(PolymerElement)))
) {
  static get template() {
    // language=HTML
    return html`
      ${gridLayoutStyles} ${buttonsStyles} ${SharedStyles} ${requiredFieldStarredStyles} ${actionIconBtnsStyles}
      <style>
        paper-input {
          width: 100%;
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
          }
        }
      </style>

      <etools-dialog
        keep-dialog-open
        id="etoolsDialog"
        size="lg"
        ok-btn-text="[[_getTranslation('GENERAL.SAVE')]]"
        dialog-title="[[_getTranslation('ADD_DISAGGREGATION')]]"
        disable-confirm-btn="[[disableConfirmBtn]]"
        opened
        on-confirm-btn-clicked="_validateAndSaveDisaggregation"
        on-close="_onClose"
      >
        <div class="layout-horizontal flex-c row-padding-v">
          <div class="col col-4">
            <paper-input
              id="disaggregateByEl"
              label="[[_getTranslation('DISAGGREGATION')]]"
              value="{{disaggregation.name}}"
              required
              auto-validate
              error-message="[[_getTranslation('PLEASE_ADD_DISAGGREGATION')]]"
              placeholder="&#8212;"
            >
            </paper-input>
          </div>
          <div class="col col-8">
            <div class="layout-vertical">
              <label class="paper-label">[[_getTranslation('DISAGGREGATION_GROUP')]]</label>
              <div class="layout-horizontal groups">
                <template is="dom-repeat" items="[[dataItems]]">
                  <paper-input
                    class="newGroup"
                    no-label-float
                    label="[[_getTranslation('NEW_GROUP')]]"
                    value="{{item.value}}"
                  >
                  </paper-input>
                  <paper-icon-button
                    class="action delete no-padding"
                    icon="cancel"
                    on-tap="_openDeleteConfirmation"
                    data-args$="[[index]]"
                    title="[[_getTranslation('GENERAL.DELETE')]]"
                  >
                  </paper-icon-button>
                </template>
                <paper-button
                  class="secondary-btn"
                  on-tap="_addNewGroup"
                  title="[[_getTranslation('ADD_DISAGGREGATION_GROUP')]]"
                  >+[[_getTranslation('GENERAL.ADD')]]
                </paper-button>
              </div>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object, observer: '_disaggregationChanged'})
  disaggregation!: Partial<Disaggregation>;

  @property({type: Array})
  dataItems!: [];

  @property({type: Boolean})
  disableConfirmBtn = false;

  set dialogData(_data: any) {
    this.editMode = true;
    this.dataSetModel = {
      value: null,
      active: true
    };
    this.disaggregation = {
      name: '',
      active: true,
      disaggregation_values: []
    };
  }

  broadcastAddDisaggregToOtherTabs(disaggregation: Disaggregation) {
    localStorage.setItem(
      'update-redux',
      JSON.stringify({
        type: 'ADD_DISAGGREGATION',
        disaggregation: disaggregation
      })
    );
    localStorage.removeItem('update-redux');
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  startSpinner() {
    this.disableConfirmBtn = true;
    (this.$.etoolsDialog as EtoolsDialog).startSpinner();
  }

  stopSpinner() {
    this.disableConfirmBtn = false;
    (this.$.etoolsDialog as EtoolsDialog).stopSpinner();
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
    const requestParams = {
      method: 'POST',
      endpoint: this.getEndpoint('disaggregations'),
      body: this._getBody()
    };
    return sendRequest(requestParams)
      .then((response: any) => {
        this.disaggregation = response;
        store.dispatch(addDisaggregation(response));
        this.broadcastAddDisaggregToOtherTabs(response);
        this.stopSpinner();
        this._onClose();
      })
      .catch((error: any) => {
        this.stopSpinner();
        parseRequestErrorsAndShowAsToastMsgs(error, this);
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
    return value === null || typeof value === 'undefined' || value === '';
  }

  validate() {
    return (this.shadowRoot!.querySelector('#disaggregateByEl') as PaperInputElement).validate();
  }

  resetValidations() {
    (this.shadowRoot!.querySelector('#disaggregateByEl') as PaperInputElement).invalid = false;
  }
}

window.customElements.define('add-disaggregation-dialog', AddDisaggregationDialog);
export {AddDisaggregationDialog as AddDisaggregationDialogEl};
