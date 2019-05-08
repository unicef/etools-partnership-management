import * as a from '../actions/page-data.js';
import {InterventionPermissionsFields} from '../typings/intervention.types';
import {Permission} from '../typings/globals.types';
import {Reducer, Action} from 'redux';

export class PageDataState {
  permissions: Permission<InterventionPermissionsFields> | null = null;
  in_amendment: boolean = false;
}

const INITIAL_STATE = new PageDataState();

const pageData: Reducer<PageDataState, Action<string>> = (state = INITIAL_STATE, action: any) => {
  switch (action.type) {
    case a.SET_PAGE_DATA_PERMISSIONS:
      return {
        ...state,
        permissions: action.permissions
      };
    case a.SET_IN_AMENDMENT_MODE:
      return {
        ...state,
        in_amendment: action.in_amendment
      };
    default:
      return state;
  }
};

export default pageData;
