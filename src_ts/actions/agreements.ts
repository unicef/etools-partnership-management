import { MinimalAgreement } from '../components/app-modules/agreements/agreement.types';

export const SET_AGREEMENTS = 'SET_AGREEMENTS';
export const ADD_EDIT_AGREEMENT = 'ADD_EDIT_AGREEMENT';

export const setAgreements = (agreements: Array<MinimalAgreement>) => {
  return {
    type: SET_AGREEMENTS,
    agreements
  }
};

export const addEditAgreement = (agreement: MinimalAgreement) => {
  return {
    type: ADD_EDIT_AGREEMENT,
    agreement
  }
};
