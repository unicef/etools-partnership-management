// @ts-ignore
import EtoolsAjaxRequestMixin from 'etools-ajax/etools-ajax-request-mixin.js';
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
 const ListDataMixin = (baseClass: any) => class extends EndpointsMixin(
        AjaxServerErrorsMixin(
          EventHelperMixin(
            EtoolsAjaxRequestMixin(baseClass)))) {

static get properties() {
  return {
    options: {
      type: Object,
      value: {
        endpoint: null,
        csrf: true
      }
    },
    data: {
      type: Array,
      readOnly: true,
      notify: true
    },
    globalMessage: {
      type: String,
      value: 'An error occurred while trying to fetch the data!'
    },
    fireDataLoaded: {
      type: Boolean,
      value: false
    },
    _refreshInterval: {
      type: Object,
      value: null
    }
  };
}
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
  let self = this;
  this.sendRequest(this.options)
    .then(function(resp: any) {
      self._handleMyResponse(resp);
    }).catch(function(error: any) {
      self.handleErrorResponse(error);
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
};


export default ListDataMixin;
