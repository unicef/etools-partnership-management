import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin EtoolsPmpApp.Mixins.Endpoints
 */
const MissingDropdownOptionsMixin = (baseClass: any) =>
    class extends  window.EtoolsPmpApp.Mixins.Endpoints(EtoolsLogsMixin(baseClass)) {
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
              self.logWarn('Esmm element is null and the endpoint ' + endpointName + ' url can not be assigned to it!');
            }
          } catch (err) {
            self.logError('An error occurred at ghost data esmm setup.', err);
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

