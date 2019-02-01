import {PolymerElement} from "@polymer/polymer";

import EtoolsAjaxRequestMixin from 'etools-ajax/etools-ajax-request-mixin.js';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';

import EndpointsMixin from '../../../endpoints/endpoints-mixin.js';
import EventHelperMixin from '../../../mixins/event-helper-mixin.js';
import AjaxServerErrorsMixin from '../../../mixins/ajax-server-errors-mixin.js';
import {store} from "pwa-helpers/demo/store";
import {connect} from "pwa-helpers/connect-mixin";


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin EtoolsAjaxRequestMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrorsMixin
 * @appliesMixin EventHelperMixin
 */
const PartnerItemDataRequiredMixins = EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  EtoolsAjaxRequestMixin,
  EndpointsMixin,
  EventHelperMixin,
  AjaxServerErrorsMixin
]);

/**
 * @polymer
 * @customElement
 * @appliesMixin PartnerItemDataRequiredMixins
 */
class PartnerItemData extends connect(store)(PartnerItemDataRequiredMixins) {

  static get properties() {
    return {
      partnerEndpoints: {
        type: Object,
        value: {
          DETAILS: 'partnerDetails',
          CREATE: 'createPartner',
          DELETE: 'deletePartner'
        }
      },
      partner: {
        type: Object,
        readOnly: true,
        notify: true
      },
      partnerId: {
        type: Number,
        notify: true,
        observer: '_partnerIdChanged'
      },
      deletedPartnerId: {
        type: Number
      },
      handleSuccResponseAdditionalCallback: Object,
      handleErrResponseAdditionalCallback: Object,
      _skipDefaultErrorHandler: Boolean,
      /**
       * ajaxLoadingMsgSource use is required for request errors handling in AjaxServerErrorsBehavior
       */
      ajaxLoadingMsgSource: {
        type: String,
        value: 'partner-data'
      }
    };
  }

