import {MinimalAgreement} from '@unicef-polymer/etools-types';

export const SET_AGREEMENTS = 'SET_AGREEMENTS';
export const ADD_EDIT_AGREEMENT = 'ADD_EDIT_AGREEMENT';
export const SET_SHOULD_RELOAD_AGREEMENTS = 'SET_SHOULD_RELOAD_AGREEMENTS';

export const setAgreements = (agreements: MinimalAgreement[]) => {
  return {
    type: SET_AGREEMENTS,
    agreements
  };
};

export const addEditAgreement = (agreement: Partial<MinimalAgreement>) => {
  return {
    type: ADD_EDIT_AGREEMENT,
    agreement
  };
};

export const setShouldReloadAgreements = (shouldReloadList: boolean) => {
  return {
    type: SET_SHOULD_RELOAD_AGREEMENTS,
    shouldReloadList
  };
};
