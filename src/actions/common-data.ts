/**
 @license
 Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
// @ts-ignore
import {Action, ActionCreator} from 'redux';
// @ts-ignore
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../store.js';

export const UPDATE_COUNTRY_PROGRAMMES = 'UPDATE_COUNTRY_PROGRAMMES';
export const UPDATE_DISAGGREGATIONS = 'UPDATE_DISAGGREGATIONS';
export const UPDATE_FILE_TYPES = 'UPDATE_FILE_TYPES';
export const UPDATE_CP_OUTPUTS = 'UPDATE_CP_OUTPUTS';
export const UPDATE_SIGNED_BY_UNICEF_USERS = 'UPDATE_SIGNED_BY_UNICEF_USERS';
export const UPDATE_DONORS = 'UPDATE_DONORS';
export const UPDATE_GRANTS = 'UPDATE_GRANTS';
export const UPDATE_INTERVENTION_DOC_TYPES = 'UPDATE_INTERVENTION_DOC_TYPES';
export const UPDATE_INTERVENTION_STATUSES = 'UPDATE_INTERVENTION_STATUSES';
export const UPDATE_CURRENCIES = 'UPDATE_CURRENCIES';
export const UPDATE_AGREEMENT_TYPES = 'UPDATE_AGREEMENT_TYPES';
export const UPDATE_AGREEMENT_STATUSES = 'UPDATE_AGREEMENT_STATUSES';
export const UPDATE_AGENCY_CHOICES = 'UPDATE_AGENCY_CHOICES';
export const UPDATE_AGREEMENT_AMENDMENT_TYPES = 'UPDATE_AGREEMENT_AMENDMENT_TYPES';
export const UPDATE_CSO_TYPES = 'UPDATE_CSO_TYPES';
export const UPDATE_PARTNER_TYPES = 'UPDATE_PARTNER_TYPES';
export const UPDATE_ASSESSMENT_TYPES = 'UPDATE_ASSESSMENT_TYPES';
export const UPDATE_INTERVENTION_AMENDMENT_TYPES = 'UPDATE_INTERVENTION_AMENDMENT_TYPES';
export const UPDATE_LOCATION_TYPES = 'UPDATE_LOCATION_TYPES';
export const UPDATE_PARTNER_RISK_RATINGS = 'UPDATE_PARTNER_RISK_RATINGS';
export const UPDATE_LOCATIONS = 'UPDATE_LOCATIONS';
export const UPDATE_OFFICES = 'UPDATE_OFFICES';
export const UPDATE_PRP_COUNTRIES = 'UPDATE_PRP_COUNTRIES';
export const UPDATE_SECTIONS = 'UPDATE_SECTIONS';
export const UPDATE_UNICEF_USERS = 'UPDATE_UNICEF_USERS';
export const UPDATE_USER_COUNTRY_DATA = 'UPDATE_USER_COUNTRY_DATA';
export const UPDATE_ENV_FLAGS = 'UPDATE_ENV_FLAGS';
export const UPDATE_IN_AMENDMENT_MODE_STATE = 'UPDATE_IN_AMENDMENT_MODE_STATE';
export const UPDATE_CURRENT_USER = 'UPDATE_CURRENT_USER';
export const SET_CURRENT_USER = 'SET_CURRENT_USER';

export interface CommonDataActionUpdateCountryProgrammes extends Action<'UPDATE_COUNTRY_PROGRAMMES'> {
  countryProgrammes: object[]
};

export interface CommonDataActionUpdateDisaggregations extends Action<'UPDATE_DISAGGREGATIONS'> {
  disaggregations: object[]
};

export interface CommonDataActionUpdateFileTypes extends Action<'UPDATE_FILE_TYPES'> {
  fileTypes: object[]
};

export interface CommonDataActionUpdateCpOutputs extends Action<'UPDATE_CP_OUTPUTS'> {
  cpOutputs: object[]
};

export interface CommonDataActionUpdateSignedByUnicefUsers extends Action<'UPDATE_SIGNED_BY_UNICEF_USERS'> {
  signedByUnicefUsers: object[]
};

export interface CommonDataActionUpdateDonors extends Action<'UPDATE_DONORS'> {
  donors: object[]
};

export interface CommonDataActionUpdateGrants extends Action<'UPDATE_GRANTS'> {
  grants: object[]
};

export interface CommonDataActionUpdateInterventionDocTypes extends Action<'UPDATE_INTERVENTION_DOC_TYPES'> {
  intDocTypes: object[]
};

export interface CommonDataActionUpdateInterventionStatuses extends Action<'UPDATE_INTERVENTION_STATUSES'> {
  statuses: object[]
};

export interface CommonDataActionUpdateCurrencies extends Action<'UPDATE_CURRENCIES'> {
  currencies: object[]
};

export interface CommonDataActionUpdateAgreementTypes extends Action<'UPDATE_AGREEMENT_TYPES'> {
  types: object[]
};

export interface CommonDataActionUpdateAgreementStatuses extends Action<'UPDATE_AGREEMENT_STATUSES'> {
  statuses: object[]
};

export interface CommonDataActionUpdateAgencyChoices extends Action<'UPDATE_AGENCY_CHOICES'> {
  agencyChoices: object[]
};

export interface CommonDataActionUpdateAgreementAmendmentTypes extends Action<'UPDATE_AGREEMENT_AMENDMENT_TYPES'> {
  types: object[]
};

export interface CommonDataActionUpdateCsoTypes extends Action<'UPDATE_CSO_TYPES'> {
  csoTypes: object[]
};

export interface CommonDataActionUpdatePartnerTypes extends Action<'UPDATE_PARTNER_TYPES'> {
  partnerTypes: object[]
};

export interface CommonDataActionUpdateAssessmentTypes extends Action<'UPDATE_ASSESSMENT_TYPES'> {
  assessmentTypes: object[]
};

export interface CommonDataActionUpdateInterventionAmendmentTypes extends Action<'UPDATE_INTERVENTION_AMENDMENT_TYPES'> {
  intAmendTypes: object[]
};

export interface CommonDataActionUpdateLocationTypes extends Action<'UPDATE_LOCATION_TYPES'> {
  locationTypes: object[]
};

export interface CommonDataActionUpdatePartnerRiskRatings extends Action<'UPDATE_PARTNER_RISK_RATINGS'> {
  ratings: object[]
};

export interface CommonDataActionUpdateLocations extends Action<'UPDATE_LOCATIONS'> {
  locations: object[]
};

export interface CommonDataActionUpdateOffices extends Action<'UPDATE_OFFICES'> {
  offices: object[]
};

export interface CommonDataActionUpdatePRPCountries extends Action<'UPDATE_PRP_COUNTRIES'> {
  PRPCountryData: object[]
};

export interface CommonDataActionUpdateSections extends Action<'UPDATE_SECTIONS'> {
  sections: object[]
};

export interface CommonDataActionUpdateUnicefUsers extends Action<'UPDATE_UNICEF_USERS'> {
  unicefUsersData: object[]
};

export interface CommonDataActionUpdateUserCountryData extends Action<'UPDATE_USER_COUNTRY_DATA'> {
  countryData: object
};

export interface CommonDataActionUpdateEnvFlags extends Action<'UPDATE_ENV_FLAGS'> {
  envFlags: object
};

export interface CommonDataActionUpdateInAmendmentMode extends Action<'UPDATE_IN_AMENDMENT_MODE_STATE'> {
  inAmendment: object
};

export interface CommonDataActionUpdateCurrentUser extends Action<'UPDATE_CURRENT_USER'> {
  user: object
};

export interface CommonDataActionSetCurrentUser extends Action<'SET_CURRENT_USER'> {
  user: object
};

export type CommonDataAction = CommonDataActionUpdateCountryProgrammes | CommonDataActionUpdateDisaggregations |
    CommonDataActionUpdateFileTypes | CommonDataActionUpdateCpOutputs | CommonDataActionUpdateSignedByUnicefUsers |
    CommonDataActionUpdateDonors | CommonDataActionUpdateGrants | CommonDataActionUpdateInterventionDocTypes |
    CommonDataActionUpdateInterventionStatuses | CommonDataActionUpdateCurrencies |
    CommonDataActionUpdateAgreementTypes | CommonDataActionUpdateAgreementStatuses |
    CommonDataActionUpdateAgencyChoices | CommonDataActionUpdateAgreementAmendmentTypes |
    CommonDataActionUpdateCsoTypes | CommonDataActionUpdatePartnerTypes | CommonDataActionUpdateAssessmentTypes |
    CommonDataActionUpdateInterventionAmendmentTypes | CommonDataActionUpdateLocationTypes |
    CommonDataActionUpdatePartnerRiskRatings | CommonDataActionUpdateLocations | CommonDataActionUpdateOffices |
    CommonDataActionUpdateSections | CommonDataActionUpdateUnicefUsers | CommonDataActionUpdateUserCountryData |
    CommonDataActionUpdatePRPCountries | CommonDataActionUpdateEnvFlags | CommonDataActionUpdateInAmendmentMode |
    CommonDataActionUpdateCurrentUser | CommonDataActionSetCurrentUser;

// @ts-ignore - for now
type ThunkResult = ThunkAction<void, RootState, undefined, CommonDataAction>;

export const updateCountryProgrammes: ActionCreator<CommonDataActionUpdateCountryProgrammes> =
    (countryProgrammes: object[]) => {
      return {
        type: UPDATE_COUNTRY_PROGRAMMES,
        countryProgrammes
      };
    };

export const updateDisaggregations: ActionCreator<CommonDataActionUpdateDisaggregations> =
    (disaggregations: object[]) => {
      return {
        type: UPDATE_DISAGGREGATIONS,
        disaggregations
      };
    };

export const updateFileTypes: ActionCreator<CommonDataActionUpdateFileTypes> =
    (fileTypes: object[]) => {
      return {
        type: UPDATE_FILE_TYPES,
        fileTypes
      };
    };

export const updateCpOutputs: ActionCreator<CommonDataActionUpdateCpOutputs> =
    (cpOutputs: object[]) => {
      return {
        type: UPDATE_CP_OUTPUTS,
        cpOutputs
      };
    };

export const updateSignedByUnicefUsers: ActionCreator<CommonDataActionUpdateSignedByUnicefUsers> =
    (signedByUnicefUsers: object[]) => {
      return {
        type: UPDATE_SIGNED_BY_UNICEF_USERS,
        signedByUnicefUsers
      };
    };

export const updateDonors: ActionCreator<CommonDataActionUpdateDonors> =
    (donors: object[]) => {
      return {
        type: UPDATE_DONORS,
        donors
      };
    };

export const updateGrants: ActionCreator<CommonDataActionUpdateGrants> =
    (grants: object[]) => {
      return {
        type: UPDATE_GRANTS,
        grants
      };
    };

export const updateInterventionDocTypes: ActionCreator<CommonDataActionUpdateInterventionDocTypes> =
    (intDocTypes: object[]) => {
      return {
        type: UPDATE_INTERVENTION_DOC_TYPES,
        intDocTypes
      };
    };

export const updateInterventionStatuses: ActionCreator<CommonDataActionUpdateInterventionStatuses> =
    (statuses: object[]) => {
      return {
        type: UPDATE_INTERVENTION_STATUSES,
        statuses
      };
    };

export const updateCurrencies: ActionCreator<CommonDataActionUpdateCurrencies> =
    (currencies: object[]) => {
      return {
        type: UPDATE_CURRENCIES,
        currencies
      };
    };

export const updateAgreementTypes: ActionCreator<CommonDataActionUpdateAgreementTypes> =
    (types: object[]) => {
      return {
        type: UPDATE_AGREEMENT_TYPES,
        types
      };
    };

export const updateAgreementStatuses: ActionCreator<CommonDataActionUpdateAgreementStatuses> =
    (statuses: object[]) => {
      return {
        type: UPDATE_AGREEMENT_STATUSES,
        statuses
      };
    };

export const updateAgencyChoices: ActionCreator<CommonDataActionUpdateAgencyChoices> =
    (agencyChoices: object[]) => {
      return {
        type: UPDATE_AGENCY_CHOICES,
        agencyChoices
      };
    };

export const updateAgreementAmendmentTypes: ActionCreator<CommonDataActionUpdateAgreementAmendmentTypes> =
    (types: object[]) => {
      return {
        type: UPDATE_AGREEMENT_AMENDMENT_TYPES,
        types
      };
    };

export const updateCsoTypes: ActionCreator<CommonDataActionUpdateCsoTypes> =
    (csoTypes: object[]) => {
      return {
        type: UPDATE_CSO_TYPES,
        csoTypes
      };
    };

export const updatePartnerTypes: ActionCreator<CommonDataActionUpdatePartnerTypes> =
    (partnerTypes: object[]) => {
      return {
        type: UPDATE_PARTNER_TYPES,
        partnerTypes
      };
    };

export const updateAssessmentTypes: ActionCreator<CommonDataActionUpdateAssessmentTypes> =
    (assessmentTypes: object[]) => {
      return {
        type: UPDATE_ASSESSMENT_TYPES,
        assessmentTypes
      };
    };

export const updateInterventionAmendmentTypes: ActionCreator<CommonDataActionUpdateInterventionAmendmentTypes> =
    (intAmendTypes: object[]) => {
      return {
        type: UPDATE_INTERVENTION_AMENDMENT_TYPES,
        intAmendTypes
      };
    };

export const updateLocationTypes: ActionCreator<CommonDataActionUpdateLocationTypes> =
    (locationTypes: object[]) => {
      return {
        type: UPDATE_LOCATION_TYPES,
        locationTypes
      };
    };

export const updatePartnerRiskRatings: ActionCreator<CommonDataActionUpdatePartnerRiskRatings> =
    (ratings: object[]) => {
      return {
        type: UPDATE_PARTNER_RISK_RATINGS,
        ratings
      };
    };


export const updateLocations: ActionCreator<CommonDataActionUpdateLocations> =
    (locations: object[]) => {
      return {
        type: UPDATE_LOCATIONS,
        locations
      };
    };

export const updateOfficesData: ActionCreator<CommonDataActionUpdateOffices> =
    (offices: object[]) => {
      return {
        type: UPDATE_OFFICES,
        offices
      };
    };

export const updatePRPCountries: ActionCreator<CommonDataActionUpdatePRPCountries> =
    (PRPCountryData: object[]) => {
      return {
        type: UPDATE_PRP_COUNTRIES,
        PRPCountryData
      };
    };

export const updateSections: ActionCreator<CommonDataActionUpdateSections> =
    (sections: object[]) => {
      return {
        type: UPDATE_SECTIONS,
        sections
      };
    };

export const updateUnicefUsers: ActionCreator<CommonDataActionUpdateUnicefUsers> =
    (unicefUsersData: object[]) => {
      return {
        type: UPDATE_UNICEF_USERS,
        unicefUsersData
      };
    };

export const updateUserCountryData: ActionCreator<CommonDataActionUpdateUserCountryData> =
    (countryData: object[]) => {
      return {
        type: UPDATE_USER_COUNTRY_DATA,
        countryData
      };
    };

export const updateEnvFlags: ActionCreator<CommonDataActionUpdateEnvFlags> =
    (envFlags: object) => {
      return {
        type: UPDATE_ENV_FLAGS,
        envFlags
      };
    };

export const updateReduxInAmendment: ActionCreator<CommonDataActionUpdateInAmendmentMode> =
    (inAmendment: object) => {
      return {
        type: UPDATE_IN_AMENDMENT_MODE_STATE,
        inAmendment
      };
    };

export const updateCurrentUser: ActionCreator<CommonDataActionUpdateCurrentUser> =
    (user: object) => {
      return{
        type: UPDATE_CURRENT_USER,
        user
      }
    };

export const setCurrentUser: ActionCreator<CommonDataActionSetCurrentUser> =
    (user: object) => {
      return {
        type: SET_CURRENT_USER,
        user
      }
    };
