import {Reducer} from 'redux';
import {
  UPDATE_COUNTRY_PROGRAMMES,
  UPDATE_DISAGGREGATIONS,
  PATCH_DISAGGREGATION,
  ADD_DISAGGREGATION,
  UPDATE_USER_COUNTRY_DATA,
  UPDATE_UNICEF_USERS,
  UPDATE_SECTIONS,
  UPDATE_OFFICES,
  UPDATE_LOCATIONS,
  UPDATE_PARTNER_RISK_RATINGS,
  UPDATE_LOCATION_TYPES,
  UPDATE_INTERVENTION_AMENDMENT_TYPES,
  UPDATE_ASSESSMENT_TYPES,
  UPDATE_PARTNER_TYPES,
  UPDATE_CSO_TYPES,
  UPDATE_AGREEMENT_AMENDMENT_TYPES,
  UPDATE_AGENCY_CHOICES,
  UPDATE_AGREEMENT_STATUSES,
  UPDATE_AGREEMENT_TYPES,
  UPDATE_CURRENCIES,
  UPDATE_INTERVENTION_STATUSES,
  UPDATE_INTERVENTION_DOC_TYPES,
  UPDATE_GRANTS,
  UPDATE_DONORS,
  UPDATE_SIGNED_BY_UNICEF_USERS,
  UPDATE_CP_OUTPUTS,
  UPDATE_FILE_TYPES,
  UPDATE_PRP_COUNTRIES,
  UPDATE_ENV_FLAGS,
  UPDATE_CURRENT_USER,
  CommonDataAction,
  UPDATE_SEA_RISK_RATINGS,
  UPDATE_GENDER_EQUITY,
  UPDATE_RISK_TYPES
} from '../actions/common-data';
import {CpOutput, Disaggregation, Location} from '../typings/intervention.types';
import {
  LabelAndValue,
  CpStructure,
  Country,
  IdAndName,
  GenericObject,
  MinimalUser,
  User,
  EnvFlags,
  Office
} from '../typings/globals.types';
import {RootState} from '../store';
import {createSelector} from 'reselect';
import {copy} from '../components/utils/utils';

export class CommonDataState {
  fileTypes: IdAndName[] = [];
  signedByUnicefUsers: {
    id: number;
    name: string;
    email: string;
    username: string;
  }[] = [];
  cpOutputs: CpOutput[] = [];
  countryProgrammes: CpStructure[] = [];
  interventionDocTypes: LabelAndValue[] = [];
  interventionStatuses: LabelAndValue[] = [];
  sections: GenericObject[] = [];
  unicefUsersData: MinimalUser[] = [];
  locations: Location[] = [];
  offices: Office[] = [];
  agreementsDropdownData: GenericObject[] = []; // TODO - is empty
  agencyChoices: LabelAndValue[] = [];
  agreementAmendmentTypes: LabelAndValue[] = [];
  csoTypes: LabelAndValue[] = [];
  partnerTypes: LabelAndValue[] = [];
  seaRiskRatings: LabelAndValue[] = [];
  assessmentTypes: LabelAndValue[] = [];
  interventionAmendmentTypes: LabelAndValue[] = [];
  currencies: LabelAndValue[] = [];
  agreementTypes: LabelAndValue[] = [];
  agreementStatuses: LabelAndValue[] = [];
  countryData: Country | null = null;
  currentUser: User | null = null;
  disaggregations: Disaggregation[] = [];
  PRPCountryData: GenericObject[] = [];
  genderEquityRatings: LabelAndValue[] = [];
  reportStatuses: LabelAndValue[] = [
    // TODO: reports list filter statuses? To be confirmed by unicef team.
    {value: 'Acc', label: 'Accepted'},
    {value: 'Due', label: 'Due'},
    {value: 'Sen', label: 'Sent Back'},
    {value: 'Sub', label: 'Submitted'},
    {value: 'Ove', label: 'Overdue'}
  ];
  reportTypes: LabelAndValue[] = [
    {value: 'HR', label: 'Humanitarian Reports'},
    {value: 'QPR', label: 'Quarterly Progress Reports'},
    {value: 'SR', label: 'Special Reports'}
  ];
  locationTypes: {id: number; name: string; admin_level: any}[] = [];
  grants: GenericObject[] = [];
  donors: GenericObject[] = [];
  partnerRiskRatings: LabelAndValue[] = [];
  envFlags: EnvFlags | null = null;
  riskTypes: LabelAndValue[] = [];
}

const INITIAL_STATE = new CommonDataState();

