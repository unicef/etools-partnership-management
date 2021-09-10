/**
 @license
 Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
 This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 Code distributed by Google as part of the polymer project is also
 subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

import {Action, ActionCreator} from 'redux';
import {ThunkAction} from 'redux-thunk';
import {RootState} from '../store';
import {GenericObject, LabelAndValue} from '@unicef-polymer/etools-types';

export const UPDATE_COUNTRY_PROGRAMMES = 'UPDATE_COUNTRY_PROGRAMMES';
export const UPDATE_DISAGGREGATIONS = 'UPDATE_DISAGGREGATIONS';
export const PATCH_DISAGGREGATION = 'PATCH_DISAGGREGATION';
export const ADD_DISAGGREGATION = 'ADD_DISAGGREGATION';
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
export const UPDATE_SEA_RISK_RATINGS = 'UPDATE_SEA_RISK_RATINGS';
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
export const UPDATE_GENDER_EQUITY = 'UPDATE_GENDER_EQUITY';
export const UPDATE_RISK_TYPES = 'UPDATE_RISK_TYPES';
export const UPDATE_CASH_TRANSFER_MODALITIES = 'UPDATE_CASH_TRANSFER_MODALITIES';

export interface CommonDataActionUpdateCountryProgrammes extends Action<'UPDATE_COUNTRY_PROGRAMMES'> {
  countryProgrammes: GenericObject[];
}

export interface CommonDataActionUpdateDisaggregations extends Action<'UPDATE_DISAGGREGATIONS'> {
  disaggregations: GenericObject[];
}

export interface CommonDataActionPatchDisaggregation extends Action<'PATCH_DISAGGREGATION'> {
  disaggregation: GenericObject;
}

export interface CommonDataActionAddDisaggregation extends Action<'ADD_DISAGGREGATION'> {
  disaggregation: GenericObject;
}

export interface CommonDataActionUpdateFileTypes extends Action<'UPDATE_FILE_TYPES'> {
  fileTypes: GenericObject[];
}

export interface CommonDataActionUpdateCpOutputs extends Action<'UPDATE_CP_OUTPUTS'> {
  cpOutputs: GenericObject[];
}

export interface CommonDataActionUpdateSignedByUnicefUsers extends Action<'UPDATE_SIGNED_BY_UNICEF_USERS'> {
  signedByUnicefUsers: GenericObject[];
}

export interface CommonDataActionUpdateDonors extends Action<'UPDATE_DONORS'> {
  donors: GenericObject[];
}

export interface CommonDataActionUpdateGrants extends Action<'UPDATE_GRANTS'> {
  grants: GenericObject[];
}

export interface CommonDataActionUpdateInterventionDocTypes extends Action<'UPDATE_INTERVENTION_DOC_TYPES'> {
  intDocTypes: GenericObject[];
}

export interface CommonDataActionUpdateInterventionStatuses extends Action<'UPDATE_INTERVENTION_STATUSES'> {
  statuses: GenericObject[];
}

export interface CommonDataActionUpdateCurrencies extends Action<'UPDATE_CURRENCIES'> {
  currencies: GenericObject[];
}

export interface CommonDataActionUpdateAgreementTypes extends Action<'UPDATE_AGREEMENT_TYPES'> {
  types: GenericObject[];
}

export interface CommonDataActionUpdateAgreementStatuses extends Action<'UPDATE_AGREEMENT_STATUSES'> {
  statuses: GenericObject[];
}

export interface CommonDataActionUpdateAgencyChoices extends Action<'UPDATE_AGENCY_CHOICES'> {
  agencyChoices: GenericObject[];
}

export interface CommonDataActionUpdateAgreementAmendmentTypes extends Action<'UPDATE_AGREEMENT_AMENDMENT_TYPES'> {
  types: GenericObject[];
}

export interface CommonDataActionUpdateCsoTypes extends Action<'UPDATE_CSO_TYPES'> {
  csoTypes: GenericObject[];
}

export interface CommonDataActionUpdatePartnerTypes extends Action<'UPDATE_PARTNER_TYPES'> {
  partnerTypes: GenericObject[];
}

export interface CommonDataActionUpdateAssessmentTypes extends Action<'UPDATE_ASSESSMENT_TYPES'> {
  assessmentTypes: GenericObject[];
}

export interface CommonDataActionUpdateInterventionAmendmentTypes
  extends Action<'UPDATE_INTERVENTION_AMENDMENT_TYPES'> {
  intAmendTypes: GenericObject[];
}

export interface CommonDataActionUpdateLocationTypes extends Action<'UPDATE_LOCATION_TYPES'> {
  locationTypes: GenericObject[];
}

export interface CommonDataActionUpdatePartnerRiskRatings extends Action<'UPDATE_PARTNER_RISK_RATINGS'> {
  ratings: GenericObject[];
}

export interface CommonDataActionUpdateLocations extends Action<'UPDATE_LOCATIONS'> {
  locations: GenericObject[];
}

export interface CommonDataActionUpdateOffices extends Action<'UPDATE_OFFICES'> {
  offices: GenericObject[];
}

export interface CommonDataActionUpdatePRPCountries extends Action<'UPDATE_PRP_COUNTRIES'> {
  PRPCountryData: GenericObject[];
}

export interface CommonDataActionUpdateSections extends Action<'UPDATE_SECTIONS'> {
  sections: GenericObject[];
}

export interface CommonDataActionUpdateUnicefUsers extends Action<'UPDATE_UNICEF_USERS'> {
  unicefUsersData: GenericObject[];
}

export interface CommonDataActionUpdateUserCountryData extends Action<'UPDATE_USER_COUNTRY_DATA'> {
  countryData: GenericObject;
}

export interface CommonDataActionUpdateEnvFlags extends Action<'UPDATE_ENV_FLAGS'> {
  envFlags: GenericObject;
}

export type CommonDataAction =
  | CommonDataActionUpdateCountryProgrammes
  | CommonDataActionUpdateDisaggregations
  | CommonDataActionPatchDisaggregation
  | CommonDataActionAddDisaggregation
  | CommonDataActionUpdateFileTypes
  | CommonDataActionUpdateCpOutputs
  | CommonDataActionUpdateSignedByUnicefUsers
  | CommonDataActionUpdateDonors
  | CommonDataActionUpdateGrants
  | CommonDataActionUpdateInterventionDocTypes
  | CommonDataActionUpdateInterventionStatuses
  | CommonDataActionUpdateCurrencies
  | CommonDataActionUpdateAgreementTypes
  | CommonDataActionUpdateAgreementStatuses
  | CommonDataActionUpdateAgencyChoices
  | CommonDataActionUpdateAgreementAmendmentTypes
  | CommonDataActionUpdateCsoTypes
  | CommonDataActionUpdatePartnerTypes
  | CommonDataActionUpdateAssessmentTypes
  | CommonDataActionUpdateInterventionAmendmentTypes
  | CommonDataActionUpdateLocationTypes
  | CommonDataActionUpdatePartnerRiskRatings
  | CommonDataActionUpdateLocations
  | CommonDataActionUpdateOffices
  | CommonDataActionUpdateSections
  | CommonDataActionUpdateUnicefUsers
  | CommonDataActionUpdateUserCountryData
  | CommonDataActionUpdatePRPCountries
  | CommonDataActionUpdateEnvFlags;

// @ts-ignore - for now
type ThunkResult = ThunkAction<void, RootState, undefined, CommonDataAction>;

export const updateCountryProgrammes: ActionCreator<CommonDataActionUpdateCountryProgrammes> = (
  countryProgrammes: GenericObject[]
) => {
  return {
    type: UPDATE_COUNTRY_PROGRAMMES,
    countryProgrammes
  };
};

export const updateDisaggregations: ActionCreator<CommonDataActionUpdateDisaggregations> = (
  disaggregations: GenericObject[]
) => {
  return {
    type: UPDATE_DISAGGREGATIONS,
    disaggregations
  };
};

export const patchDisaggregation: ActionCreator<CommonDataActionPatchDisaggregation> = (
  disaggregation: GenericObject
) => {
  return {
    type: PATCH_DISAGGREGATION,
    disaggregation
  };
};

export const addDisaggregation: ActionCreator<CommonDataActionAddDisaggregation> = (disaggregation: GenericObject) => {
  return {
    type: ADD_DISAGGREGATION,
    disaggregation
  };
};

export const updateFileTypes: ActionCreator<CommonDataActionUpdateFileTypes> = (fileTypes: GenericObject[]) => {
  return {
    type: UPDATE_FILE_TYPES,
    fileTypes
  };
};

export const updateCpOutputs: ActionCreator<CommonDataActionUpdateCpOutputs> = (cpOutputs: GenericObject[]) => {
  return {
    type: UPDATE_CP_OUTPUTS,
    cpOutputs
  };
};

export const updateSignedByUnicefUsers: ActionCreator<CommonDataActionUpdateSignedByUnicefUsers> = (
  signedByUnicefUsers: GenericObject[]
) => {
  return {
    type: UPDATE_SIGNED_BY_UNICEF_USERS,
    signedByUnicefUsers
  };
};

export const updateDonors: ActionCreator<CommonDataActionUpdateDonors> = (donors: GenericObject[]) => {
  return {
    type: UPDATE_DONORS,
    donors
  };
};

export const updateGrants: ActionCreator<CommonDataActionUpdateGrants> = (grants: GenericObject[]) => {
  return {
    type: UPDATE_GRANTS,
    grants
  };
};

export const updateInterventionDocTypes: ActionCreator<CommonDataActionUpdateInterventionDocTypes> = (
  intDocTypes: GenericObject[]
) => {
  return {
    type: UPDATE_INTERVENTION_DOC_TYPES,
    intDocTypes
  };
};

export const updateInterventionStatuses: ActionCreator<CommonDataActionUpdateInterventionStatuses> = (
  statuses: GenericObject[]
) => {
  return {
    type: UPDATE_INTERVENTION_STATUSES,
    statuses
  };
};

export const updateCurrencies: ActionCreator<CommonDataActionUpdateCurrencies> = (currencies: GenericObject[]) => {
  return {
    type: UPDATE_CURRENCIES,
    currencies
  };
};

export const updateAgreementTypes: ActionCreator<CommonDataActionUpdateAgreementTypes> = (types: GenericObject[]) => {
  return {
    type: UPDATE_AGREEMENT_TYPES,
    types
  };
};

export const updateAgreementStatuses: ActionCreator<CommonDataActionUpdateAgreementStatuses> = (
  statuses: GenericObject[]
) => {
  return {
    type: UPDATE_AGREEMENT_STATUSES,
    statuses
  };
};

export const updateAgencyChoices: ActionCreator<CommonDataActionUpdateAgencyChoices> = (
  agencyChoices: GenericObject[]
) => {
  return {
    type: UPDATE_AGENCY_CHOICES,
    agencyChoices
  };
};

export const updateAgreementAmendmentTypes: ActionCreator<CommonDataActionUpdateAgreementAmendmentTypes> = (
  types: GenericObject[]
) => {
  return {
    type: UPDATE_AGREEMENT_AMENDMENT_TYPES,
    types
  };
};

export const updateCsoTypes: ActionCreator<CommonDataActionUpdateCsoTypes> = (csoTypes: GenericObject[]) => {
  return {
    type: UPDATE_CSO_TYPES,
    csoTypes
  };
};

export const updatePartnerTypes: ActionCreator<CommonDataActionUpdatePartnerTypes> = (
  partnerTypes: GenericObject[]
) => {
  return {
    type: UPDATE_PARTNER_TYPES,
    partnerTypes
  };
};

export const updateSeaRiskRatings = (seaRiskRatings: LabelAndValue[]) => {
  return {
    type: UPDATE_SEA_RISK_RATINGS,
    seaRiskRatings
  };
};

export const updateAssessmentTypes: ActionCreator<CommonDataActionUpdateAssessmentTypes> = (
  assessmentTypes: GenericObject[]
) => {
  return {
    type: UPDATE_ASSESSMENT_TYPES,
    assessmentTypes
  };
};

export const updateInterventionAmendmentTypes: ActionCreator<CommonDataActionUpdateInterventionAmendmentTypes> = (
  intAmendTypes: GenericObject[]
) => {
  return {
    type: UPDATE_INTERVENTION_AMENDMENT_TYPES,
    intAmendTypes
  };
};

export const updateLocationTypes: ActionCreator<CommonDataActionUpdateLocationTypes> = (
  locationTypes: GenericObject[]
) => {
  return {
    type: UPDATE_LOCATION_TYPES,
    locationTypes
  };
};

export const updatePartnerRiskRatings: ActionCreator<CommonDataActionUpdatePartnerRiskRatings> = (
  ratings: GenericObject[]
) => {
  return {
    type: UPDATE_PARTNER_RISK_RATINGS,
    ratings
  };
};

export const updateLocations: ActionCreator<CommonDataActionUpdateLocations> = (locations: GenericObject[]) => {
  return {
    type: UPDATE_LOCATIONS,
    locations
  };
};

export const updateOfficesData: ActionCreator<CommonDataActionUpdateOffices> = (offices: GenericObject[]) => {
  return {
    type: UPDATE_OFFICES,
    offices
  };
};

export const updatePRPCountries: ActionCreator<CommonDataActionUpdatePRPCountries> = (
  PRPCountryData: GenericObject[]
) => {
  return {
    type: UPDATE_PRP_COUNTRIES,
    PRPCountryData
  };
};

export const updateSections: ActionCreator<CommonDataActionUpdateSections> = (sections: GenericObject[]) => {
  return {
    type: UPDATE_SECTIONS,
    sections
  };
};

export const updateUnicefUsers: ActionCreator<CommonDataActionUpdateUnicefUsers> = (
  unicefUsersData: GenericObject[]
) => {
  return {
    type: UPDATE_UNICEF_USERS,
    unicefUsersData
  };
};

export const updateUserCountryData: ActionCreator<CommonDataActionUpdateUserCountryData> = (
  countryData: GenericObject[]
) => {
  return {
    type: UPDATE_USER_COUNTRY_DATA,
    countryData
  };
};

export const updateEnvFlags: ActionCreator<CommonDataActionUpdateEnvFlags> = (envFlags: GenericObject) => {
  return {
    type: UPDATE_ENV_FLAGS,
    envFlags
  };
};

export const updateGenderEquity = (genderEquityRatings: LabelAndValue[]) => {
  return {
    type: UPDATE_GENDER_EQUITY,
    genderEquityRatings
  };
};

export const updateRiskTypes = (riskTypes: LabelAndValue[]) => {
  return {
    type: UPDATE_RISK_TYPES,
    riskTypes
  };
};

export const updateCashTransferModalities = (cashTransferModalities: LabelAndValue[]) => {
  return {
    type: UPDATE_CASH_TRANSFER_MODALITIES,
    cashTransferModalities
  };
};