  public _partnerIdChanged(newId: any) {
    if (newId) {
      // set an empty partner
      this._setPartner({});
      // set the new endpoint
      this.fireEvent('global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: this.ajaxLoadingMsgSource
      });
      this._triggerPartnerRequest({endpoint: this.getEndpoint(this.partnerEndpoints.DETAILS, {id: newId})});
    }
  }

  public _triggerPartnerRequest(options: any) {
    let ajaxMethod = options.method || 'GET';
    return this.sendRequest(options).then((resp: any) => {
      this._handleSuccResponse(resp, ajaxMethod);
      return true;
    }).catch((error: any) => {
      this._handleErrorResponse(error, ajaxMethod);
      return false;
    });
  }

  public _handleSuccResponse(response: any, ajaxMethod: any) {
    this._setPartner(response);

    if (typeof this.handleSuccResponseAdditionalCallback === 'function') {
      this.handleSuccResponseAdditionalCallback.bind(this, response)();
      // reset callback
      this.set('handleSuccResponseAdditionalCallback', null);
      this.set('handleErrResponseAdditionalCallback', null);
    }

    if (['GET', 'DELETE'].indexOf(ajaxMethod) === -1) {
      // update the partners list in dexieDB
      window.EtoolsPmpApp.DexieDb.table('partners').put(response).then(() => {
        this.fireEvent('reload-list');
      });
    }
    if (ajaxMethod === 'DELETE') {
      store.dispatch('deletePartner', this.deletedPartnerId);
      this._deletePartnerFromDexie(this.deletedPartnerId);
    }
  }

  public _deletePartnerFromDexie(id: any) {
    window.EtoolsPmpApp.DexieDb.partners.where('id')
        .equals(parseInt(id, 10))
        .delete()
        .then(deleteCount => this._handlePartnerDeleteFromDexieSuccess(deleteCount))
        .catch(dexieDeleteErr => this._handlePartnerDeleteFromDexieErr(dexieDeleteErr))
        .then(() => {
          // disable loading
          this.fireEvent('global-loading', {
            active: false,
            loadingSource: this.ajaxLoadingMsgSource
          });
          // go to partners list after delete
          this.fireEvent('update-main-path', {path: 'partners/list'});
        });
  }

  public _handlePartnerDeleteFromDexieSuccess(deleteCount: number) {
    if (deleteCount === 1) {
      this.fireEvent('reload-list');
      this.fireEvent('toast', {
        text: 'Partner successfully deleted.',
        showCloseBtn: true
      });
    } else {
      throw new Error('Partner was not deleted from dexie!');
    }
  }

  public _handlePartnerDeleteFromDexieErr(dexieDeleteErr: any) {
    // Partner dexie deleted issue
    this.logError('Partner delete from local dexie db failed!', 'partner-item-data', dexieDeleteErr);
    this.fireEvent('toast', {
      text: 'The partner was deleted from server database, but there was an issue on cleaning ' +
          'partner data from browser cache. Use refresh data functionality to update cached partners data.',
      showCloseBtn: true
    });
  }

  public _handleErrorResponse(response: any, ajaxMethod: any) {
    if (response instanceof EtoolsRequestError === false) {
      this.logError('_handleErrorResponse', 'partner-item-data', response);
    }
    if (this._skipDefaultErrorHandler) {
      this.fireEvent('global-loading', {
        active: false,
        loadingSource: this.ajaxLoadingMsgSource
      });
    } else {
      this.handleErrorResponse(response, ajaxMethod, true);
    }
    this.set('_skipDefaultErrorHandler', false);

    if (typeof this.handleErrResponseAdditionalCallback === 'function') {
      this.handleErrResponseAdditionalCallback.bind(this,
          this.formatServerErrorAsText(this.tryGetResponseError(response)))();
    }
    this.handleErrResponseAdditionalCallback = null;
    this.handleSuccResponseAdditionalCallback = null;
  }

  public createPartner(vendorNoObj: any, successCallback: any, errorCallback: any) {
    if (!vendorNoObj && !vendorNoObj.vendor) {
      this.fireEvent('toast', {
        text: 'Invalid Vendor Number for new partner!',
        showCloseBtn: true
      });
      return;
    }
    this.fireEvent('global-loading', {
      message: 'Importing partner information...',
      active: true,
      loadingSource: this.ajaxLoadingMsgSource
    });

    this.handleSuccResponseAdditionalCallback = successCallback;
    this.handleErrResponseAdditionalCallback = errorCallback;

    this.set('_skipDefaultErrorHandler', true);
    let endpoint = this.getEndpoint(this.partnerEndpoints.CREATE, vendorNoObj);
    this._triggerPartnerRequest({method: 'POST', endpoint: endpoint, body: {}});
  }

  public deletePartner(partner: any) {
    if (!partner.id) {
      return;
    }
    this.deletedPartnerId = partner.id;
    let endpoint = this.getEndpoint(this.partnerEndpoints.DELETE, {id: partner.id});
    this._triggerPartnerRequest({method: 'DELETE', endpoint: endpoint, body: {}});
  }

  public savePartner(partner: any, callback: any) {
    if (typeof partner === 'object' && Object.keys(partner).length === 0) {
      this.fireEvent('toast', {text: 'Invalid partner data!', showCloseBtn: true});
      return Promise.resolve(false);
    } else {
      let endpoint = null;
      let partnerId = partner.id;
      // remove id from data
      if (partner.id) {
        delete partner.id;
      }
      if (Object.keys(partner).length > 0) {
        if (partnerId) {
          // prepare PATCH endpoint
          endpoint = this.getEndpoint(this.partnerEndpoints.DETAILS, {id: partnerId});
        } else {
          // no valid partner id, cannot update
          this.fireEvent('toast', {
            text: 'Update cannot be made. Invalid partner ID.',
            showCloseBtn: true
          });
          return Promise.resolve(false);
        }
        // set additional callback if any
        if (callback) {
          this.set('handleSuccResponseAdditionalCallback', callback);
        }

        this.fireEvent('global-loading', {
          message: 'Saving...',
          active: true,
          loadingSource: this.ajaxLoadingMsgSource
        });
        // fire in the hole
        return this._triggerPartnerRequest({
          method: 'PATCH', endpoint: endpoint, body: partner
        });
      } else {
        this.fireEvent('toast', {
          text: 'There is nothing to save. No change detected on this partner.',
          showCloseBtn: true
        });
        return Promise.resolve(false);
      }
    }
  }

}

export default PartnerItemData;
