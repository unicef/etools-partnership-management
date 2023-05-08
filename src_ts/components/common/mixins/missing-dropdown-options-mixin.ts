import EndpointsMixin from '../../endpoints/endpoints-mixin';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
function MissingDropdownOptionsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class MissingDropdownOptionsClass extends EndpointsMixin(baseClass) {
    public setDropdownMissingOptionsAjaxDetails(dropdownEl: any, endpointName: any, params: any) {
      setTimeout(() => {
        try {
          if (dropdownEl) {
            const endpointUrl = this.getMissingOptionsEndpointUrl(endpointName);
            params = params ? params : {};

            dropdownEl.set('ajaxParams', params);
            dropdownEl.set('url', endpointUrl);
          } else {
            EtoolsLogger.warn(
              'Esmm element is null and the endpoint ' + endpointName + ' url can not be assigned to it!'
            );
          }
        } catch (err) {
          EtoolsLogger.error('An error occurred at ghost data esmm setup.', err);
        }
      });
    }

    public getMissingOptionsEndpointUrl(endpointName: any) {
      const endpoint = this.getEndpoint(endpointName);
      if (endpoint && endpoint.url) {
        return endpoint.url;
      }
      return null;
    }

    public getCleanEsmmOptions(options: any) {
      return options instanceof Array ? options.slice(0) : [];
    }
  }
  return MissingDropdownOptionsClass;
}

export default MissingDropdownOptionsMixin;
