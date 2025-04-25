import * as a from '../actions/agreements.js';
import {MinimalAgreement} from '@unicef-polymer/etools-types';

export class AgreementsState {
  list: MinimalAgreement[] = [];
  listIsLoaded = false;
  shouldReloadList = false;
  unicefRepresentatives!: UnicefRepresentative[];
}

const INITIAL_STATE = new AgreementsState();

const agreements = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case a.SET_AGREEMENTS:
      return {
        ...state,
        list: action.agreements,
        listIsLoaded: true,
        shouldReloadList: true
      };
    case a.SET_SHOULD_RELOAD_AGREEMENTS:
      return {
        ...state,
        shouldReloadList: action.shouldReloadList
      };
    case a.ADD_EDIT_AGREEMENT: {
      const agreementsCopy: MinimalAgreement[] = state.list.slice(0);
      const index = agreementsCopy.findIndex((agr: MinimalAgreement) => {
        return agr.id === action.agreement.id;
      });

      if (index > -1) {
        agreementsCopy[index] = action.agreement;
      } else {
        agreementsCopy.push(action.agreement);
      }
      return {
        list: agreementsCopy,
        listIsLoaded: true,
        shouldReloadList: true
      };
    }
    case a.SET_UNICEF_REPRESENTATIVES: {
      return {
        ...state,
        unicefRepresentatives: action.rep
      };
    }

    default:
      return state;
  }
};

export default agreements;
