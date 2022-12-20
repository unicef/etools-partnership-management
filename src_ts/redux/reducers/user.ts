import {Reducer} from 'redux';
import {UPDATE_USER_DATA, UPDATE_USER_PERMISSIONS} from '../actions/user';
import {RootAction} from '../store';
import {GenericObject, User} from '@unicef-polymer/etools-types';

export interface UserState {
  data: User | null;
  permissions: GenericObject | null;
}

const INITIAL_USER_DATA: UserState = {
  data: null,
  permissions: null
};

const userData: Reducer<UserState, RootAction> = (state = INITIAL_USER_DATA, action) => {
  switch (action.type) {
    case UPDATE_USER_DATA:
      return {
        ...state,
        data: action.data
      };
    case UPDATE_USER_PERMISSIONS:
      return {
        ...state,
        permissions: action.permissions
      };
    default:
      return state;
  }
};

export default userData;
