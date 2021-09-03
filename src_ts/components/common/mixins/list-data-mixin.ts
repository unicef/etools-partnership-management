// import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
import AjaxServerErrorsMixin from '../../common/mixins/ajax-server-errors-mixin';
import EndpointsMixin from '../../endpoints/endpoints-mixin';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {fireEvent} from '../../utils/fire-custom-event';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {Constructor} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrors
 */
function ListDataMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class ListDataClass extends EndpointsMixin(AjaxServerErrorsMixin(baseClass)) {
    @property({type: Object})
    options: {
      endpoint: EtoolsRequestEndpoint;
      csrf: boolean;
    } = {
      endpoint: {url: ''},
      csrf: true
    };

    @property({type: Array, readOnly: true, notify: true})
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

    static get observers() {
      return ['_endpointChanged(options.endpoint)'];
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this._removeAutomaticDataRefreshLoop();
    }

    ready() {
      super.ready();
      this._elementReady();
    }

    _elementReady() {
      if (!this.endpointName) {
        logWarn('Please specify an endpointName property', 'list-data-mixin');
      } else {
        this.set('options.endpoint', this.getEndpoint(this.endpointName));
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
      this._setData(res);
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
        this.set('_refreshInterval', null);
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

export default ListDataMixin;
