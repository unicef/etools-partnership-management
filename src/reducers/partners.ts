
import {createSelector} from 'reselect';
import * as a from '../actions/partners';
import { RootState } from '../store';

export class PartnersState {
  list: [] = [];
}

const INITIAL_STATE = new PartnersState();

const partners = (state = INITIAL_STATE, action: any) => {
  switch(action.type) {
    case a.SET_PARTNERS:
      return {
        list: action.partners
      }
    default:
      return state;
  }
}

export default partners;

// ------- Selectors ---

const partnersSelector = (state: RootState) => state.partners!.list;
const notHiddenPartnersSelector = createSelector(
  partnersSelector,
  (partners: any) => {
    return partners.filter((p:any) => !p.hidden);
  }
);

export const csoPartnersSelector = createSelector(
  notHiddenPartnersSelector,
  (partners: any) => {
    return partners.filter((p:any) =>
     p.partner_type === 'Civil Society Organization');
  }
);

export const partnersDropdownDataSelector = createSelector(
  notHiddenPartnersSelector,
  (partners: any) => {
    return partners.map((p: any) => {
      return {
        value: p.id,
        label: p.name
      };
    });
  }
);


