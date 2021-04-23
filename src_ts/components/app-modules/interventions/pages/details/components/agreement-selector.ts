import {PolymerElement, html} from '@polymer/polymer';
import CommonMixin from '../../../../../mixins/common-mixin';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {MinimalAgreement} from '../../../../agreements/agreement.types';
import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../../styles/shared-styles';
import {requiredFieldStarredStyles} from '../../../../../styles/required-field-styles';
import {store, RootState} from '../../../../../../store';
import {connect} from 'pwa-helpers/connect-mixin';
import {isJsonStrMatch, copy} from '../../../../../utils/utils';
import {csoPartnersSelector} from '../../../../../../reducers/partners';
import CONSTANTS from '../../../../../../config/app-constants';
import {IdAndName, Permission} from '../../../../../../typings/globals.types';
import {property} from '@polymer/decorators';
import {InterventionPermissionsFields} from '../../../../../../typings/intervention.types';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 */
class AgreementSelector extends connect(store)(CommonMixin(PolymerElement)) {
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
            <etools-form-element-wrapper label="Partner Organization" required value="[[intervention.partner]]">
            </etools-form-element-wrapper>
          </div>
          <div class="col col-3">
            <etools-form-element-wrapper label="Partner Vendor Number" value="[[intervention.partner_vendor]]">
            </etools-form-element-wrapper>
          </div>
          <div class="col col-3">
            <etools-form-element-wrapper
              label="Agreement"
              required
              value="[[selectedAgreement.agreement_number_status]]"
            >
            </etools-form-element-wrapper>
          </div>
        </template>

        <template is="dom-if" if="[[permissions.edit.agreement]]">
          <div class="col col-6 no-left-padding">
            <etools-dropdown
              id="partner"
              label="Partner Organization"
              placeholder="&#8212;"
              options="[[partnersDropdownData]]"
              option-value="id"
              option-label="name"
              selected="{{partnerId}}"
              required$="[[permissions.required.agreement]]"
              auto-validate
              error-message="Partner is required"
            >
            </etools-dropdown>
          </div>
          <div class="col col-2">
            <etools-form-element-wrapper label="Partner Vendor Number" value="[[intervention.partner_vendor]]">
            </etools-form-element-wrapper>
          </div>

          <div class="col flex-c">
            <etools-dropdown
              id="agreements"
              label="Agreement"
              placeholder="&#8212;"
              options="[[filteredAgreements]]"
              option-value="id"
              option-label="agreement_number_status"
              selected="{{agreementId}}"
              required$="[[permissions.required.agreement]]"
              auto-validate
              error-message="Agreement required"
            >
            </etools-dropdown>
          </div>
        </template>
      </div>
    `;
  }

  @property({type: Number, notify: true, observer: '_agreementIdChanged'})
  agreementId!: number;

  @property({type: Array})
  filteredAgreements: [] = [];

  @property({type: Array})
  partnersDropdownData!: any[]; // 'setPartnersDropdown' Do we need to use only CSO type partners?

  // Covers issues on refresh when agreements is populated after the rest of the observers run
  @property({type: Array, observer: '_agreementsChanged'})
  agreements!: MinimalAgreement[];

  @property({type: Number, notify: true, observer: '_partnerSelected'})
  partnerId!: number;

  @property({type: Object, notify: true})
  selectedAgreement: MinimalAgreement | null = null;

  @property({type: Object})
  intervention!: Record<string, any>;

  @property({type: Object})
  permissions!: Permission<InterventionPermissionsFields>;

  static get observers() {
    return ['_setSelectedPartnerId(selectedAgreement, partnersDropdownData)'];
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

    const agreement = this.agreements.find((agreement: any) => {
      return agreement.id === agreementId;
    });
    this.set('selectedAgreement', agreement);
  }

  _setSelectedPartnerId() {
    if (!this.selectedAgreement || !this.partnersDropdownData || !this.partnersDropdownData.length) {
      return;
    }

    if (this.intervention && this.permissions && !this.permissions.edit.agreement) {
      // in case agreement selector is in readonly mode we need to set partner id to trigger staff members request
      this.set('partnerId', this.selectedAgreement!.partner);
    }

    const agreement = this.selectedAgreement as MinimalAgreement;
    if (!agreement || !agreement.partner || this.partnerId === agreement.partner) {
      return;
    }
    const partner = this.partnersDropdownData.find((partner: IdAndName) => {
      return partner.id.toString() === agreement!.partner!.toString();
    });
    if (!partner) {
      const partnerIsHiddenOrNotCSOMsg =
        'Intervention partner ' +
        agreement.partner_name +
        " is not CSO or it's hidden! In edit mode you will not be able to see this partner in the " +
        'available partners organizations and nor the agreement number.';
      fireEvent(this, 'toast', {
        text: partnerIsHiddenOrNotCSOMsg,
        showCloseBtn: true
      });
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
    const agreements = this.agreements.filter((agreement: MinimalAgreement) => {
      if (this.intervention) {
        // existing intervention
        return agreement.partner === partnerId && agreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.MOU;
      } else {
        // new intervention
        return (
          agreement.partner === partnerId &&
          ['suspended', 'terminated'].indexOf(agreement.status!) === -1 &&
          agreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.MOU
        );
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
    const agEl = this.shadowRoot!.querySelector('#agreements') as EtoolsDropdownEl;
    if (agEl) {
      agEl.resetInvalidState();
    }
    const pEl = this.shadowRoot!.querySelector('#partner') as EtoolsDropdownEl;
    if (pEl) {
      pEl.resetInvalidState();
    }
  }

  validate() {
    let valid = true;
    if (!this.agreementId) {
      valid = false;
      const agEl = this.shadowRoot!.querySelector('#agreements') as EtoolsDropdownEl;
      if (agEl) {
        agEl.invalid = true;
      }
    }
    if (!this.partnerId) {
      valid = false;
      const pEl = this.shadowRoot!.querySelector('#partner') as EtoolsDropdownEl;
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
