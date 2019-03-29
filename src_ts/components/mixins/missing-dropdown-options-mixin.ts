import EndpointsMixin from '../endpoints/endpoints-mixin';
import {logError, logWarn} from 'etools-behaviors/etools-logging.js';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
const MissingDropdownOptionsMixin = (baseClass: any) =>
    // @ts-ignore
    class extends EndpointsMixin(baseClass) {
      public setDropdownMissingOptionsAjaxDetails(dropdownEl: any, endpointName: any, params: any) {
        let self = this;
        setTimeout(function() {
          try {
            if (dropdownEl) {
              let endpointUrl = self.getMissingOptionsEndpointUrl(endpointName);
              params = (params) ? params : {};

              dropdownEl.set('ajaxParams', params);
              dropdownEl.set('url', endpointUrl);
            } else {
              logWarn('Esmm element is null and the endpoint ' + endpointName + ' url can not be assigned to it!');
            }
          } catch (err) {
            logError('An error occurred at ghost data esmm setup.', err);
          }
        });
      }

      public getMissingOptionsEndpointUrl(endpointName: any) {
        let endpoint = this.getEndpoint(endpointName);
        if (endpoint && endpoint.url) {
          return endpoint.url;
        }
        return null;
      }

      public getCleanEsmmOptions(options: any) {
        return (options instanceof Array) ? options.slice(0) : [];
      }
};

export default MissingDropdownOptionsMixin;

