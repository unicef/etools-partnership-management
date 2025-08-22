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
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {enableCommentMode} from '../../components/pages/interventions/pages/intervention-tab-pages/common/components/comments/comments.actions';
import {enableCommentMode as gddEnableCommentMode} from '../../components/pages/gpd-interventions/pages/intervention-tab-pages/common/components/comments/comments.actions.js';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {EtoolsRedirectPath} from '@unicef-polymer/etools-utils/dist/enums/router.enum';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';

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

const importInterventionSubRoutes = async (subRouteName: string | null) => {
  if (!subRouteName) {
    return;
  }

  const progressList = ['progress', 'implementation-status', 'monitoring-activities', 'results-reported', 'reports'];
  const pagesWithoutTabs = ['list', 'new'];

  try {
    if (progressList.includes(subRouteName)) {
      subRouteName = 'progress';
    }

    if (pagesWithoutTabs.includes(subRouteName)) {
      await import(
        `../../components/pages/interventions/pages/intervention-${subRouteName}/intervention-${subRouteName}.ts`
      );
    } else {
      await import('../../components/pages/interventions/pages/intervention-tab-pages/intervention-tabs.ts');
      await import(
        `../../components/pages/interventions/pages/intervention-tab-pages/intervention-${subRouteName}/intervention-${subRouteName}.ts`
      );
    }
  } catch {
    console.log(`No file imports configuration found interventions: ${subRouteName}!`);
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
  }
};

const importGDDInterventionSubRoutes = async (subRouteName: string | null) => {
  if (!subRouteName) {
    return;
  }

  const progressList = ['progress', 'implementation-status', 'monitoring-activities', 'results-reported', 'reports'];
  const notTabs = ['list', 'new'];

  try {
    if (progressList.includes(subRouteName)) {
      subRouteName = 'progress';
    }

    if (notTabs.includes(subRouteName)) {
      await import(
        `../../components/pages/gpd-interventions/pages/intervention-${subRouteName}/intervention-${subRouteName}.ts`
      );
    } else {
      await import('../../components/pages/gpd-interventions/pages/intervention-tab-pages/intervention-tabs.ts');
      await import(
        `../../components/pages/gpd-interventions/pages/intervention-tab-pages/intervention-${subRouteName}/intervention-${subRouteName}.ts`
      );
    }
  } catch {
    console.log(`No file imports configuration found gpd-interventions: ${subRouteName}!`);
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
  }
};
const importReportsSubRoutes = async (subRouteName: string | null) => {
  if (!subRouteName) {
    return;
  }

  try {
    await import(`../../components/pages/reports/pages/${subRouteName}/report-${subRouteName}.ts`);
  } catch {
    console.log(`No file imports configuration found reports: ${subRouteName}!`);
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
  }
};

const importPartnerSubRoutes = async (subRouteName: string | null) => {
  if (!subRouteName) {
    return;
  }

  try {
    await import(`../../components/pages/partners/pages/${subRouteName}/partner-${subRouteName}.ts`);
  } catch {
    console.log(`No file imports configuration found partners: ${subRouteName}!`);
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
  }
};

const importAgreementsSubRoutes = async (subRouteName: string | null) => {
  if (!subRouteName) {
    return;
  }

  try {
    await import(`../../components/pages/agreements/pages/${subRouteName}/agreement-${subRouteName}.ts`);
  } catch {
    console.log(`No file imports configuration found agreements: ${subRouteName}!`);
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
  }
};

const loadPageComponents = (routeDetails: EtoolsRouteDetails) => (_dispatch: any, _getState: any) => {
  if (!routeDetails) {
    // invalid route => redirect to 404 page
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
    return;
  }

  (async () => {
    const routeName = routeDetails.routeName;
    const subRouteImportFunctions: any = {
      partners: importPartnerSubRoutes,
      interventions: importInterventionSubRoutes,
      'gpd-interventions': importGDDInterventionSubRoutes,
      agreements: importAgreementsSubRoutes,
      reports: importReportsSubRoutes
    };

    try {
      await import(`../../components/pages/${routeName}/${routeName}-module.ts`);
      if (Object.keys(subRouteImportFunctions).includes(routeName)) {
        await subRouteImportFunctions[routeName](routeDetails.subRouteName);
      }
    } catch {
      console.log(`No file imports configuration found for module: ${routeDetails.routeName}!`);
      EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
    }
  })();
};

/** Update Redux route details and import lazy loaded pages */
export const handleUrlChange = (path: string) => (dispatch: any, getState: any) => {
  // if app route is accessed, redirect to default route (if not already on it)
  // @ts-ignore
  if (
    path === Environment.basePath &&
    Environment.basePath !== EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT)
  ) {
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT));
    return;
  }

  // some routes need redirect to subRoute list
  const redirectPath: string | undefined = EtoolsRouter.getRedirectToListPath(path);
  if (redirectPath) {
    EtoolsRouter.updateAppLocation(redirectPath);
    return;
  }

  const currentRouteDetails = getState().app.routeDetails;
  const routeDetails = EtoolsRouter.getRouteDetails(path);

  dispatch(loadPageComponents(routeDetails!));
  if (currentRouteDetails?.params?.id && routeDetails?.params?.id !== currentRouteDetails.params.id) {
    dispatch(resetCurrentItem());
  }

  if (!isJsonStrMatch(routeDetails, currentRouteDetails)) {
    dispatch(updateStoreRouteDetails(routeDetails));
    if (routeDetails?.routeName === 'interventions') {
      dispatch(enableCommentMode(Boolean(routeDetails?.queryParams?.comment_mode)));
    }
    if (routeDetails?.routeName === 'gpd-interventions') {
      dispatch(gddEnableCommentMode(Boolean(routeDetails?.queryParams?.comment_mode)));
    }
  }
};
