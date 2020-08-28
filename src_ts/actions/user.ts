import {Action, ActionCreator} from 'redux';
// import {ThunkAction} from 'redux-thunk';
// import {RootState} from '../store';
import {AnyObject, User} from '../typings/globals.types';

export const UPDATE_USER_DATA = 'UPDATE_USER_DATA';
export const UPDATE_USER_PERMISSIONS = 'UPDATE_USER_PERMISSIONS';

export interface UserActionUpdate extends Action<'UPDATE_USER_DATA'> {
  data: User;
}
export interface UserActionUpdatePermissions extends Action<'UPDATE_USER_PERMISSIONS'> {
  permissions: AnyObject;
}

export type UserAction = UserActionUpdate | UserActionUpdatePermissions;
// @ts-ignore - for now
// type ThunkResult = ThunkAction<void, RootState, undefined, UserAction>;

export const updateUserData: ActionCreator<UserActionUpdate> = (data: User) => {
  return {
    type: UPDATE_USER_DATA,
    data
  };
};

export const updateUserPermissions: ActionCreator<UserActionUpdatePermissions> = (permissions: AnyObject) => {
  return {
    type: UPDATE_USER_PERMISSIONS,
    permissions
  };
};
