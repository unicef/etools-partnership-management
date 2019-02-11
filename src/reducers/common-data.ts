// @ts-ignore
import {Reducer} from 'redux';
import {
  UPDATE_COUNTRY_PROGRAMMES,
  UPDATE_DISAGGREGATIONS,
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
  CommonDataAction
} from '../actions/common-data';

export interface CommonDataState {
  fileTypes: object[];
  signedByUnicefUsers: object[];
  cpOutputs: object[];
  countryProgrammes: object[];
  interventionDocTypes: object[];
  interventionStatuses: object[];
  sections: object[];
  unicefUsersData: object[];
  locations: object[];
  offices: object[];
  partners: object[];
  agreementsDropdownData: object[];
  agencyChoices: object[];
  agreementAmendmentTypes: object[];
  csoTypes: object[];
  partnerTypes: object[];
  assessmentTypes: object[];
  interventionAmendmentTypes: object[];
  currencies: object[];
  agreementTypes: object[];
  agreementStatuses: object[];
  csoPartners: object[];
  countryData: object;
  disaggregations: object[];
  PRPCountryData: object[];
  currentUser: object;
  reportStatuses: object[];
  reportTypes: object[];
  locationTypes: object[];
  grants: object[];
  donors: object[];
  partnerRiskRatings: object[];
  envFlags: object | null;
}

const INITIAL_STATE: CommonDataState = {
  fileTypes: [],
  signedByUnicefUsers: [],
  cpOutputs: [],
  countryProgrammes: [],
  interventionDocTypes: [],
  interventionStatuses: [],
  sections: [],
  unicefUsersData: [],
  locations: [],
  offices: [],
  partners: [],
  agreementsDropdownData: [],
  agencyChoices: [],
  agreementAmendmentTypes: [],
  csoTypes: [],
  partnerTypes: [],
  assessmentTypes: [],
  interventionAmendmentTypes: [],
  currencies: [],
  agreementTypes: [],
  agreementStatuses: [],
  csoPartners: [],
  countryData: {},
  disaggregations: [],
  PRPCountryData: [],
  currentUser: {},
  reportStatuses: [
    // TODO: reports list filter statuses? To be confirmed by unicef team.
    {value: 'Acc', label: 'Accepted'},
    {value: 'Due', label: 'Due'},
    {value: 'Sen', label: 'Sent Back'},
    {value: 'Sub', label: 'Submitted'},
    {value: 'Ove', label: 'Overdue'}
  ],
  reportTypes: [
    {value: 'HR', label: 'Humanitarian Reports'},
    {value: 'QPR', label: 'Quarterly Progress Reports'},
    {value: 'SR', label: 'Special Reports'}
  ],
  locationTypes: [],
  grants: [],
  donors: [],
  partnerRiskRatings: [],
  envFlags: null
};

const commonData: Reducer<CommonDataState, CommonDataAction> = (state = INITIAL_STATE, action: any) => {
  // let partnersDdDataCopy;
  // let disaggregsCopy;
  // let agreementsCopy;
  // let csoPartnerCopy;
  // let indexP;
  // let index;
  // let pageDataWithPermsUpdated;
  // let dIndex;

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

    // case UPDATE_PARTNERS:
    //   return {
    //     ...state,
    //     partners: action.partnersData
    //   };

    // case UPDATE_AGREEMENTS:
    //   return {
    //     ...state,
    //     agreementsList: action.agreementsList
    //   };

    // case ADD_EDIT_AGREEMENT:
    //   agreementsCopy = state.agreementsList.slice(0);
    //   index = agreementsCopy.findIndex(function (agr) {
    //     return agr.id === action.agreement.id;
    //   });
    //
    //   if (index > -1) {
    //     agreementsCopy[index] = action.agreement;
    //   } else {
    //     agreementsCopy.push(action.agreement);
    //   }
    //   return Object.assign({}, state, {agreementsList: agreementsCopy});

    // case 'SET_PARTNERS_DROPDOWN':
    //   return {
    //     ...state,
    //     partnersDropdownData: action.partnersDropdownData
    //   };

    // case DELETE_PARTNER:
    //   csoPartnerCopy = state.csoPartners.slice(0);
    //   partnersDdDataCopy = state.partnersDropdownData.slice(0);
    //
    //   indexP = csoPartnerCopy.findIndex(function (partner) {
    //     return partner.id === action.partnerId;
    //   });
    //   if (indexP > -1) {
    //     csoPartnerCopy.splice(indexP, 1);
    //   }
    //   indexP = partnersDdDataCopy.findIndex(function (partner) {
    //     return partner.value === action.partnerId;
    //   });
    //   if (indexP > -1) {
    //     partnersDdDataCopy.splice(indexP, 1);
    //   }
    //   return Object.assign({}, state, {
    //     partnersDropdownData: partnersDdDataCopy,
    //     csoPartners: csoPartnerCopy
    //   });

    // case UPDATE_AGREEMENTS_DROPDOWN:
    //   return {
    //     ...state,
    //     agreementsDropdownData: action.agreementsDropdownData
    //   };

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

    // case UPDATE_CSO_PARTNERS:
    //   return {
    //     ...state,
    //     csoPartners: action.csoPartners
    //   };

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

    // case ADD_DISAGGREGATION:
    //   disaggregsCopy = state.disaggregations.slice(0);
    //   disaggregsCopy.push(action.disaggregation);
    //   return {
    //     ...state,
    //     disaggregations: action.disaggregsCopy
    //   };

    // case PATCH_DISAGGREGATION:
    //   disaggregsCopy = state.disaggregations.slice(0);
    //
    //   dIndex = disaggregsCopy.findIndex(disaggregsCopy => disaggregsCopy.id === action.disaggregation.id);
    //   if (dIndex >= 0) {
    //     disaggregsCopy.splice(dIndex, 1, action.disaggregation);
    //   }
    //   return {
    //     ...state,
    //     disaggregations: action.disaggregsCopy
    //   };

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

    // case UPDATE_PAGE_DATA_PERMISSIONS:
    //   pageDataWithPermsUpdated = {
    //     ...state.pageData,
    //     permissions: action.permissions
    //   };
    //
    //   return {
    //     ...state,
    //     pageData: pageDataWithPermsUpdated
    //   };

    // case UPDATE_IN_AMENDMENT_MODE_STATE:
    //   let pageDataInAmendment = {
    //     ...state.pageData,
    //     in_amendment: action.inAmendment
    //   };

    //   return {
    //     ...state,
    //     pageData: pageDataInAmendment
    //   };

    default:
      return state;
  }
};

export default commonData;

