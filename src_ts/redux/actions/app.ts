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
import {enableCommentMode as gddEnableCommentMode} from '../../components/pages/gdd-interventions/pages/intervention-tab-pages/common/components/comments/comments.actions';
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

const importInterventionSubRoutes = (subRouteName: string | null) => {
  if (!subRouteName) {
    return;
  }

  switch (subRouteName) {
    case 'list':
      import('../../components/pages/interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import('../../components/pages/interventions/pages/list/interventions-list.js');
      break;
    case 'new':
      import('../../components/pages/interventions/pages/new/intervention-new.js');
      break;
    case 'metadata':
      import('../../components/pages/interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/interventions/pages/intervention-tab-pages/intervention-metadata/intervention-metadata.js'
      );
      break;
    case 'workplan':
      import('../../components/pages/interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/interventions/pages/intervention-tab-pages/intervention-workplan/intervention-workplan.js'
      );
      break;
    case 'workplan-editor':
      import('../../components/pages/interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/interventions/pages/intervention-tab-pages/intervention-workplan-editor/intervention-workplan-editor.js'
      );
      break;
    case 'timing':
      import('../../components/pages/interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/interventions/pages/intervention-tab-pages/intervention-timing/intervention-timing.js'
      );
      break;
    case 'strategy':
      import('../../components/pages/interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/interventions/pages/intervention-tab-pages/intervention-strategy/intervention-strategy.js'
      );
      break;
    case 'attachments':
      import('../../components/pages/interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/interventions/pages/intervention-tab-pages/intervention-attachments/intervention-attachments.js'
      );
      break;
    case 'review':
      import('../../components/pages/interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/interventions/pages/intervention-tab-pages/intervention-review/intervention-review.js'
      );
      break;
    case 'progress':
    case 'implementation-status':
    case 'monitoring-activities':
    case 'results-reported':
    case 'reports':
      import('../../components/pages/interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/interventions/pages/intervention-tab-pages/intervention-progress/intervention-progress.js'
      );
      break;
    default:
      console.log(`No file imports configuration found interventions: ${subRouteName} (componentsLazyLoadConfig)!`);
      EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
      break;
  }
};

const importGDDInterventionSubRoutes = (subRouteName: string | null) => {
  if (!subRouteName) {
    return;
  }

  switch (subRouteName) {
    case 'list':
      import('../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import('../../components/pages/gdd-interventions/pages/list/gdd-interventions-list.js');
      break;
    case 'new':
      import('../../components/pages/gdd-interventions/pages/new/gdd-intervention-new.js');
      break;
    case 'metadata':
      import('../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-metadata/intervention-metadata.js'
      );
      break;
    case 'workplan':
      import('../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-workplan/intervention-workplan.js'
      );
      break;
    case 'timing':
      import('../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-timing/intervention-timing.js'
      );
      break;
    case 'strategy':
      import('../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-strategy/intervention-strategy.js'
      );
      break;
    case 'attachments':
      import('../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-attachments/intervention-attachments.js'
      );
      break;
    case 'review':
      import('../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-review/intervention-review.js'
      );
      break;
    case 'progress':
    case 'implementation-status':
    case 'monitoring-activities':
    case 'results-reported':
    case 'reports':
      import('../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-tabs.js');
      import(
        '../../components/pages/gdd-interventions/pages/intervention-tab-pages/intervention-progress/intervention-progress.js'
      );
      break;
    default:
      console.log(`No file imports configuration found interventions: ${subRouteName} (componentsLazyLoadConfig)!`);
      EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
      break;
  }
};
const importReportsSubRoutes = (subRouteName: string | null) => {
  if (!subRouteName) {
    return;
  }
  switch (subRouteName) {
    case 'list':
      import('../../components/pages/reports/pages/list/reports-list.js');
      break;
    case 'progress':
      import('../../components/pages/reports/pages/progress/report-progress.js');
      break;
    case 'summary':
      import('../../components/pages/reports/pages/summary/report-summary.js');
      break;
    default:
      console.log(`No file imports configuration found agreements: ${subRouteName} (componentsLazyLoadConfig)!`);
      EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
      break;
  }
};

const importPartnerSubRoutes = (subRouteName: string | null) => {
  if (!subRouteName) {
    return;
  }
  switch (subRouteName) {
    case 'list':
      import('../../components/pages/partners/pages/list/partners-list.js');
      break;
    case 'details':
      import('../../components/pages/partners/pages/details/partner-details.js');
      break;
    case 'overview':
      import('../../components/pages/partners/pages/overview/partner-overview.js');
      break;
    case 'financial-assurance':
      import('../../components/pages/partners/pages/financial-assurance/partner-financial-assurance.js');
      break;
    default:
      console.log(`No file imports configuration found partners: ${subRouteName} (componentsLazyLoadConfig)!`);
      EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
      break;
  }
};

const importAgreementsSubRoutes = (subRouteName: string | null) => {
  if (!subRouteName) {
    return;
  }
  switch (subRouteName) {
    case 'list':
      import('../../components/pages/agreements/pages/list/agreements-list.js');
      break;
    case 'details':
      import('../../components/pages/agreements/pages/details/agreement-details.js');
      break;
    default:
      console.log(`No file imports configuration found agreements: ${subRouteName} (componentsLazyLoadConfig)!`);
      EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
      break;
  }
};

const loadPageComponents = (routeDetails: EtoolsRouteDetails) => (_dispatch: any, _getState: any) => {
  if (!routeDetails) {
    // invalid route => redirect to 404 page
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
    return;
  }

  if (routeDetails.routeName === 'not-found') {
    import('../../components/pages/not-found/not-found.js');
  } else {
    switch (routeDetails.routeName) {
      case 'government-partners':
      case 'partners':
        import('../../components/pages/partners/partners-module.js')
          .then(() => importPartnerSubRoutes(routeDetails.subRouteName))
          .catch(() => EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND)));
        break;
      case 'interventions':
        import('../../components/pages/interventions/interventions-module.js')
          .then(() => importInterventionSubRoutes(routeDetails.subRouteName))
          .catch(() => EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND)));
        break;
      case 'gpd-interventions':
        import('../../components/pages/gdd-interventions/gdd-interventions-module.js')
          .then(() => importGDDInterventionSubRoutes(routeDetails.subRouteName))
          .catch(() => EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND)));
        break;
      case 'agreements':
        import('../../components/pages/agreements/agreements-module.js')
          .then(() => importAgreementsSubRoutes(routeDetails.subRouteName))
          .catch(() => EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND)));
        break;
      case 'reports':
        import('../../components/pages/reports/reports-module.js')
          .then(() => importReportsSubRoutes(routeDetails.subRouteName))
          .catch(() => EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND)));
        break;
      case 'settings':
        import('../../components/pages/settings/settings-module.js').catch(() =>
          EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND))
        );
        break;
    }
  }
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
    if (routeDetails?.routeName === 'interventions') {
      dispatch(enableCommentMode(Boolean(routeDetails?.queryParams?.comment_mode)));
    }
    if (routeDetails?.routeName === 'gpd-interventions') {
      dispatch(gddEnableCommentMode(Boolean(routeDetails?.queryParams?.comment_mode)));
    }
  }
};
