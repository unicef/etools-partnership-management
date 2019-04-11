import { PolymerElement, html } from '@polymer/polymer';
import CommonMixin from '../../../../../mixins/common-mixin';
import { fireEvent } from '../../../../../utils/fire-custom-event';
import { MinimalAgreement } from '../../../../agreements/agreement.types';
import { gridLayoutStyles } from '../../../../../styles/grid-layout-styles';
import { SharedStyles } from '../../../../../styles/shared-styles';
import { requiredFieldStarredStyles } from '../../../../../styles/required-field-styles';
import { store, RootState } from '../../../../../../store';
import { connect } from 'pwa-helpers/connect-mixin';
import { isJsonStrMatch, copy } from '../../../../../utils/utils';
import { csoPartnersSelector } from '../../../../../../reducers/partners';
import CONSTANTS from '../../../../../../config/app-constants';
import { IdAndName } from '../../../../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 */
class AgreementSelector extends connect(store)((CommonMixin(PolymerElement)) as any){
  [x: string]: any;

  static get template() {
    return html`
    ${gridLayoutStyles} ${SharedStyles} ${requiredFieldStarredStyles}
    <style>
        #agreement-selector-content {
          padding: 0;
        }

        .no-left-padding {
          padding-left: 0 !important;
        }
      </style>
      <div id="agreement-selector-content" class="row-h flex-c">
        <template is="dom-if" if="[[!permissions.edit.agreement]]">
          <div class="col col-6">
            <etools-form-element-wrapper label="Partner Organization"
                                        required
                                        value="[[intervention.partner]]">
            </etools-form-element-wrapper>
          </div>
          <div class="col col-3">
            <etools-form-element-wrapper label="Partner Vendor Number"
                                        value="[[intervention.partner_vendor]]">
            </etools-form-element-wrapper>
          </div>
          <div class="col col-3">
            <etools-form-element-wrapper label="Agreement"
                                        required
                                        value="[[selectedAgreement.agreement_number_status]]">
            </etools-form-element-wrapper>
          </div>
        </template>

        <template is="dom-if" if="[[permissions.edit.agreement]]">
          <div class="col col-6 no-left-padding">
            <etools-dropdown id="partner"
                            label="Partner Organization"
                            placeholder="&#8212;"
                            options="[[partnersDropdownData]]"
                            option-value="id"
                            option-label="name"
                            selected="{{partnerId}}"
                            required$="[[permissions.required.agreement]]"
                            auto-validate
                            error-message="Partner is required">
            </etools-dropdown>
          </div>
          <div class="col col-2">
            <etools-form-element-wrapper label="Partner Vendor Number"
                                        value="[[intervention.partner_vendor]]">
            </etools-form-element-wrapper>
          </div>

          <div class="col flex-c">
            <etools-dropdown id="agreements"
                            label="Agreement"
                            placeholder="&#8212;"
                            options="[[filteredAgreements]]"
                            option-value="id"
                            option-label="agreement_number_status"
                            selected="{{agreementId}}"
                            required$="[[permissions.required.agreement]]"
                            auto-validate
                            error-message="Agreement required">
            </etools-dropdown>

          </div>
        </template>
      </div>
    `;
  }

