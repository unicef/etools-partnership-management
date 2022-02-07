// define here main routes that need redirect to list subRoute
import {BASE_URL} from '../../config/config';
import {Router} from './router';

/**
 * List of modules that have a main list subpage and if the current route path is the root path of this module,
 * redirect to module main list is needed.
 */
// TODO - make this file reusable
const redirectToListSubpageList = ['interventions', 'partners', 'reports', 'government-partners'];
const defaultPage = '/partners/list';

export const getRedirectToListPath = (path: string): undefined | string => {
  path = Router.clearStartEndSlashes(path.replace(BASE_URL, ''));

  const pathComponents = path.split('/');

  let redirectTo: string | undefined;
  if (pathComponents.length == 0) {
    redirectTo = defaultPage;
  }
  if (pathComponents.length == 1 && redirectToListSubpageList.includes(pathComponents[0])) {
    redirectTo = pathComponents[0] + '/list';
  }

  return redirectTo ? `${BASE_URL}${redirectTo}` : undefined;
};
