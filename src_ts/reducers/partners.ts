import { createSelector } from "reselect";
import * as a from "../actions/partners";
import { RootState } from "../store";
import { Reducer, Action } from "redux";

export class PartnersState {
  list: [] = [];
}

const INITIAL_STATE = new PartnersState();

const partners: Reducer<PartnersState, Action<string>> = (
  state = INITIAL_STATE,
  action: any
) => {
  switch (action.type) {
    case a.SET_PARTNERS:
      return {
        list: action.partners,
      };
    case a.DELETE_PARTNER: {
      const partnersCopy = state.list.slice(0);
      const index = partnersCopy.findIndex(
        (p: any) => p.id === action.partnerId
      );
      if (index > -1) {
        partnersCopy.splice(index, 1);
      }

      return {
        list: partnersCopy,
      };
    }

    default:
      return state;
  }
};

export default partners;

// ------- Selectors ---

const partnersSelector = (state: RootState) => state.partners!.list;
const notHiddenPartnersSelector = createSelector(
  partnersSelector,
  (partners: any) => {
    return partners.filter((p: any) => !p.hidden);
  }
);

export const csoPartnersSelector = createSelector(
  notHiddenPartnersSelector,
  (partners: any) => {
    return partners.filter(
      (p: any) => p.partner_type === "Civil Society Organization"
    );
  }
);

export const partnersDropdownDataSelector = createSelector(
  notHiddenPartnersSelector,
  (partners: any) => {
    return partners.map((p: any) => {
      return {
        value: p.id,
        label: p.name,
      };
    });
  }
);