const commonData: Reducer<CommonDataState, CommonDataAction> = (state = INITIAL_STATE, action: any) => {
  let disaggregsCopy;
  let dIndex;

  switch (action.type) {
    case UPDATE_COUNTRY_PROGRAMMES:
      return {
        ...state,
        countryProgrammes: action.countryProgrammes
      };

    case UPDATE_DISAGGREGATIONS:
      return {
        ...state,
        disaggregations: action.disaggregations
      };

    case UPDATE_FILE_TYPES:
      return {
        ...state,
        fileTypes: action.fileTypes
      };

    case UPDATE_CP_OUTPUTS:
      return {
        ...state,
        cpOutputs: action.cpOutputs
      };

    case UPDATE_SIGNED_BY_UNICEF_USERS:
      return {
        ...state,
        signedByUnicefUsers: action.signedByUnicefUsers
      };

    case UPDATE_INTERVENTION_DOC_TYPES:
      return {
        ...state,
        interventionDocTypes: action.intDocTypes
      };

    case UPDATE_INTERVENTION_STATUSES:
      return {
        ...state,
        interventionStatuses: action.statuses
      };

    case UPDATE_SECTIONS:
      return {
        ...state,
        sections: action.sections
      };

    case UPDATE_LOCATIONS:
      return {
        ...state,
        locations: action.locations
      };

    case UPDATE_UNICEF_USERS:
      return {
        ...state,
        unicefUsersData: action.unicefUsersData
      };

    case UPDATE_OFFICES:
      return {
        ...state,
        offices: action.offices
      };

    case UPDATE_CURRENCIES:
      return {
        ...state,
        currencies: action.currencies
      };

    case UPDATE_AGREEMENT_TYPES:
      return {
        ...state,
        agreementTypes: action.types
      };

    case UPDATE_AGREEMENT_STATUSES:
      return {
        ...state,
        agreementStatuses: action.statuses
      };

    case UPDATE_CSO_TYPES:
      return {
        ...state,
        csoTypes: action.csoTypes
      };

    case UPDATE_PARTNER_TYPES:
      return {
        ...state,
        partnerTypes: action.partnerTypes
      };

    case UPDATE_AGENCY_CHOICES:
      return {
        ...state,
        agencyChoices: action.agencyChoices
      };

    case UPDATE_AGREEMENT_AMENDMENT_TYPES:
      return {
        ...state,
        agreementAmendmentTypes: action.types
      };

    case UPDATE_ASSESSMENT_TYPES:
      return {
        ...state,
        assessmentTypes: action.assessmentTypes
      };

    case UPDATE_INTERVENTION_AMENDMENT_TYPES:
      return {
        ...state,
        interventionAmendmentTypes: action.intAmendTypes
      };

    case UPDATE_USER_COUNTRY_DATA:
      return {
        ...state,
        countryData: action.countryData
      };

    case ADD_DISAGGREGATION:
      disaggregsCopy = state.disaggregations.slice(0);
      disaggregsCopy.push(action.disaggregation);
      return {
        ...state,
        disaggregations: disaggregsCopy
      };

    case PATCH_DISAGGREGATION:
      disaggregsCopy = state.disaggregations.slice(0);

      dIndex = disaggregsCopy.findIndex((disaggregsCopy) => disaggregsCopy.id === action.disaggregation.id);
      if (dIndex >= 0) {
        disaggregsCopy.splice(dIndex, 1, action.disaggregation);
      }
      return {
        ...state,
        disaggregations: disaggregsCopy
      };

    case UPDATE_CURRENT_USER:
      return {
        ...state,
        currentUser: action.user
      };

    case UPDATE_LOCATION_TYPES:
      return {
        ...state,
        locationTypes: action.locationTypes
      };

    case UPDATE_DONORS:
      return {
        ...state,
        donors: action.donors
      };

    case UPDATE_GRANTS:
      return {
        ...state,
        grants: action.grants
      };

    case UPDATE_PARTNER_RISK_RATINGS:
      return {
        ...state,
        partnerRiskRatings: action.ratings
      };

    case UPDATE_PRP_COUNTRIES:
      return {
        ...state,
        PRPCountryData: action.PRPCountryData
      };

    case UPDATE_ENV_FLAGS:
      return {
        ...state,
        envFlags: action.envFlags
      };

    case UPDATE_SEA_RISK_RATINGS:
      return {
        ...state,
        seaRiskRatings: action.seaRiskRatings
      };

    case UPDATE_GENDER_EQUITY:
      return {
        ...state,
        genderEquityRatings: action.genderEquityRatings
      };

    case UPDATE_RISK_TYPES:
      return {
        ...state,
        riskTypes: action.riskTypes
      };

    default:
      return state;
  }
};

const disaggregationsSelector = (state: RootState) => state.commonData!.disaggregations;

export const flaggedSortedDisaggregs = createSelector(disaggregationsSelector, (disagregs: Disaggregation[]) => {
  if (!disagregs || !disagregs.length) {
    return [];
  }

  return copy(disagregs)
    .map((d: Disaggregation) => {
      if (!d.active) {
        d.name = '(*Inactive) ' + d.name;
      }
      return d;
    })
    .sort((d1: Disaggregation, d2: Disaggregation) => {
      if (d1.active === d2.active) {
        return 0;
      }
      if (d1.active) {
        return -1;
      }
      return 1;
    });
});

export default commonData;
