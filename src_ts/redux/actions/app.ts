/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import {Action, ActionCreator} from 'redux';
import {UPDATE_ROUTE_DETAILS} from './actionsConstants';
import {RouteDetails} from '../../components/utils/router';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';
export const UPDATE_SMALLMENU_STATE = 'UPDATE_SMALLMENU_STATE';
export const RESET_CURRENT_ITEM = 'RESET_CURRENT_ITEM';
import {BASE_URL} from '../../config/config';
import {DEFAULT_ROUTE, EtoolsRouter, updateAppLocation} from '../../components/utils/routes';
import {getRedirectToListPath} from '../../components/utils/subpage-redirect';
import {isJsonStrMatch} from '../../components/utils/utils';

export interface AppActionUpdateDrawerState extends Action<'UPDATE_DRAWER_STATE'> {
  opened: boolean;
}
export interface AppActionShowToast extends Action<'SHOW_TOAST'> {
  active: boolean;
  message: string;
  showCloseBtn: boolean;
}

export type AppActionCloseToast = Action<'CLOSE_TOAST'>;
export interface AppActionUpdateRouteDetails extends Action<'UPDATE_ROUTE_DETAILS'> {
  routeDetails: RouteDetails;
}
export type AppAction =
  | AppActionUpdateDrawerState
  | AppActionShowToast
  | AppActionCloseToast
  | AppActionUpdateRouteDetails;

export const updateDrawerState: ActionCreator<AppActionUpdateDrawerState> = (opened: boolean) => {
  return {
    type: UPDATE_DRAWER_STATE,
    opened
  };
};

export const updateSmallMenu: any = (smallMenu: boolean) => {
  return {
    type: UPDATE_SMALLMENU_STATE,
    smallMenu
  };
};

export const updateStoreRouteDetails: ActionCreator<AppActionUpdateRouteDetails> = (routeDetails: any) => {
  return {
    type: UPDATE_ROUTE_DETAILS,
    routeDetails
  };
};

export const resetCurrentItem: any = () => {
  return {
    type: RESET_CURRENT_ITEM
  };
};

const importSubRoutes = (routeName: string, subRouteName: string | null) => {
  if (!subRouteName) {
    return;
  }
  if (['list'].includes(subRouteName)) {
    import(`../../components/pages/${routeName}/pages/${subRouteName}/${routeName}-${subRouteName}.js`);
  }
  if (['new'].includes(subRouteName)) {
    import(`../../components/pages/interventions/pages/new/intervention-new.js`);
  }
  if (['details', 'financial-assurance', 'overview', 'progress', 'summary'].includes(subRouteName)) {
    import(
      `../../components/pages/${routeName}/pages/${subRouteName}/${routeName.substring(
        0,
        routeName.length - 1
      )}-${subRouteName}.js`
    );
  }
  if (
    ['metadata', 'strategy', 'workplan', 'review', 'timing', 'attachments', 'progress', 'workplan-editor'].includes(
      subRouteName
    )
  ) {
    import(
      // eslint-disable-next-line
      `../../components/pages/interventions/pages/intervention-tab-pages/intervention-${subRouteName}/intervention-${subRouteName}.js`
    );
  }
};

const loadPageComponents = (routeDetails: RouteDetails) => (dispatch: any, getState: any) => {
  if (
    ['partners', 'interventions', 'agreements', 'government-partners', 'reports', 'settings'].includes(
      routeDetails.routeName
    )
  ) {
    if ('government-partners' == routeDetails.routeName) {
      import(`../../components/pages/partners/partners-module.js`)
        .then(() => importSubRoutes('partners', routeDetails.subRouteName))
        .catch(); // TODO
    } else {
      import(`../../components/pages/${routeDetails.routeName}/${routeDetails.routeName}-module.js`)
        .then(() => importSubRoutes(routeDetails.routeName, routeDetails.subRouteName))
        .catch(); // TODO
    }
  }
};

/** Update Redux route details and import lazy loaded pages */
export const handleUrlChange = (path: string) => (dispatch: any, getState: any) => {
  // if app route is accessed, redirect to default route (if not already on it)
  // @ts-ignore
  if (path === BASE_URL && BASE_URL !== DEFAULT_ROUTE) {
    updateAppLocation(DEFAULT_ROUTE);
    return;
  }

  // some routes need redirect to subRoute list
  const redirectPath: string | undefined = getRedirectToListPath(path);
  if (redirectPath) {
    updateAppLocation(redirectPath);
    return;
  }

  // handle leave page dialog
  // if (Number(getState().uploadStatus.uploadsInProgress) > 0 || Number(getState().uploadStatus.unsavedUploads) > 0) {
  // }

  // handle can Access
  const currentRouteDetails = getState().app.routeDetails;
  const routeDetails = EtoolsRouter.getRouteDetails(path);

  dispatch(loadPageComponents(routeDetails!));
  if (currentRouteDetails?.params?.id && routeDetails?.params?.id !== currentRouteDetails.params.id) {
    dispatch(resetCurrentItem());
  }
  if (!isJsonStrMatch(routeDetails, currentRouteDetails)) {
    dispatch(updateStoreRouteDetails(routeDetails));
  }
};
