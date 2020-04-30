import {store} from '../../../../store.js';
import {PolymerElement} from '@polymer/polymer';
import EndpointsMixin from '../../../endpoints/endpoints-mixin.js';
import AjaxServerErrorsMixin from '../../../mixins/ajax-server-errors-mixin.js';
import {Agreement, MinimalAgreement} from '../agreement.types.js';
import CONSTANTS from '../../../../config/app-constants.js';
import {addEditAgreement} from '../../../../actions/agreements.js';
import {EtoolsRequestError} from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin.js';
import {GenericObject} from '../../../../typings/globals.types.js';
import {fireEvent} from '../../../utils/fire-custom-event.js';
import {logError, logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {property} from '@polymer/decorators';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrorsMixin
 */
class AgreementItemData extends AjaxServerErrorsMixin(EndpointsMixin(PolymerElement)) {
  static get template() {
    return null;
  }

  @property({type: Object})
  agreementEndpoints = {
    DETAILS: 'agreementDetails',
    CREATE: 'agreements',
    DELETE: 'agreementDelete'
  };

  @property({type: Object, readOnly: true, notify: true})
  agreement!: Agreement;

  @property({type: Object})
  _partners!: {};

  @property({type: Number, notify: true, observer: '_agreementIdChanged'})
  agreementId: number | null = null;

  @property({type: Object})
  handleSuccResponseAdditionalCallback!: (response: any) => void;

  @property({type: String})
  ajaxLoadingMsgSource: string = 'ag-data';

  _triggerAgreementRequest(options: any) {
    const ajaxMethod = options.method || 'GET';
    return this.sendRequest(options).then((resp: any) => {
      this._handleSuccResponse(resp, ajaxMethod);
      return true;
    }).catch((error: any) => {
      if (error instanceof EtoolsRequestError === false) {
        logError('handleErrorResponse', 'agreement-item-data', error);
      }
      this.handleErrorResponse(error, ajaxMethod, true);
      return false;
    });
  }

  _agreementIdChanged(newId: string) {
    if (newId) {
      fireEvent(this, 'global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: this.ajaxLoadingMsgSource
      });
      this._triggerAgreementRequest({
        endpoint: this.getEndpoint(this.agreementEndpoints.DETAILS, {id: newId})
      });
    }
  }

  // Handle received data from request
  _handleSuccResponse(response: any, ajaxMethod: string) {
    // @ts-ignore
    this._setAgreement(response);

    // call additional callback, if any
    if (typeof this.handleSuccResponseAdditionalCallback === 'function') {
      this.handleSuccResponseAdditionalCallback.bind(this, response)();
      // reset callback
      this.set('handleSuccResponseAdditionalCallback', null);
    }
    if (ajaxMethod !== 'GET') {
      // 'agreement_number_status' is not retrieved from API
      response.agreement_number_status =
          this._computeAgrementNumberStatus(response.agreement_number,
            response.status);

      store.dispatch(addEditAgreement(this._getMinimalAgreementData(response)));

      const self = this;
      // update the agreement list in dexieDB
      window.EtoolsPmpApp.DexieDb.table('agreements').put(response).then(function() {
        fireEvent(self, 'reload-list');
      });
    }
    fireEvent(this, 'global-loading', {active: false, loadingSource: this.ajaxLoadingMsgSource});
  }

  _getMinimalAgreementData(detail: Agreement) {
    const minimalAgrData: MinimalAgreement = {
      agreement_number: '',
      agreement_number_status: '',
      agreement_type: '',
      end: null,
      id: null,
      partner: null,
      partner_name: null,
      signed_by: null,
      signed_by_partner_date: null,
      signed_by_unicef_date: null,
      start: null,
      status: ''
    };
    let propName: string;
    for (propName in minimalAgrData) {
      if (!detail.hasOwnProperty(propName)) {
        logWarn('Mapping property not found');
      } else {
        minimalAgrData[propName] = detail[propName];
      }
    }

    return minimalAgrData;
  }

  _computeAgrementNumberStatus(agrNumber: string, status: string) {
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);

    return agrNumber + ' [' + capitalizedStatus +']';
  }

  // Update agreement status. In addition set a callback to be called after request is complete.
  updateAgreementStatus(data: any, callback?: any) {
    if (!data.agreementId) {
      fireEvent(this, 'toast', {text: 'Invalid agreement ID', showCloseBtn: true});
    } else {
      if ([CONSTANTS.STATUSES.Signed.toLowerCase(),
        CONSTANTS.STATUSES.Suspended.toLowerCase(),
        CONSTANTS.STATUSES.Terminated.toLowerCase()].indexOf(data.status) > -1) {
        // status change is allowed
        // set additional callback if any
        if (callback) {
          this.set('handleResponseAdditionalCallback', callback);
        }
        fireEvent(this, 'global-loading', {
          message: 'Changing agreement status...',
          active: true,
          loadingSource: this.ajaxLoadingMsgSource
        });
        const endpoint = this.getEndpoint(this.agreementEndpoints.DETAILS, {id: data.agreementId});
        // fire in the hole
        if (CONSTANTS.STATUSES.Terminated.toLowerCase() == data.status) {
          this._triggerAgreementRequest({
            method: 'PATCH',
            endpoint: endpoint,
            body: {
              status: data.status,
              termination_doc_attachment: data.termination_doc_attachment
            }
          });
        } else {
          this._triggerAgreementRequest({
            method: 'PATCH',
            endpoint: endpoint,
            body: {
              status: data.status
            }
          });
        }

      } else {
        fireEvent(this, 'toast',
          {text: 'Changing status to \'' + data.status + '\' is not allowed!', showCloseBtn: true});
      }
    }
  }

  _hasFiles(list: GenericObject[], property: string) {
    if (!Array.isArray(list) || (Array.isArray(list) && list.length === 0)) {
      return false;
    }
    let hasF = false;
    let i;
    for (i = 0; i < list.length; i++) {
      if (list[i][property] instanceof File) {
        hasF = true;
      } else {
        delete list[i][property];
      }
    }
    return hasF;
  }

  // Save agreement data
  saveAgreement(agreement: GenericObject, succCallback: any) {
    if (typeof agreement === 'object' && Object.keys(agreement).length === 0) {
      fireEvent(this, 'toast', {text: 'Invalid agreement data!', showCloseBtn: true});
      return Promise.resolve(false);
    } else {
      let endpoint = null;
      let isNew = false;

      if (agreement.id) {
        // prepare PATCH endpoint
        endpoint = this.getEndpoint(this.agreementEndpoints.DETAILS, {id: agreement.id});
      } else {
        // new agreement, use POST method for the same endpoint
        endpoint = this.getEndpoint(this.agreementEndpoints.CREATE);
        isNew = true;
      }
      // remove id from data
      if (agreement.id) {
        delete agreement.id;
      }
      if (Object.keys(agreement).length > 0) {
        // set additional callback if any
        if (succCallback) {
          this.set('handleSuccResponseAdditionalCallback', succCallback);
        }

        fireEvent(this, 'global-loading', {
          message: 'Saving...',
          active: true,
          loadingSource: this.ajaxLoadingMsgSource
        });
        // fire in the hole
        const method = (isNew) ? 'POST' : 'PATCH';
        return this._triggerAgreementRequest({
          method: method,
          endpoint: endpoint,
          body: agreement
        });
      } else {
        fireEvent(this, 'toast', {
          text: 'All changes are saved.',
          showCloseBtn: false
        });
        return Promise.resolve(false);
      }
    }
  }

  deleteAgreement(id: string) {
    if (!id) {
      return;
    }
    const reqMethod = 'DELETE';
    this.fireRequest(this.agreementEndpoints.DELETE, {id: id}, {method: reqMethod}).then(() => {
      this._handleAgreementDeleteSuccess(id);
    }).catch((reqError: any) => {
      this.handleErrorResponse(reqError, reqMethod, false);
    });
  }

  _handleAgreementDeleteSuccess(id: string) {
    window.EtoolsPmpApp.DexieDb.agreements.where('id')
      .equals(parseInt(id, 10))
      .delete()
      .then((deleteCount: number) => this._handleAgreementDeleteFromDexieSuccess(deleteCount))
      .catch((dexieDeleteErr: any) => this._handleAgreementDeleteFromDexieErr(dexieDeleteErr))
      .then(() => {
        // go to agreements list after delete
        fireEvent(this, 'update-main-path', {path: 'agreements/list'});
      });
  }

  _handleAgreementDeleteFromDexieSuccess(deleteCount: number) {
    if (deleteCount === 1) {
      fireEvent(this, 'reload-list');
      fireEvent(this, 'toast', {
        text: 'Agreement successfully deleted.',
        showCloseBtn: true
      });
    } else {
      throw new Error('Agreement was not deleted from dexie!');
    }
  }

  _handleAgreementDeleteFromDexieErr(dexieDeleteErr: any) {
    // Agreement dexie deleted issue
    logError('Agreement delete from local dexie db failed!', 'agreement-item-data',
      dexieDeleteErr);
    fireEvent(this, 'toast', {
      text: 'The agreement was deleted from server database, but there was an issue on cleaning ' +
      'agreement data from browser cache. Use refresh data functionality to update cached agreements data.',
      showCloseBtn: true
    });
  }
}
window.customElements.define('agreement-item-data', AgreementItemData);

export default AgreementItemData;
