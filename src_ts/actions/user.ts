import {Action, ActionCreator} from 'redux';
// import {ThunkAction} from 'redux-thunk';
// import {RootState} from '../store';
import {AnyObject, User} from '../typings/globals.types';

export const SET_USER_DATA = 'SET_USER_DATA';
export const SET_USER_PERMISSIONS = 'SET_USER_PERMISSIONS';

export interface UserActionSet extends Action<'SET_USER_DATA'> {data: User}
export interface UserActionSetPermissions extends Action<'SET_USER_PERMISSIONS'> {permissions: AnyObject}

export type UserAction = UserActionSet | UserActionSetPermissions;
// @ts-ignore - for now
// type ThunkResult = ThunkAction<void, RootState, undefined, UserAction>;

export const setUserData: ActionCreator<UserActionSet> = (data: User) => {
  return {
    type: SET_USER_DATA,
    data
  };
};
