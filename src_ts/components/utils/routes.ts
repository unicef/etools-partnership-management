import {BASE_URL} from '../../config/config';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {
  EtoolsRouteCallbackParams,
  EtoolsRouteDetails
} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';

const routeParamRegex = '([^\\/?#=+]+)';

EtoolsRouter.init({
  baseUrl: BASE_URL,
  redirectPaths: {
    notFound: '/not-found',
    default: '/partners/list'
  },
  redirectedPathsToSubpageLists: ['interventions', 'partners', 'reports', 'government-partners']
});

EtoolsRouter.addRoute(new RegExp('^interventions/list$'), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
  return {
    routeName: 'interventions',
    subRouteName: 'list',
    path: params.matchDetails[0],
    queryParams: params.queryParams,
    params: null
  };
})
  .addRoute(new RegExp('^partners/list$'), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'partners',
      subRouteName: 'list',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^settings$'), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'settings',
      subRouteName: '',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^agreements/list$'), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'agreements',
      subRouteName: 'list',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^interventions/new$'), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'interventions',
      subRouteName: 'new',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^government-partners/list$'), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'government-partners',
      subRouteName: 'list',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^reports/list$'), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
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
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
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
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
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
  .addRoute(new RegExp(`^agreements\\/?$`), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
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
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
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
  .addRoute(new RegExp(`^not-found$`), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'not-found',
      subRouteName: null,
      path: params.matchDetails[0],
      queryParams: null,
      params: null
    };
  })
  .addRoute(
    new RegExp(`^${routeParamRegex}\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
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
  .addRoute(
    new RegExp(`^${routeParamRegex}\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: params.matchDetails[0],
        subRouteName: 'list',
        path: params.matchDetails[1],
        queryParams: params.queryParams,
        params: null
      };
    }
  );
