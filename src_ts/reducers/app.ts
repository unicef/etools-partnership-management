/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { Reducer } from "redux";
import { UPDATE_DRAWER_STATE, AppAction } from "../actions/app.js";

export class AppState {
  page: string = "";
  drawerOpened: boolean = false;
}

const INITIAL_STATE = new AppState();

const app: Reducer<AppState, AppAction> = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case UPDATE_DRAWER_STATE:
      return {
        ...state,
        drawerOpened: action.opened,
      };
    default:
      return state;
  }
};

export default app;
