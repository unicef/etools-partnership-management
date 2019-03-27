//import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
import AjaxServerErrorsMixin from './ajax-server-errors-mixin';
import EndpointsMixin from '../endpoints/endpoints-mixin';
import { fireEvent } from '../utils/fire-custom-event';
import { logWarn } from 'etools-behaviors/etools-logging';
import { Constructor } from '../../typings/globals.types';
import { PolymerElement } from '@polymer/polymer';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsAjaxRequestMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrors
 */
function ListDataMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
    // @ts-ignore
    class listDataClass extends EndpointsMixin(AjaxServerErrorsMixin(baseClass)) {

      static get properties() {
        return {
          options: Object,
          data: {
            type: Array,
            readOnly: true,
            notify: true
          },
          globalMessage: String,
          fireDataLoaded: Boolean,
          _refreshInterval: Object
        };
      }

      public options: any = {
        endpoint: null,
        csrf: true
      };
      public data: any[] = [];
      public globalMessage: string = 'An error occurred while trying to fetch the data!';
      public fireDataLoaded: boolean =  false;
      protected _refreshInterval: any = null;
      public endpointName: string = '';

      static get observers() {
        return [
          '_endpointChanged(options.endpoint)'
        ];
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
        this.sendRequest(this.options)
            .then((resp: any) => {
              this._handleMyResponse(resp);
            }).catch((error: any) => {
              this.handleErrorResponse(error);
            });
      }

// some children overwrite this function for custom data processing
      _handleMyResponse(res: any) {
        this._handleResponse(res);
      }

      _handleResponse(res: any) {
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
        if (newEndpoint && newEndpoint.hasOwnProperty('exp') && newEndpoint.exp > 0) {
          this._removeAutomaticDataRefreshLoop();
          this._setAutomaticDataRefreshLoop(newEndpoint);
        }
      }

      _removeAutomaticDataRefreshLoop() {
        if (this._refreshInterval !== null) {
          clearInterval(this._refreshInterval);
          this.set('_refreshInterval', null);
        }
      }

      _setAutomaticDataRefreshLoop(newEndpoint: any) {
        this._refreshInterval = setInterval(() => {
          this._requestListData();
        }, newEndpoint.exp);
      }
    };
    return listDataClass;
}

export default ListDataMixin;
