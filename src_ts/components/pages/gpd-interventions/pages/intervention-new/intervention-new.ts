/* eslint no-invalid-this: 0 */
import {LitElement, CSSResultArray, TemplateResult} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../../../redux/store';
import {isJsonStrMatch, areEqual} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {govPartnersSelector} from '../../../../../redux/reducers/partners';
import CONSTANTS from '../../../../../config/app-constants';
import {template} from './intervention-new.template';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import {NewGDDInterventionStyles} from './intervention-new.styles';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import pmpEndpoints from '../../../../endpoints/endpoints';
import {LabelAndValue, GenericObject, Office, GDD} from '@unicef-polymer/etools-types';
import orderBy from 'lodash-es/orderBy';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {EWorkPlan} from '../intervention-tab-pages/common/types/store.types';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import dayjs from 'dayjs';
import {Environment, EnvironmentType} from '@unicef-polymer/etools-utils/dist/singleton/environment';

@customElement('gdd-intervention-new')
export class GddInterventionNew extends connect(store)(LitElement) {
  newIntervention: Partial<GDD> = this.getDefaultNewIntervention();
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
  @property({type: Array}) allEWorkplans!: EWorkPlan[];
  @state() minDate = new Date();
  @state() user: any;

  @property() partnerStaffMembers: PartnerStaffMember[] = [];
  get formattedPartnerStaffMembers(): LabelAndValue<number>[] {
    return this.partnerStaffMembers.map((member: PartnerStaffMember) => ({
      label: `${
        member.active
          ? member.has_active_realm
            ? ''
            : `[${getTranslation('NO_ACCESS')}]`
          : `[${getTranslation('INACTIVE')}]`
      } ${member.first_name} ${member.last_name} (${member.email})`,
      value: member.id
    }));
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
      loadingSource: 'gdd-interv-page'
    });
  }

  stateChanged(state: RootState): void {
    if (!isJsonStrMatch(this.user, state.user?.data)) {
      this.user = cloneDeep(state.user?.data);
    }
    if (!isJsonStrMatch(this.agreementsList, state.agreements!.list)) {
      this.agreementsList = [...state.agreements!.list] as unknown as StaticAgreement[];
    }
    if (!isJsonStrMatch(this.partnersDropdownData, govPartnersSelector(state))) {
      this.partnersDropdownData = [...govPartnersSelector(state)];
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
      this.cpStructures = this.removeFutureCountryProgrammes(state.commonData!.countryProgrammes);
      if (this.cpStructures?.length) {
        this.newIntervention.country_programme = this.cpStructures[0].id;
      }
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
    this.getDefaultTitle(this.newIntervention);
    const id: number | null = (this.selectedPartner && this.selectedPartner.id) || null;
    this.setInterventionField('partner', id);
    this.filterAgreements(id);
    this.partnerStaffMembers = [];
    if (!this.selectedPartner) {
      return;
    }
    // replace with helper methods?
    const endpoint: any = (pmpEndpoints as any).partnerStaffMembers;
    endpoint.url = endpoint.template.replace('<%=id%>', this.selectedPartner.id);
    this.newIntervention.partner_focal_points = [];
    sendRequest({endpoint}).then(
      (users: PartnerStaffMember[]) =>
        (this.partnerStaffMembers = users.sort(
          (a: PartnerStaffMember, b: PartnerStaffMember) =>
            Number(b.active) - Number(a.active) ||
            `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        ))
    );
  }

  removeFutureCountryProgrammes(countryProgrammes: any[]) {
    if (countryProgrammes && countryProgrammes.length) {
      const currentDate = new Date();
      countryProgrammes = countryProgrammes.filter(
        (cp) => dayjs(cp.from_date).toDate() <= currentDate && dayjs(cp.to_date).toDate() >= currentDate
      );
    }
    return countryProgrammes;
  }

  agreementChanged({detail}: CustomEvent): void {
    this.selectedAgreement = detail.selectedItem;
    this.setInterventionField('agreement', this.selectedAgreement?.id);
    const cp = this.selectedAgreement?.country_programme;
    this.setInterventionField('country_programme', cp ? cp : null);
  }

  getDefaultTitle(intervention: Partial<GDD>) {
    if (!this.selectedPartner?.name || !this.newIntervention.reference_number_year) {
      return;
    }
    this.newIntervention = {
      ...this.newIntervention,
      // eslint-disable-next-line max-len
      title: `${this.selectedPartner!.name} - UNICEF - ${this.user.country.name} Programme Document ${intervention.reference_number_year}`
    };
  }

  documentTypeChanged(type: string): void {
    if (type !== CONSTANTS.DOCUMENT_TYPES.SPD) {
      this.setInterventionField('humanitarian_flag', false);
    }
  }
  getDocTypeTooltip() {
    return getTranslation('GDD_TOOLTIP');
  }

  setInterventionField(field: keyof GDD, value: any): void {
    if (value === undefined) {
      return;
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
    if (this.newIntervention.planned_budget) {
      this.newIntervention.planned_budget.currency = value;
    }
    this.requestUpdate();
  }

  createIntervention(): void {
    if (!this.validate()) {
      fireEvent(this, 'toast', {text: getTranslation('NEW_GDD.ON_SAVE_VALIDATION')});
      return;
    }

    if (!Environment.is(EnvironmentType.DEMO)) {
      if (
        this.newIntervention.budget_owner &&
        (this.newIntervention.unicef_focal_points || []).includes(this.newIntervention.budget_owner)
      ) {
        fireEvent(this, 'toast', {text: getTranslation('BUDGET_OWNER_DIFFERENT_FOCAL_POINT')});
        return;
      }
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
    }

    this.filteredAgreements = this.agreementsList.filter((agreement: StaticAgreement) => {
      return (
        agreement.partner === partnerId &&
        ['suspended', 'terminated'].indexOf(agreement.status!) === -1 &&
        agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.GTC
      );
    });
  }

  private validate(): boolean {
    let valid = true;
    this.shadowRoot!.querySelectorAll('*[required]').forEach((element: any) => {
      if (element.validate) {
        const fieldValid: boolean = element.validate();
        valid = valid && fieldValid;
      }
    });
    return valid;
  }

  static get styles(): CSSResultArray {
    return [layoutStyles, NewGDDInterventionStyles];
  }

  cancel() {
    this.newIntervention = this.getDefaultNewIntervention();
    this.selectedAgreement = null;
    this.selectedPartner = null;
    this.requestUpdate();
    EtoolsRouter.updateAppLocation('gpd-interventions/list');
  }

  getDefaultNewIntervention() {
    return {
      reference_number_year: `${new Date().getFullYear()}`,
      planned_budget: {currency: 'USD'},
      start: dayjs(new Date()).format('YYYY-MM-DD'),
      end: dayjs(new Date(new Date().getFullYear(), 11, 31)).format('YYYY-MM-DD')
    };
  }
}
