import {LitElement, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {RequestError} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request-mixin';
import AjaxServerErrorsMixin from '../../../common/mixins/ajax-server-errors-mixin-lit';
import {store} from '../../../../redux/store';
import {deletePartner, setShouldReloadPartners} from '../../../../redux/actions/partners';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {Partner} from '../../../../models/partners.models';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {formatServerErrorAsText} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../../endpoints/endpoints';
import {get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrorsMixin
 */
@customElement('partner-item-data')
export class PartnerItemData extends AjaxServerErrorsMixin(EndpointsLitMixin(LitElement)) {
  @property({type: Object})
  partnerEndpoints = {
    DETAILS: 'partnerDetails',
    CREATE: 'createPartner',
    DELETE: 'deletePartner'
  };

  @property({type: Object})
  partner!: Partner;

  @property({type: Number})
  partnerId: number | null = null;

  @property({type: Number})
  deletedPartnerId = -1;

  @property({type: Object})
  handleSuccResponseAdditionalCallback!: ((...args: any) => void) | null;

  @property({type: Object})
  handleErrResponseAdditionalCallback!: ((...args: any) => void) | null;

  private _skipDefaultErrorHandler = false;

  @property({type: String})
  ajaxLoadingMsgSource = 'partner-data';

  _partnerIdChanged(newId: any) {
    if (newId) {
      fireEvent(this, 'partner-changed', {});
      // set the new endpoint
      fireEvent(this, 'global-loading', {
        active: true,
        loadingSource: this.ajaxLoadingMsgSource
      });
      this._triggerPartnerRequest({
        endpoint: this.getEndpoint(pmpEdpoints, this.partnerEndpoints.DETAILS, {
          id: newId
        })
      });
    }
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('partnerId')) {
      this._partnerIdChanged(this.partnerId);
    }
  }

  _triggerPartnerRequest(options: any) {
    const ajaxMethod = options.method || 'GET';
    return sendRequest(options)
      .then((resp: any) => {
        this._handleSuccResponse(resp, ajaxMethod);
        return true;
      })
      .catch((error: any) => {
        this._handleErrorResponse(error, ajaxMethod);
        return false;
      });
  }

  _handleSuccResponse(response: any, ajaxMethod: any) {
    const partner = new Partner(response);
    fireEvent(this, 'partner-changed', partner);

    if (typeof this.handleSuccResponseAdditionalCallback === 'function') {
      this.handleSuccResponseAdditionalCallback.bind(this, partner)();
      // reset callback
      this.handleSuccResponseAdditionalCallback = null;
      this.handleErrResponseAdditionalCallback = null;
    }

    if (['GET', 'DELETE'].indexOf(ajaxMethod) === -1) {
      // update the partners list in dexieDB
      this.updatePartnersListInDexieDb(partner);
    }
    if (ajaxMethod === 'DELETE') {
      store.dispatch(deletePartner(this.deletedPartnerId));
      this._deletePartnerFromDexie(this.deletedPartnerId);
    }
    if (['PATCH', 'DELETE', 'POST'].includes(ajaxMethod)) {
      store.dispatch(setShouldReloadPartners(true));
    }
  }

  updatePartnersListInDexieDb(partner: any) {
    window.EtoolsPmpApp.DexieDb.table('partners')
      .put(partner)
      .then(() => {
        fireEvent(this, 'reload-list');
      });
  }

  public _deletePartnerFromDexie(id: any) {
    window.EtoolsPmpApp.DexieDb.partners
      .where('id')
      .equals(parseInt(id, 10))
      .delete()
      .then((deleteCount: number) => this._handlePartnerDeleteFromDexieSuccess(deleteCount))
      .catch((dexieDeleteErr: any) => this._handlePartnerDeleteFromDexieErr(dexieDeleteErr))
      .then(() => {
        // disable loading
        fireEvent(this, 'global-loading', {
          active: false,
          loadingSource: this.ajaxLoadingMsgSource
        });
        // go to partners list after delete
        fireEvent(this, 'update-main-path', {path: 'partners/list'});
      });
  }

  public _handlePartnerDeleteFromDexieSuccess(deleteCount: number) {
    if (deleteCount === 1) {
      fireEvent(this, 'reload-list');
      fireEvent(this, 'toast', {
        text: getTranslation('PARTNER_SUCCESSFULLY_DELETED')
      });
    } else {
      throw new Error('Partner was not deleted from dexie!');
    }
  }

  public _handlePartnerDeleteFromDexieErr(dexieDeleteErr: any) {
    // Partner dexie deleted issue
    EtoolsLogger.error('Partner delete from local dexie db failed!', 'partner-item-data', dexieDeleteErr);
    fireEvent(this, 'toast', {
      text: getTranslation('PLEASE_REFRESH_DATA')
    });
  }

  public _handleErrorResponse(response: any, ajaxMethod: any) {
    if (!(response instanceof RequestError)) {
      EtoolsLogger.error('_handleErrorResponse', 'partner-item-data', response);
    }
    if (this._skipDefaultErrorHandler) {
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: this.ajaxLoadingMsgSource
      });
    } else {
      this.handleErrorResponse(response, ajaxMethod, true);
    }
    this._skipDefaultErrorHandler = false;

    if (typeof this.handleErrResponseAdditionalCallback === 'function') {
      this.handleErrResponseAdditionalCallback.bind(this, formatServerErrorAsText(response))();
    }
    this.handleErrResponseAdditionalCallback = null;
    this.handleSuccResponseAdditionalCallback = null;
  }

  public createPartner(vendorNoObj: any, successCallback: any, errorCallback: any) {
    if (!vendorNoObj && !vendorNoObj.vendor) {
      fireEvent(this, 'toast', {
        text: getTranslation('PARTNER_INVALID_VENDOR_NUMBER')
      });
      return;
    }
    fireEvent(this, 'global-loading', {
      message: getTranslation('IMPORTING_PARTNER_INFO'),
      active: true,
      loadingSource: this.ajaxLoadingMsgSource
    });

    this.handleSuccResponseAdditionalCallback = successCallback;
    this.handleErrResponseAdditionalCallback = errorCallback;

    this._skipDefaultErrorHandler = true;
    const endpoint = this.getEndpoint(pmpEdpoints, this.partnerEndpoints.CREATE, vendorNoObj);
    this._triggerPartnerRequest({
      method: 'POST',
      endpoint: endpoint,
      body: {}
    });
  }

  public deletePartner(partner: any) {
    if (!partner.id) {
      return;
    }
    this.deletedPartnerId = partner.id;
    const endpoint = this.getEndpoint(pmpEdpoints, this.partnerEndpoints.DELETE, {
      id: partner.id
    });
    this._triggerPartnerRequest({
      method: 'DELETE',
      endpoint: endpoint,
      body: {}
    });
  }

  public savePartner(partner: any, callback?: any) {
    if (typeof partner === 'object' && Object.keys(partner).length === 0) {
      fireEvent(this, 'toast', {
        text: getTranslation('INVALID_PARTNER_DATA')
      });
      return Promise.resolve(false);
    } else {
      let endpoint = null;
      const partnerId = partner.id;
      // remove id from data
      if (partner.id) {
        delete partner.id;
      }
      if (Object.keys(partner).length > 0) {
        if (partnerId) {
          // prepare PATCH endpoint
          endpoint = this.getEndpoint(pmpEdpoints, this.partnerEndpoints.DETAILS, {
            id: partnerId
          });
        } else {
          // no valid partner id, cannot update
          fireEvent(this, 'toast', {
            text: getTranslation('UPDATE_FAILED_INVALID_PARTNER_ID')
          });
          return Promise.resolve(false);
        }
        // set additional callback if any
        if (callback) {
          this.handleSuccResponseAdditionalCallback = callback;
        }

        fireEvent(this, 'global-loading', {
          message: getTranslation('GENERAL.SAVING_DATA'),
          active: true,
          loadingSource: this.ajaxLoadingMsgSource
        });
        // fire in the hole
        return this._triggerPartnerRequest({
          method: 'PATCH',
          endpoint: endpoint,
          body: partner
        });
      } else {
        fireEvent(this, 'toast', {
          text: getTranslation('CHANGES_ARE_SAVED')
        });
        return Promise.resolve(false);
      }
    }
  }
}
