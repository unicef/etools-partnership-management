/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/


declare global {
  interface Window {
    process?: Object;
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

import {
  createStore,
  compose,
  applyMiddleware,
  combineReducers,
  Reducer,
  StoreEnhancer
} from 'redux';
import thunk, { ThunkMiddleware } from 'redux-thunk';
import { lazyReducerEnhancer } from 'pwa-helpers/lazy-reducer-enhancer.js';

import app, { AppState } from './reducers/app.js';
import { AppAction } from './actions/app.js';

import { CommonDataState } from './reducers/common-data.js';
import { UploadStatusState } from './reducers/upload-status.js';
import { CommonDataAction } from "./actions/common-data.js";
import { PartnersState } from './reducers/partners.js';
import { AgreementsState } from './reducers/agreements.js';
import { PageDataState } from './reducers/page-data.js';

// Overall state extends static states and partials lazy states.
export interface RootState {
  app?: AppState;
  commonData?: CommonDataState;
  uploadStatus?: UploadStatusState;
  partners?: PartnersState;
  agreements?: AgreementsState;
  pageData?: PageDataState;
}

export type RootAction = AppAction | CommonDataAction;

// Sets up a Chrome extension for time travel debugging.
// See https://github.com/zalmoxisus/redux-devtools-extension for more information.
const devCompose: <Ext0, Ext1, StateExt0, StateExt1>(
  f1: StoreEnhancer<Ext0, StateExt0>, f2: StoreEnhancer<Ext1, StateExt1>
) => StoreEnhancer<Ext0 & Ext1, StateExt0 & StateExt1> =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// Initializes the Redux store with a lazyReducerEnhancer (so that you can
// lazily add reducers after the store has been created) and redux-thunk (so
// that you can dispatch async actions). See the "Redux and state management"
// section of the wiki for more details:
// https://github.com/Polymer/pwa-starter-kit/wiki/4.-Redux-and-state-management
export const store = createStore(
  state => state as Reducer<RootState, RootAction>,
  devCompose(
    lazyReducerEnhancer(combineReducers),
    applyMiddleware(thunk as ThunkMiddleware<RootState, RootAction>))
);

// Initially loaded reducers.
store.addReducers({
  // @ts-ignore
  app
});

window.addEventListener('storage', function(e) {
  if (e.key !== 'update-redux' || !e.newValue) {
    return;
  }
  store.dispatch(JSON.parse(e.newValue));
});

window.addEventListener('beforeunload', function(e) {
  const state = store.getState();
  if (!(state as any).uploadStatus) {
    return;
  }
  const uploadsInprogressNumber: number = (state as any).uploadStatus.uploadsInProgress;
  const unsavedUploadsNumber: number = (state as any).uploadStatus.unsavedUploads;
  if (uploadsInprogressNumber > 0 || unsavedUploadsNumber > 0) {
    // Cancel the event as stated by the standard.
    e.preventDefault();
    // Chrome requires returnValue to be set.
    e.returnValue = 'Are you sure? Uploads in progress will be lost!';
  }
});

/**
 * IMPORTANT!
 * For any other reducers use lazy loading like this (in the element that needs the reducer)
 *    import counter from '../reducers/x-reducer.js';
 *    store.addReducers({
 *       xReducer
 *   });
 */