  static get properties() {
    return {
      agreementId: {
        type: Number,
        observer: '_agreementIdChanged',
        notify: true
      },
      filteredAgreements: {
        type: Array,
        value: []
      },
      partnersDropdownData: {
        type: Array,
        statePath: 'csoPartners', // 'setPartnersDropdown' Do we need to use only CSO type partners?
        observer: '_partnersDropdownDataChanged'
      },
      agreements: {
        type: Array,
        statePath: 'agreementsList',
        // Covers issues on refresh when agreements is populated after the rest of the observers run
        observer: '_agreementsChanged'
      },
      partnerId: {
        type: Number,
        notify: true,
        observer: '_partnerSelected'
      },
      selectedAgreement: {
        type: Object,
        value: null,
        notify: true
      },
      intervention: Object,
      permissions: {
        type: Object,
        statePath: 'pageData.permissions'
      }
    };
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.agreements, state.agreements!.list)) {
      this.agreements = [...state.agreements!.list];
    }
    if (!isJsonStrMatch(this.partnersDropdownData, csoPartnersSelector(state))) {
      this.partnersDropdownData = [...csoPartnersSelector(state)];
    }
    if (!isJsonStrMatch(this.permissions, state.pageData!.permissions)) {
      this.permissions = copy(state.pageData!.permissions);
    }
  }

  _partnersDropdownDataChanged(partnersDropdownData: IdAndName[]) {
    if (typeof partnersDropdownData === 'undefined') {
      return;
    }
    this._setSelectedPartnerId();
  }

  _agreementsChanged() {
    if (this.selectedAgreement) {
      return;
    }
    this._agreementIdChanged(this.agreementId);
  }

  _agreementIdChanged(agreementId: number) {
    if (!this.agreements || !this.agreements.length || !agreementId) {
      return;
    }

    let agreement = this.agreements.find((agreement: any) => {
      return agreement.id === agreementId;
    });
    this.set('selectedAgreement', agreement);

    if (this.intervention && this.permissions && !this.permissions.edit.agreement) {
      // in case agreement selector is in readonly mode we need to set partner id to trigger staff members request
      this.set('partnerId', agreement.partner);
    }

    if (this.partnersDropdownData && this.partnersDropdownData.length) {
      this._setSelectedPartnerId();
    }
  }

  _setSelectedPartnerId() {
    let agreement = this.selectedAgreement;
    if (!agreement || !agreement.partner || this.partnerId === agreement.partner) {
      return;
    }
    let partner = this.partnersDropdownData.find((partner: IdAndName) => {
      return partner.id === agreement.partner;
    });
    if (!partner) {
      let partnerIsHiddenOrNotCSOMsg = 'Intervention partner ' + agreement.partner_name +
          ' is not CSO or it\'s hidden! In edit mode you will not be able to see this partner in the ' +
          'available partners organizations and nor the agreement number.';
      fireEvent(this, 'toast', {text: partnerIsHiddenOrNotCSOMsg, showCloseBtn: true});
      return;
    }
    this.set('partnerId', partner.id);
  }

  _filterAgreements(partnerId: number) {
    if (!partnerId) {
      this.set('filteredAgreements', []);
      return;
    }

    if (this.selectedAgreement && this.selectedAgreement.partner !== partnerId) {
      this.set('selectedAgreement', null);
      this.set('agreementId', null);
    }

    // set filtered agreements based on this
    let agreements = this.agreements.filter((agreement: MinimalAgreement) => {
          if (this.intervention) {
            // existing intervention
            return agreement.partner === partnerId
                && agreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.MOU;
          } else {
            // new intervention
            return agreement.partner === partnerId &&
                ['suspended', 'terminated'].indexOf(agreement.status!) === -1
                && agreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.MOU;
          }

    });
    this.set('filteredAgreements', agreements);
  }

  _partnerSelected(partnerId: string) {
    if (typeof partnerId === 'undefined') {
      return;
    }
    // clear agreementSelection
    this._filterAgreements(+partnerId);
  }

  resetValidations() {
    let agEl = this.shadowRoot.querySelector('#agreements');
    if (agEl) {
      agEl.resetInvalidState();
    }
    let pEl = this.shadowRoot.querySelector('#partner');
    if (pEl) {
      pEl.resetInvalidState();
    }
  }

  validate() {
    let valid = true;
    if (!this.agreementId) {
      valid = false;
      let agEl = this.shadowRoot.querySelector('#agreements');
      if (agEl) {
        agEl.invalid = true;
      }
    }
    if (!this.partnerId) {
      valid = false;
      let pEl = this.shadowRoot.querySelector('#partner');
      if (pEl) {
        pEl.invalid = true;
      }
    }
    return valid;
  }

  _getAgSelectorValue(value: string) {
    return value ? value : '-';
  }

}

window.customElements.define('agreement-selector', AgreementSelector);

export {AgreementSelector};
