import { Reducer } from 'redux';
import {
  UPDATE_COUNTRY_PROGRAMMES,
  UPDATE_DISAGGREGATIONS,
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
  partnersDropdownData: object[];
  agreementsList: object[];
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
  pageData: object;
  uploadsInProgress: number;
  unsavedUploads: number;
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
  partnersDropdownData: [],
  agreementsList: [],
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
  pageData: {
    permissions: null,
    in_amendment: false
  },
  uploadsInProgress: 0,
  unsavedUploads: 0
};

const commonData: Reducer<CommonDataState, CommonDataAction> = (state = INITIAL_STATE, action) => {
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

    default:
      return state;
  }
};

export default commonData;

