/* eslint-disable max-len */
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
import {EtoolsRouter} from '../../components/utils/routes';
export const UPDATE_DRAWER_STATE = 'UPDATE_DRAWER_STATE';
export const UPDATE_SMALLMENU_STATE = 'UPDATE_SMALLMENU_STATE';
export const RESET_CURRENT_ITEM = 'RESET_CURRENT_ITEM';

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

const loadPageComponents = (routeDetails: RouteDetails) => (dispatch, getState) => {
  if (!routeDetails) {
    // invalid route => redirect to 404 page
    EtoolsRouter.updateAppLocation('/not-found');
    return;
  }

  if (routeDetails.routeName === 'not-found') {
    import('../../components/pages/not-found/not-found.js');
  } else {
    if (routeDetails.routeName == 'interventions') {
      switch (routeDetails.subRouteName) {
        case 'list':
          import('../../components/pages/interventions/pages/list/interventions-list');
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
          import('../../components/pages/interventions/pages/intervention-tab-pages/intervention-tabs.js');
          import(
            '../../components/pages/interventions/pages/intervention-tab-pages/intervention-progress/intervention-progress.js'
          );
          break;

        default:
          console.log('No file imports configuration found (componentsLazyLoadConfig)!');
          EtoolsRouter.updateAppLocation('/not-found');
          break;
      }
    } else if (routeDetails.routeName == 'partners') {
      switch (routeDetails.subRouteName) {
        case 'list':
          import('../../components/pages/partners/pages/list/partners-list');
          break;
        case 'details':
          import('../../components/pages/partners/pages/details/partner-details.js');
          break;
        case 'financial-assurance':
          import(
            '../../components/pages/interventions/pages/intervention-tab-pages/intervention-metadata/intervention-metadata.js'
          );
          break;
        case 'overview':
          import(
            '../../components/pages/interventions/pages/intervention-tab-pages/intervention-metadata/intervention-metadata.js'
          );
          break;
        default:
          console.log('No file imports configuration found (componentsLazyLoadConfig)!');
          EtoolsRouter.updateAppLocation('/not-found');
          break;
      }
    } else if (routeDetails.routeName == 'governments') {
      // TODO
    } else if (routeDetails.routeName == 'agreements') {
      switch (routeDetails.subRouteName) {
        case 'list':
          import('../../components/pages/interventions/pages/list/interventions-list');
          break;
        case 'details':
          import(
            '../../components/pages/interventions/pages/intervention-tab-pages/intervention-metadata/intervention-metadata.js'
          );
          break;
        default:
          console.log('No file imports configuration found (componentsLazyLoadConfig)!');
          EtoolsRouter.updateAppLocation('/not-found');
          break;
      }
    }
  }
};

export const updateStoreRouteDetails: ActionCreator<AppActionUpdateRouteDetails> = (routeDetails: any) => {
  loadPageComponents(routeDetails);
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
