import * as a from '../actions/agreements.js';
import { MinimalAgreement } from '../components/app-modules/agreements/agreement.types.js';


export class AgreementsState {
  list: [] = [];
}

const INITIAL_STATE = new AgreementsState();

const agreements = (state = INITIAL_STATE, action: any) => {
  switch(action.type) {
    case a.SET_AGREEMENTS:
      return {
        ...state,
        list: agreements
      };
     case a.ADD_EDIT_AGREEMENT: {
      let agreementsCopy: Array<MinimalAgreement> = state.list.slice(0);
      let index = agreementsCopy.findIndex((agr: MinimalAgreement) =>{
        return agr.id === action.agreement.id;
      });

      if (index > -1) {
        agreementsCopy[index] = action.agreement;
      } else {
        agreementsCopy.push(action.agreement);
      }
      return {
        list: agreementsCopy
      };
     }

    default:
      return state;
  }
}

export default agreements;
