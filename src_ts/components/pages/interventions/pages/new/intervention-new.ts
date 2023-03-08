/* eslint no-invalid-this: 0 */
import {LitElement, customElement, property, CSSResultArray, TemplateResult} from 'lit-element';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../../redux/store';
import {isJsonStrMatch, areEqual} from '../../../../utils/utils';
import {csoPartnersSelector} from '../../../../../redux/reducers/partners';
import CONSTANTS from '../../../../../config/app-constants';
import {ColumnStyles} from '../../../../styles/column-styles';
import {template} from './intervention-new.template';
import '../../../../common/components/etools-form-element-wrapper';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import {NewInterventionStyles} from './intervention-new.styles';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import pmpEndpoints from '../../../../endpoints/endpoints';
import {LabelAndValue, GenericObject, Office, Intervention} from '@unicef-polymer/etools-types';
import orderBy from 'lodash-es/orderBy';
import {PaperInputElement} from '@polymer/paper-input/paper-input';
import {get as getTranslation} from 'lit-translate';
import {EtoolsRouter} from '../../../../utils/routes';

@customElement('intervention-new')
export class InterventionNew extends connect(store)(LitElement) {
  newIntervention: Partial<Intervention> = this.getDefaultNewIntervention();
  @property({type: Boolean}) windowWidthIsSmall = false;
  @property() offices: Office[] = [];
  @property() unicefUsersData: GenericObject[] = [];
  @property() sections: GenericObject[] = [];

  private _cpStructures: any[] = [];
  @property({type: Array})
  get cpStructures() {
    return this._cpStructures;
  }

  set cpStructures(cps) {
    this._cpStructures = orderBy<any>(cps, ['future', 'active', 'special'], ['desc', 'desc', 'asc']);
  }

  @property() partnersDropdownData: Partner[] = [];
  @property() selectedPartner: Partner | null = null;

  @property() filteredAgreements: StaticAgreement[] = [];
  agreementsList: StaticAgreement[] = [];
  @property() selectedAgreement: StaticAgreement | null = null;

  @property() documentTypes: LabelAndValue[] = [];
  @property() currencies: LabelAndValue[] = [];

  @property() staffMembers: LabelAndValue<number>[] = [];
  get allStaffMembers(): string {
    return this.staffMembers.map((member: LabelAndValue<number>) => member.label).join(', ');
  }

  get authorizedOfficers(): string {
    const officers: PartnerStaffMember[] = (this.selectedAgreement && this.selectedAgreement.authorized_officers) || [];
    return officers.map(({first_name, last_name}: PartnerStaffMember) => `${first_name} ${last_name}`).join(', ');
  }

  get isSPD(): boolean {
    return this.newIntervention.document_type === CONSTANTS.DOCUMENT_TYPES.SPD;
  }

  availableYears: {value: number; label: number}[] = new Array(11)
    .fill(Number(this.newIntervention.reference_number_year))
    .map((year: number, index: number) => ({
      value: year + (-5 + index),
      label: year + (-5 + index)
    }));

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
      this.agreementsList = [...state.agreements!.list] as unknown as StaticAgreement[];
    }
    if (!isJsonStrMatch(this.partnersDropdownData, csoPartnersSelector(state))) {
      this.partnersDropdownData = [...csoPartnersSelector(state)];
    }
    if (!isJsonStrMatch(this.documentTypes, state.commonData!.documentTypes)) {
      this.documentTypes = [...state.commonData!.documentTypes];
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
    if (!isJsonStrMatch(this.cpStructures, state.commonData!.countryProgrammes)) {
      this.cpStructures = [...state.commonData!.countryProgrammes];
    }
    if (!isJsonStrMatch(this.currencies, state.commonData!.currencies)) {
      this.currencies = [...state.commonData!.currencies];
    }

    //  this is in place to remove 'SSFA' doc types
    this.documentTypes = this.documentTypes.filter((el) => {
      return el.value !== 'SSFA' && el.label !== 'SSFA';
    });
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
        (this.staffMembers = users
          .sort(
            (a: PartnerStaffMember, b: PartnerStaffMember) =>
              Number(b.active) - Number(a.active) ||
              `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
          )
          .map((member: PartnerStaffMember) => ({
            label: `${!member.active ? `[${getTranslation('INACTIVE')}]` : ''} ${member.first_name} ${
              member.last_name
            } (${member.email})`,
            value: member.id
          })))
    );
  }

  agreementChanged({detail}: CustomEvent): void {
    this.selectedAgreement = detail.selectedItem;
    this.setInterventionField('agreement', this.selectedAgreement?.id);
    const cp = this.selectedAgreement?.country_programme;
    this.setInterventionField('country_programmes', cp ? [cp] : []);
  }

  documentTypeChanged(type: string): void {
    if (type !== CONSTANTS.DOCUMENT_TYPES.SPD) {
      this.setInterventionField('humanitarian_flag', false);
      this.setInterventionField('contingency_pd', false);
    }
    this.setInterventionField('document_type', type);
  }
  getDocTypeTooltip() {
    return (
      getTranslation('PROGRAMME_DOCUMENT_TOOLTIP') +
      '<br><br>' +
      getTranslation('SIMPLIFIED_PROGRAMME_DOCUMENT_TOOLTIP')
    );
  }

  setInterventionField(field: keyof Intervention, value: any): void {
    if (value === undefined) {
      return;
    }

    if (value && value.length === 16) {
      this.validateCFEI();
    }

    if (areEqual(this.newIntervention[field], value)) {
      return;
    }
    // @ts-ignore
    this.newIntervention[field] = value;
    this.requestUpdate();
  }

  setCurrency(value: string) {
    if (value === undefined) {
      return;
    }
    if (this.newIntervention.planned_budget?.currency === value) {
      return;
    }
    // @ts-ignore
    this.newIntervention.planned_budget?.currency = value;
    this.requestUpdate();
  }

  createIntervention(): void {
    if (!this.validate()) {
      fireEvent(this, 'toast', {text: getTranslation('NEW_INTERVENTION.ON_SAVE_VALIDATION')});
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
      this.newIntervention.agreement = undefined;
      this.newIntervention.document_type = undefined;
    }

    this.filteredAgreements = this.agreementsList.filter((agreement: StaticAgreement) => {
      return (
        agreement.partner === partnerId &&
        ['suspended', 'terminated'].indexOf(agreement.status!) === -1 &&
        agreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.MOU
      );
    });
  }

  validateCFEI(e?: CustomEvent) {
    const elem = e
      ? (e.currentTarget as PaperInputElement)
      : this.shadowRoot?.querySelector<PaperInputElement>('#unppNumber')!;
    elem.validate();
  }

  private validate(): boolean {
    let valid = true;
    this.shadowRoot!.querySelectorAll('*[required]').forEach((element: any) => {
      const fieldValid: boolean = element.validate();
      valid = valid && fieldValid;
    });
    const unppEL = this.shadowRoot!.querySelector<PaperInputElement>('#unppNumber');
    if (unppEL) {
      valid = valid && unppEL.validate();
    }
    return valid;
  }

  static get styles(): CSSResultArray {
    return [ColumnStyles, NewInterventionStyles];
  }

  cancel() {
    this.newIntervention = this.getDefaultNewIntervention();
    this.selectedAgreement = null;
    this.selectedPartner = null;
    this.requestUpdate();
    EtoolsRouter.updateAppLocation('interventions/list');
  }

  getDefaultNewIntervention() {
    return {
      reference_number_year: `${new Date().getFullYear()}`,
      planned_budget: {currency: 'USD'}
    };
  }
}
