const PROD_DOMAIN: string = 'etools.unicef.org';
const STAGING_DOMAIN: string = 'etools-staging.unicef.org';
const DEV_DOMAIN: string = 'etools-dev.unicef.org';
const DEMO_DOMAIN: string = 'etools-demo.unicef.org';

export const isProductionServer = () => {
  let location = window.location.href;
  return location.indexOf(PROD_DOMAIN) > -1;
};

export const isStagingServer = () => {
  let location = window.location.href;
  return location.indexOf(STAGING_DOMAIN) > -1;
};

export const isDevServer = () => {
  return window.location.href.indexOf(DEV_DOMAIN) > -1;
};
export const isDemoServer = () => {
  return window.location.href.indexOf(DEMO_DOMAIN) > -1;
};
