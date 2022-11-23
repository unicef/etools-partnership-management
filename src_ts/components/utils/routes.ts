import {RouteDetails, RouteCallbackParams, Router} from './router';
import {BASE_URL} from '../../config/config';

export const EtoolsRouter = new Router(BASE_URL);
const routeParamRegex = '([^\\/?#=+]+)';

EtoolsRouter.addRoute(new RegExp('^interventions/list$'), (params: RouteCallbackParams): RouteDetails => {
  return {
    routeName: 'interventions',
    subRouteName: 'list',
    path: params.matchDetails[0],
    queryParams: params.queryParams,
    params: null
  };
})
  .addRoute(new RegExp('^partners/list$'), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'partners',
      subRouteName: 'list',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^settings$'), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'settings',
      subRouteName: '',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^agreements/list$'), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'agreements',
      subRouteName: 'list',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^interventions/new$'), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'interventions',
      subRouteName: 'new',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^government-partners/list$'), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'government-partners',
      subRouteName: 'list',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^reports/list$'), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'reports',
      subRouteName: 'list',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(
    new RegExp(`^interventions\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: RouteCallbackParams): RouteDetails => {
      return {
        routeName: 'interventions',
        subRouteName: params.matchDetails[2], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          interventionId: params.matchDetails[1],
          id: params.matchDetails[1]
        }
      };
    }
  )
  .addRoute(
    new RegExp(`^agreements\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: RouteCallbackParams): RouteDetails => {
      return {
        routeName: 'agreements',
        subRouteName: params.matchDetails[2], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          agreementId: params.matchDetails[1]
        }
      };
    }
  )
  .addRoute(new RegExp(`^agreements\\/?$`), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'agreements',
      subRouteName: '', // tab name
      path: params.matchDetails[0],
      queryParams: {},
      params: {}
    };
  })
  .addRoute(
    new RegExp(`^interventions\\/${routeParamRegex}\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: RouteCallbackParams): RouteDetails => {
      return {
        routeName: 'interventions',
        subRouteName: params.matchDetails[2], // tab name
        subSubRouteName: params.matchDetails[3], // sub tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          interventionId: params.matchDetails[1],
          id: params.matchDetails[1]
        }
      };
    }
  )
  .addRoute(new RegExp(`^page-not-found$`), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'page-not-found',
      subRouteName: null,
      path: params.matchDetails[0],
      queryParams: null,
      params: null
    };
  })
  .addRoute(
    new RegExp(`^${routeParamRegex}\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: RouteCallbackParams): RouteDetails => {
      return {
        routeName: params.matchDetails[1],
        subRouteName: params.matchDetails[3], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          itemId: params.matchDetails[2]
        }
      };
    }
  )
  .addRoute(new RegExp(`^${routeParamRegex}\\/${routeParamRegex}$`), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: params.matchDetails[0],
      subRouteName: 'list',
      path: params.matchDetails[1],
      queryParams: params.queryParams,
      params: null
    };
  });

/**
 * Utility used to update location based on routes and dispatch navigate action (optional)
 */
export const updateAppLocation = (newLocation: string): void => {
  const _newLocation = EtoolsRouter.prepareLocationPath(newLocation);

  EtoolsRouter.pushState(_newLocation);

  window.dispatchEvent(new CustomEvent('popstate'));
};

export const replaceAppLocation = (newLocation: string): void => {
  const _newLocation = EtoolsRouter.prepareLocationPath(newLocation);

  EtoolsRouter.replaceState(_newLocation);

  /**
   * Note that just calling history.pushState() or history.replaceState()
   * won't trigger a popstate event.
   * The popstate event is only triggered by doing a browser action
   * such as a click on the back button (or calling history.back() in JavaScript).
   */
  window.dispatchEvent(new CustomEvent('popstate'));
};

export const ROUTE_404 = '/not-found';
export const DEFAULT_ROUTE = '/partners/list';
