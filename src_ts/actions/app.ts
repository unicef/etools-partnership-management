/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import { Action, ActionCreator } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { RootState } from '../store.js';
export const UPDATE_PAGE = 'UPDATE_PAGE';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';

export interface AppActionUpdatePage extends Action<'UPDATE_PAGE'> {page: string};
export interface AppActionUpdateDrawerState extends Action<'UPDATE_DRAWER_STATE'> {opened: boolean};
export type AppAction = AppActionUpdatePage | AppActionUpdateDrawerState;

type ThunkResult = ThunkAction<void, RootState, undefined, AppAction>;

// @ts-ignore
export const navigate: ActionCreator<ThunkResult> = (path: string) => (dispatch) => {
//   // Extract the page name from path.
//   const p: string = path.replace('/pmp_poly3', '');
//   const page = p === '/' ? 'page-one' : p.slice(1);
//
//   // Any other info you might want to extract from the path (like page type),
//   // you can do here
//   dispatch(loadPage(page));
//
//   // Close the drawer - in case the *path* change came from a link in the drawer.
//   dispatch(updateDrawerState(false));
};

// @ts-ignore
const loadPage: ActionCreator<ThunkResult> = (page: string) => (dispatch) => {
//   switch(page) {
//     case 'page-one':
//       import('../components/pages/page-one.js').then(() => {
//         // Put code in here that you want to run every time when
//         // navigating to view1 after my-view1.js is loaded.
//       });
//       break;
//     case 'page-two':
//       import('../components/pages/page-two.js');
//       break;
//     default:
//       page = 'page-not-found';
//       import('../components/pages/page-not-found.js');
//   }
//
//   dispatch(updatePage(page));
};

// @ts-ignore
const updatePage: ActionCreator<AppActionUpdatePage> = (page: string) => {
  return {
    type: UPDATE_PAGE,
    page
  };
};

export const updateDrawerState: ActionCreator<AppActionUpdateDrawerState> = (opened: boolean) => {
  return {
    type: UPDATE_DRAWER_STATE,
    opened
  };
};
