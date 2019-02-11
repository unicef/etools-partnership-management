import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import AjaxServerErrorsMixin from './ajax-server-errors-mixin';
import EventHelperMixin from './event-helper-mixin';
import EndpointsMixin from '../endpoints/endpoints-mixin';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsAjaxRequestMixin
 * @appliesMixin Endpoints
 * @appliesMixin EventHelper
 * @appliesMixin AjaxServerErrors
 */
const ListDataMixin = dedupingMixin((baseClass: any) =>
    class extends (EtoolsMixinFactory.combineMixins([
      EndpointsMixin, AjaxServerErrorsMixin, EventHelperMixin], baseClass) as any) {

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
          this.logWarn('Please specify an endpointName property', 'list-data-mixin');
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
            this.logWarn('Please specify data loaded event name(dataLoadedEventName property)', 'list-data-mixin');
          } else {
            this.fireEvent(this.dataLoadedEventName);
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
    });


export default ListDataMixin;
