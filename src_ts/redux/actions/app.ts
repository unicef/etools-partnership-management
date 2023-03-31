/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
/* eslint-disable max-len*/
import {Action, ActionCreator} from 'redux';
import {UPDATE_ROUTE_DETAILS} from './actionsConstants';
export const RESET_CURRENT_ITEM = 'RESET_CURRENT_ITEM';
import {BASE_URL} from '../../config/config';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/general.util';
import {enableCommentMode} from '../../components/pages/interventions/pages/intervention-tab-pages/common/components/comments/comments.actions';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {EtoolsRedirectPath} from '@unicef-polymer/etools-utils/dist/enums/router.enum';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';

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
  routeDetails: EtoolsRouteDetails;
}
export type AppAction =
  | AppActionUpdateDrawerState
  | AppActionShowToast
  | AppActionCloseToast
  | AppActionUpdateRouteDetails;

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
    import(
      `${window.location.origin}/pmp/src/components/pages/${routeName}/pages/${subRouteName}/${routeName}-${subRouteName}.js`
    );
  }
  if (['new'].includes(subRouteName)) {
    import(`${window.location.origin}/pmp/src/components/pages/interventions/pages/new/intervention-new.js`);
  }
  if (['details', 'financial-assurance', 'overview', 'summary'].includes(subRouteName)) {
    import(
      `${window.location.origin}/pmp/src/components/pages/${routeName}/pages/${subRouteName}/${routeName.substring(
        0,
        routeName.length - 1
      )}-${subRouteName}.js`
    );
  }
  if (['progress'].includes(subRouteName)) {
    if (routeName == 'reports') {
      import(
        `${window.location.origin}/pmp/src/components/pages/${routeName}/pages/${subRouteName}/${routeName.substring(
          0,
          routeName.length - 1
        )}-${subRouteName}.js`
      );
    } else {
      import(
        `${window.location.origin}/pmp/src/components/pages/interventions/pages/intervention-tab-pages/intervention-${subRouteName}/intervention-${subRouteName}.js`
      );
    }
  }
  if (
    ['metadata', 'strategy', 'workplan', 'review', 'timing', 'attachments', 'workplan-editor'].includes(subRouteName)
  ) {
    import(
      `${window.location.origin}/pmp/src/components/pages/interventions/pages/intervention-tab-pages/intervention-${subRouteName}/intervention-${subRouteName}.js`
    );
  }
};

const loadPageComponents = (routeDetails: EtoolsRouteDetails) => (_dispatch: any, _getState: any) => {
  if (!routeDetails) {
    // invalid route => redirect to 404 page
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
    return;
  }

  if (
    ['partners', 'interventions', 'agreements', 'government-partners', 'reports', 'settings'].includes(
      routeDetails.routeName
    )
  ) {
    if ('government-partners' == routeDetails.routeName) {
      import(`${window.location.origin}/pmp/src/components/pages/partners/partners-module.js`)
        .then(() => importSubRoutes('partners', routeDetails.subRouteName))
        .catch(() => EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND)));
    } else {
      import(
        `${window.location.origin}/pmp/src/components/pages/${routeDetails.routeName}/${routeDetails.routeName}-module.js`
      )
        .then(() => importSubRoutes(routeDetails.routeName, routeDetails.subRouteName))
        .catch(() => EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND)));
    }
  }
  if (routeDetails.routeName == 'not-found') {
    import(`${window.location.origin}/pmp/src/components/pages/not-found/not-found.js`);
  }
};

/** Update Redux route details and import lazy loaded pages */
export const handleUrlChange = (path: string) => (dispatch: any, getState: any) => {
  // if app route is accessed, redirect to default route (if not already on it)
  // @ts-ignore
  if (path === BASE_URL && BASE_URL !== EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT)) {
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT));
    return;
  }

  // some routes need redirect to subRoute list
  const redirectPath: string | undefined = EtoolsRouter.getRedirectToListPath(path);
  if (redirectPath) {
    EtoolsRouter.updateAppLocation(redirectPath);
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
    dispatch(enableCommentMode(Boolean(routeDetails?.queryParams?.comment_mode)));
  }
};
