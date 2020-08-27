import {Reducer} from 'redux';
import {SET_USER_DATA, SET_USER_PERMISSIONS} from '../actions/user';
import {User} from '../typings/globals.types';
import {RootAction} from '../store';
import {AnyObject} from '../typings/globals.types';

export interface UserState {
  data: User | null;
  permissions: AnyObject | null;
}

const INITIAL_USER_DATA: UserState = {
  data: null,
  permissions: null
};

const userData: Reducer<UserState, RootAction> = (state = INITIAL_USER_DATA, action) => {
  console.log(action.type);
  console.log(action.data);
  switch (action.type) {
    case SET_USER_DATA:
      return {
        ...state,
        data: action.data
      };
    case SET_USER_PERMISSIONS:
      return {
        ...state,
        permissions: action.permissions
      };
    default:
      return state;
  }
};

export default userData;
