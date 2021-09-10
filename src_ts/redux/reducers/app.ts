/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import {Reducer} from 'redux';
import {UPDATE_DRAWER_STATE, AppAction} from '../actions/app.js';
import {SHOW_TOAST, CLOSE_TOAST, UPDATE_ROUTE_DETAILS} from '../actions/actionsConstants.js';
import {RouteDetails} from '../../components/utils/router.js';

export class AppState {
  page = '';
  drawerOpened = false;
  routeDetails: RouteDetails = {} as RouteDetails;
  toastNotification = {
    active: false,
    message: '',
    showCloseBtn: true
  };
}

const INITIAL_STATE = new AppState();

const app: Reducer<AppState, AppAction> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_ROUTE_DETAILS:
      return {
        ...state,
        routeDetails: action.routeDetails
      };
    case UPDATE_DRAWER_STATE:
      return {
        ...state,
        drawerOpened: action.opened
      };
    case SHOW_TOAST:
      return {
        ...state,
        toastNotification: {
          active: true,
          message: action.message,
          showCloseBtn: action.showCloseBtn
        }
      };
    case CLOSE_TOAST:
      return {
        ...state,
        toastNotification: {
          active: false,
          message: '',
          showCloseBtn: false
        }
      };
    default:
      return state;
  }
};

export default app;
