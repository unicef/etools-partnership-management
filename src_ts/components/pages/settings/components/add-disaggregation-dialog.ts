import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';

import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import RepeatableDataSetsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/repeatable-data-sets-mixin';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {actionIconBtnsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/action-icon-btns-styles';

import {connect} from 'pwa-helpers/connect-mixin';
import {store} from '../../../../redux/store';
import {addDisaggregation} from '../../../../redux/actions/common-data';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {Disaggregation, DisaggregationValue} from '@unicef-polymer/etools-types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {translate} from 'lit-translate';
import pmpEdpoints from '../../../endpoints/endpoints';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/icon-button/icon-button.js';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin RepeatableDataSetsMixinMixin
 */

@customElement('add-disaggregation-dialog')
export class AddDisaggregationDialog extends connect(store)(
  CommonMixin(RepeatableDataSetsMixin(EndpointsLitMixin(LitElement)))
) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    // language=HTML
    return html`
      ${sharedStyles} ${actionIconBtnsStyles}
      <style>
        paper-input {
          width: 100%;
        }

        .groups {
          align-items: center;
          flex-wrap: wrap;
          margin-top: -9px;
        }

        .newGroup {
          width: 85px;
          padding-inline-end: 6px;
        }

        .newGroup:not(:first-of-type) {
          padding-inline-start: 10px;
        }

        .action.delete.no-padding {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          height: 20px;
        }

        .extra-padd {
          padding-top: 12px !important;
          padding-bottom: 12px !important;
        }

        .secondary-btn {
          padding-top: 10px !important;
        }

        .group-label {
          padding-top: 9px !important;
        }
      </style>

      <etools-dialog
        keep-dialog-open
        id="etoolsDialog"
        size="lg"
        ok-btn-text="${translate('GENERAL.SAVE')}"
        dialog-title="${translate('ADD_DISAGGREGATION')}"
        ?disable-confirm-btn="${this.disableConfirmBtn}"
        @confirm-btn-clicked="${this._validateAndSaveDisaggregation}"
        @close="${this._onClose}"
        ?show-spinner="${this.disableConfirmBtn}"
      >
        <div class="layout-horizontal flex-c row-padding-v extra-padd">
          <div class="col col-4">
            <etools-input
              id="disaggregateByEl"
              label="${translate('DISAGGREGATION')}"
              .value="${this.disaggregation.name}"
              @value-changed="${({detail}: CustomEvent) => {
                this.disaggregation.name = detail.value;
                this.requestUpdate();
              }}"
              required
              auto-validate
              error-message="${translate('PLEASE_ADD_DISAGGREGATION')}"
              placeholder="&#8212;"
            >
            </etools-input>
          </div>
          <div class="col col-8">
            <div class="layout-vertical">
              <label class="paper-label group-label">${translate('DISAGGREGATION_GROUP')}</label>
              <div class="layout-horizontal groups">
                ${(this.data || []).map(
                  (item: any, index) => html`
                    <etools-input
                      class="newGroup"
                      no-label-float
                      placeholder="${translate('NEW_GROUP')}"
                      .value="${item.value}"
                      required
                      error-message="${translate('REQUIRED')}"
                      auto-validate
                      @value-changed="${({detail}: CustomEvent) => {
                        this.data[index].value = detail.value;
                        this.requestUpdate();
                      }}"
                    >
                    </etools-input>
                    <sl-icon-button
                      class="action delete"
                      name="x-circle-fill"
                      ?hidden="${index < 2}"
                      @click="${(event: CustomEvent) => this._openDeleteConfirmation(event, index)}"
                      ?data-args="${index}"
                      title="${translate('GENERAL.DELETE')}"
                    >
                    </sl-icon-button>
                  `
                )}
                <sl-button
                  variant="text"
                  class="primary-btn no-pad"
                  @click="${this._addNewGroup}"
                  title="${translate('ADD_DISAGGREGATION_GROUP')}"
                  >+${translate('GENERAL.ADD')}
                </sl-button>
              </div>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  disaggregation!: Partial<Disaggregation>;

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
    // Must have at least 2 groups
    this.data = [
      {
        value: undefined,
        active: true
      },
      {
        value: undefined,
        active: true
      }
    ];
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

  _addNewGroup() {
    if (!this.editMode) {
      return;
    }
    this.data.push({value: ''});
    this.data = [...this.data];
  }

  _validateAndSaveDisaggregation() {
    if (!this.validate()) {
      return;
    }
    this.disableConfirmBtn = true;
    const requestParams = {
      method: 'POST',
      endpoint: this.getEndpoint(pmpEdpoints, 'disaggregations'),
      body: this._getBody()
    };
    return sendRequest(requestParams)
      .then((response: any) => {
        this.disaggregation = response;
        store.dispatch(addDisaggregation(response));
        this.broadcastAddDisaggregToOtherTabs(response);
        this.disableConfirmBtn = false;
        this._onClose();
      })
      .catch((error: any) => {
        this.disableConfirmBtn = false;
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      });
  }

  _getBody() {
    this.disaggregation.disaggregation_values = this.data;
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
    const validName = (this.shadowRoot!.querySelector('#disaggregateByEl') as PaperInputElement).validate();
    let validGroups = true;
    const groupsElems = this.shadowRoot!.querySelectorAll('.newGroup') as unknown as PaperInputElement[];
    groupsElems.forEach((g: PaperInputElement) => (validGroups = g.validate() && validGroups));
    return validName && validGroups;
  }

  resetValidations() {
    (this.shadowRoot!.querySelector('#disaggregateByEl') as PaperInputElement).invalid = false;
  }
}

export {AddDisaggregationDialog as AddDisaggregationDialogEl};
