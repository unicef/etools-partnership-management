/* eslint no-invalid-this: 0 */
import {LitElement, customElement, property, CSSResultArray, TemplateResult} from 'lit-element';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../../store';
import {isJsonStrMatch, areEqual} from '../../../../utils/utils';
import {csoPartnersSelector} from '../../../../../reducers/partners';
import CONSTANTS from '../../../../../config/app-constants';
import {ColumnStyles} from '../../../../styles/column-styles';
import {template} from './intervention-new.template';
import '../../../../layout/etools-form-element-wrapper';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import {NewInterventionStyles} from './intervention-new.styles';
import {GenericObject, LabelAndValue, Office} from '../../../../../typings/globals.types';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import pmpEndpoints from '../../../../endpoints/endpoints';

@customElement('intervention-new')
export class InterventionNew extends connect(store)(LitElement) {
  newIntervention: GenericObject = {
    reference_number_year: new Date().getFullYear()
  };
  @property() offices: Office[] = [];
  @property() unicefUsersData: GenericObject[] = [];
  @property() sections: GenericObject[] = [];

  @property() hasUNPP = false;

  @property() partnersDropdownData: Partner[] = [];
  @property() selectedPartner: Partner | null = null;

  @property() filteredAgreements: StaticAgreement[] = [];
  agreementsList: StaticAgreement[] = [];
  @property() selectedAgreement: StaticAgreement | null = null;

  @property() documentTypesOptions: LabelAndValue[] = [];

  @property() staffMembers: LabelAndValue<number>[] = [];
  get allStaffMembers(): string {
    return this.staffMembers.map((member: LabelAndValue<number>) => member.label).join(', ');
  }

  get authorizedOfficers(): string {
    const officers: PartnerStaffMember[] = (this.selectedAgreement && this.selectedAgreement.authorized_officers) || [];
    return officers.map(({first_name, last_name}: PartnerStaffMember) => `${first_name} ${last_name}`).join(', ');
  }

  get isSSFA(): boolean {
    return this.newIntervention.document_type === CONSTANTS.DOCUMENT_TYPES.SPD;
  }

  availableYears: {value: number; label: number}[] = new Array(11)
    .fill(this.newIntervention.reference_number_year)
    .map((year: number, index: number) => ({
      value: year + (-5 + index),
      label: year + (-5 + index)
    }));

  private documentTypes: LabelAndValue[] = [];
  private pcaDocTypes: LabelAndValue[] = [];
  private ssfaDocTypes: LabelAndValue[] = [];

  protected render(): TemplateResult {
    return template.call(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'interv-page'
    });
  }

  stateChanged(state: RootState): void {
    if (!isJsonStrMatch(this.agreementsList, state.agreements!.list)) {
      this.agreementsList = ([...state.agreements!.list] as unknown) as StaticAgreement[];
    }
    if (!isJsonStrMatch(this.partnersDropdownData, csoPartnersSelector(state))) {
      this.partnersDropdownData = [...csoPartnersSelector(state)];
    }
    if (!isJsonStrMatch(this.documentTypes, state.commonData!.interventionDocTypes)) {
      this.documentTypes = [...state.commonData!.interventionDocTypes];
      this.documentTypes.forEach((type: LabelAndValue) => {
        if (type.value !== CONSTANTS.DOCUMENT_TYPES.SSFA) {
          this.pcaDocTypes.push(type);
        }
        if (type.value === CONSTANTS.DOCUMENT_TYPES.SSFA) {
          this.ssfaDocTypes.push(type);
        }
      });
      this.setDocTypes();
    }
    if (!isJsonStrMatch(this.unicefUsersData, state.commonData!.unicefUsersData)) {
      this.unicefUsersData = [...state.commonData!.unicefUsersData];
    }
    if (!isJsonStrMatch(this.offices, state.commonData!.offices)) {
      this.offices = [...state.commonData!.offices];
    }
    if (!isJsonStrMatch(this.sections, state.commonData!.sections)) {
      this.sections = [...state.commonData!.sections];
    }
  }

  partnerChanged({detail}: CustomEvent): void {
    this.selectedPartner = detail.selectedItem;
    const id: number | null = (this.selectedPartner && this.selectedPartner.id) || null;
    this.setInterventionField('partner', id);
    this.filterAgreements(id);
    this.staffMembers = [];
    if (!this.selectedPartner) {
      return;
    }
    // replace with helper methods?
    const endpoint: any = (pmpEndpoints as any).partnerStaffMembers;
    endpoint.url = endpoint.template.replace('<%=id%>', this.selectedPartner.id);
    this.newIntervention.partner_focal_points = [];
    sendRequest({endpoint}).then(
      (users: PartnerStaffMember[]) =>
        (this.staffMembers = users.map((member: PartnerStaffMember) => ({
          label: `${member.first_name} ${member.last_name}`,
          value: member.id
        })))
    );
  }

  agreementChanged({detail}: CustomEvent): void {
    this.selectedAgreement = detail.selectedItem;
    this.setDocTypes(this.selectedAgreement);
    this.setInterventionField('agreement', this.selectedAgreement?.id);
    const docTypeApplicable = Boolean(
      this.newIntervention.document_type &&
        this.documentTypesOptions.find(({value}: LabelAndValue) => value === this.newIntervention.document_type)
    );
    if (this.newIntervention.document_type && !docTypeApplicable) {
      this.newIntervention.document_type = null;
    }
  }

  setInterventionField(field: string, value: any): void {
    if (areEqual(this.newIntervention[field], value)) {
      return;
    }
    this.newIntervention[field] = value;
    this.requestUpdate();
  }

  createIntervention(): void {
    if (!this.validate()) {
      fireEvent(this, 'toast', {text: 'Please fill all required fields'});
      return;
    }
    fireEvent(this, 'create-intervention', {intervention: this.newIntervention});
  }

  resetError(event: any): void {
    event.target.invalid = false;
  }

  private filterAgreements(partnerId: number | null): void {
    if (!partnerId) {
      this.filteredAgreements = [];
      return;
    }

    if (this.selectedAgreement && this.selectedAgreement.partner !== partnerId) {
      this.selectedAgreement = null;
      this.newIntervention.agreement = null;
      this.newIntervention.document_type = null;
      this.setDocTypes();
    }

    this.filteredAgreements = this.agreementsList.filter((agreement: StaticAgreement) => {
      return (
        agreement.partner === partnerId &&
        ['suspended', 'terminated'].indexOf(agreement.status!) === -1 &&
        agreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.MOU
      );
    });
  }

  private setDocTypes(agreement?: StaticAgreement | null): void {
    if (agreement && agreement.agreement_type) {
      switch (agreement.agreement_type) {
        case CONSTANTS.AGREEMENT_TYPES.PCA:
          this.documentTypesOptions = this.pcaDocTypes;
          break;
        case CONSTANTS.AGREEMENT_TYPES.SSFA:
          this.documentTypesOptions = this.ssfaDocTypes;
          break;
        default:
          this.documentTypesOptions = this.documentTypes;
          break;
      }
    } else {
      this.documentTypesOptions = [];
    }
  }

  private validate(): boolean {
    let valid = true;
    this.shadowRoot!.querySelectorAll('*[required]').forEach((element: any) => {
      const fieldValid: boolean = element.validate();
      valid = valid && fieldValid;
    });
    return valid;
  }

  static get styles(): CSSResultArray {
    return [ColumnStyles, NewInterventionStyles];
  }

  cancel() {
    this.newIntervention = {
      reference_number_year: new Date().getFullYear()
    };
    this.selectedAgreement = null;
    this.selectedPartner = null;
    this.requestUpdate();
  }
}
