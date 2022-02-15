// import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {fireEvent} from '../../utils/fire-custom-event';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging';
import {Constructor} from '@unicef-polymer/etools-types';
import {LitElement, property, PropertyValues} from 'lit-element';
import AjaxServerErrorsMixin from './ajax-server-errors-mixin-lit';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../endpoints/endpoints';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrors
 */
function ListDataMixinLit<T extends Constructor<LitElement>>(baseClass: T) {
  class ListDataClass extends EndpointsLitMixin(AjaxServerErrorsMixin(baseClass)) {
    @property({type: Object})
    options: {
      endpoint: EtoolsRequestEndpoint;
      csrf: boolean;
    } = {
      endpoint: {url: ''},
      csrf: true
    };

    @property({type: Array})
    data: [] = [];

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
        logWarn('Please specify an endpointName property', 'list-data-mixin');
      } else {
        this.options.endpoint = this.getEndpoint(pmpEdpoints, this.endpointName);
        this._requestListData();
      }
    }

    _requestListData() {
      sendRequest(this.options)
        .then((resp: any) => {
          this._handleMyResponse(resp);
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
          logWarn('Please specify data loaded event name(dataLoadedEventName property)', 'list-data-mixin');
        } else {
          fireEvent(this, this.dataLoadedEventName);
        }
      }
    }

    _endpointChanged(newEndpoint: any) {
      if (typeof newEndpoint === 'undefined') {
        return;
      }
      if (newEndpoint && Object.prototype.hasOwnProperty.call(newEndpoint, 'exp') && newEndpoint.exp > 0) {
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
