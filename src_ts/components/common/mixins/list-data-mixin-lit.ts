import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {Constructor} from '@unicef-polymer/etools-types';
import {LitElement, PropertyValues} from 'lit';
import {property} from 'lit/decorators.js';
import AjaxServerErrorsMixin from './ajax-server-errors-mixin-lit';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../endpoints/endpoints';

/**
 * @LitElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrors
 */
function ListDataMixinLit<T extends Constructor<LitElement>>(baseClass: T) {
  class ListDataClass extends EndpointsLitMixin(AjaxServerErrorsMixin(baseClass)) {
    @property({type: Object})
    options: {
      endpoint: RequestEndpoint;
      csrf: boolean;
    } = {
      endpoint: {url: ''},
      csrf: true
    };

    @property({type: Array})
    data: [] = [];

    @property({type: Boolean})
    listDataIsLoaded = false;

    @property({type: String})
    globalMessage = 'An error occurred while trying to fetch the data!';

    @property({type: Boolean})
    fireDataLoaded = false;

    @property({type: Object})
    _refreshInterval: number | null = null;

    // Defined in the element that uses this mixin
    endpointName!: string;
    handleErrorResponse!: (e: any) => void;
    dataLoadedEventName!: string;
    // -----
    @property({type: Boolean, attribute: 'no-get-request'})
    noGetRequest = false;

    disconnectedCallback() {
      super.disconnectedCallback();
      this._removeAutomaticDataRefreshLoop();
    }

    firstUpdated(changedProperties: PropertyValues) {
      super.firstUpdated(changedProperties);
      this._elementReady();
    }

    updated(changedProperties: PropertyValues) {
      super.updated(changedProperties);
      if (
        changedProperties.has('options') &&
        this.options.endpoint !== (changedProperties.get('options') as any)?.endpoint
      ) {
        this._endpointChanged(this.options.endpoint);
      }
    }

    _elementReady() {
      if (!this.endpointName) {
        EtoolsLogger.warn('Please specify an endpointName property', 'list-data-mixin');
        return Promise.resolve(false);
      } else {
        if (!this.noGetRequest) {
          // List data is retrieved by <...-list-data> comp. from app-shell
          // exclude the other ones
          this.options.endpoint = this.getEndpoint(pmpEdpoints, this.endpointName);
          return this._requestListData();
        }
      }
      return Promise.resolve(false);
    }

    _requestListData() {
      return sendRequest(this.options)
        .then((resp: any) => {
          this._handleMyResponse(resp);
          this.listDataIsLoaded = true;
        })
        .catch((error: any) => {
          this.handleErrorResponse(error);
        });
    }

    // some children overwrite this function for custom data processing
    _handleMyResponse(res: any) {
      this._handleResponse(res);
    }

    _handleResponse(res: any) {
      // @ts-ignore
      this.data = res;
      fireEvent(this, 'data-loaded', res);
      if (this.fireDataLoaded) {
        if (!this.dataLoadedEventName) {
          EtoolsLogger.warn('Please specify data loaded event name(dataLoadedEventName property)', 'list-data-mixin');
        } else {
          fireEvent(this, this.dataLoadedEventName);
        }
      }
    }

    _endpointChanged(newEndpoint: any) {
      if (typeof newEndpoint === 'undefined') {
        return;
      }
      if (
        newEndpoint &&
        Object.prototype.hasOwnProperty.call(newEndpoint, 'exp') &&
        newEndpoint.exp > 0 &&
        !this.noGetRequest
      ) {
        this._removeAutomaticDataRefreshLoop();
        this._setAutomaticDataRefreshLoop(newEndpoint);
      }
    }

    _removeAutomaticDataRefreshLoop() {
      if (this._refreshInterval !== null) {
        // @ts-ignore
        clearInterval(this._refreshInterval);
        this._refreshInterval = null;
      }
    }

    _setAutomaticDataRefreshLoop(newEndpoint: any) {
      this._refreshInterval = Number(
        setInterval(() => {
          this._requestListData();
        }, newEndpoint.exp)
      );
    }
  }
  return ListDataClass;
}

export default ListDataMixinLit;
