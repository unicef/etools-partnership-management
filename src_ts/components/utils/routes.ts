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
  .addRoute(new RegExp('^interventions/list$'), (params: RouteCallbackParams): RouteDetails => {
    return {
      routeName: 'interventions',
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
  .addRoute(
    new RegExp(`^interventions\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: RouteCallbackParams): RouteDetails => {
      return {
        routeName: 'interventions',
        subRouteName: params.matchDetails[2], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          interventionId: params.matchDetails[1]
        }
      };
    }
  )
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
          interventionId: params.matchDetails[1]
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
