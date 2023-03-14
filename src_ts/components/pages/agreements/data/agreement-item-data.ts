import {store} from '../../../../redux/store';
import {LitElement, property, customElement} from 'lit-element';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import AjaxServerErrorsMixin from '../../../common/mixins/ajax-server-errors-mixin-lit';
import CONSTANTS from '../../../../config/app-constants.js';
import {addEditAgreement, setShouldReloadAgreements} from '../../../../redux/actions/agreements';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {EtoolsRequestError} from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin.js';
import {fireEvent} from '../../../utils/fire-custom-event';
import {logError, logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {Agreement, MinimalAgreement, GenericObject} from '@unicef-polymer/etools-types';
import {isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import pmpEdpoints from '../../../endpoints/endpoints';
import {get as getTranslation} from 'lit-translate';
/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxServerErrorsMixin
 */
@customElement('agreement-item-data')
export class AgreementItemData extends AjaxServerErrorsMixin(EndpointsLitMixin(LitElement)) {
  render() {
    return null;
  }

  @property({type: Object})
  agreementEndpoints = {
    DETAILS: 'agreementDetails',
    CREATE: 'agreements',
    DELETE: 'agreementDelete'
  };

  private _agreement!: Agreement;
  @property({type: Object})
  get agreement() {
    return this._agreement;
  }

  set agreement(agreement: Agreement) {
    if (!isJsonStrMatch(this._agreement, agreement)) {
      this._agreement = agreement;
      fireEvent(this, 'agreement-changed', this.agreement);
    }
  }

  @property({type: Object})
  _partners!: GenericObject;

  private _agreementId!: number;
  @property({type: Number})
  get agreementId() {
    return this._agreementId;
  }

  set agreementId(agreementId: number) {
    this._agreementId = agreementId;
    this._agreementIdChanged(this.agreementId);
  }

  @property({type: Object})
  handleSuccResponseAdditionalCallback!: ((response: any) => void) | null;

  @property({type: String})
  ajaxLoadingMsgSource = 'ag-data';

  _triggerAgreementRequest(options: any) {
    const ajaxMethod = options.method || 'GET';
    return sendRequest(options)
      .then((resp: any) => {
        this._handleSuccResponse(resp, ajaxMethod);
        return resp;
      })
      .catch((error: any) => {
        if (error instanceof EtoolsRequestError === false) {
          logError('handleErrorResponse', 'agreement-item-data', error);
        }
        this.handleErrorResponse(error, ajaxMethod, true);
        return false;
      });
  }

  _agreementIdChanged(newId: number | null) {
    if (newId) {
      fireEvent(this, 'global-loading', {
        active: true,
        loadingSource: this.ajaxLoadingMsgSource
      });
      this._triggerAgreementRequest({
        endpoint: this.getEndpoint(pmpEdpoints, this.agreementEndpoints.DETAILS, {
          id: newId
        })
      });
    } else {
      this.agreement = new Agreement();
    }
  }

  // Handle received data from request
  _handleSuccResponse(response: any, ajaxMethod: string) {
    // @ts-ignore
    this.agreement = response;

    if (ajaxMethod !== 'GET') {
      // 'agreement_number_status' is not retrieved from API
      response.agreement_number_status = this._computeAgrementNumberStatus(response.agreement_number, response.status);

      store.dispatch(addEditAgreement(this._getMinimalAgreementData(response)));

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this;
      // update the agreement list in dexieDB
      window.EtoolsPmpApp.DexieDb.table('agreements')
        .put(response)
        .then(function () {
          fireEvent(self, 'reload-list');
        });
    }
    setTimeout(() => {
      // call additional callback, if any
      if (typeof this.handleSuccResponseAdditionalCallback === 'function') {
        this.handleSuccResponseAdditionalCallback(response);
        // reset callback
        this.handleSuccResponseAdditionalCallback = null;
      }
    }, 50);
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: this.ajaxLoadingMsgSource
    });
  }

  _getMinimalAgreementData(detail: Agreement) {
    const minimalAgrData: Partial<MinimalAgreement> = {
      agreement_number: '',
      agreement_number_status: '',
      agreement_type: '',
      authorized_officers: [],
      end: '',
      country_programme: null,
      id: null,
      partner: null,
      partner_name: '',
      signed_by: null,
      signed_by_partner_date: '',
      signed_by_unicef_date: '',
      start: '',
      status: ''
    };
    let propName: string;
    for (propName in minimalAgrData) {
      if (!Object.prototype.hasOwnProperty.call(detail, propName)) {
        logWarn('Mapping property not found');
      } else {
        // @ts-ignore
        minimalAgrData[propName] = detail[propName];
      }
    }

    return minimalAgrData;
  }

  _computeAgrementNumberStatus(agrNumber: string, status: string) {
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);

    return agrNumber + ' [' + capitalizedStatus + ']';
  }

  // Update agreement status. In addition set a callback to be called after request is complete.
  updateAgreementStatus(data: any, callback?: any) {
    if (!data.agreementId) {
      fireEvent(this, 'toast', {
        text: 'Invalid agreement ID'
      });
    } else {
      if (
        [
          CONSTANTS.STATUSES.Signed.toLowerCase(),
          CONSTANTS.STATUSES.Suspended.toLowerCase(),
          CONSTANTS.STATUSES.Terminated.toLowerCase()
        ].indexOf(data.status) > -1
      ) {
        // status change is allowed
        // set additional callback if any
        if (callback) {
          this.handleSuccResponseAdditionalCallback = callback;
        }
        fireEvent(this, 'global-loading', {
          message: 'Changing agreement status...',
          active: true,
          loadingSource: this.ajaxLoadingMsgSource
        });

        const requestOptions: any = {
          method: 'PATCH',
          endpoint: this.getEndpoint(pmpEdpoints, this.agreementEndpoints.DETAILS, {
            id: data.agreementId
          }),
          body: {
            status: data.status
          }
        };

        if (CONSTANTS.STATUSES.Terminated.toLowerCase() == data.status) {
          requestOptions.body.termination_doc = data.termination_doc;
        }

        this._triggerAgreementRequest(requestOptions);
      } else {
        fireEvent(this, 'toast', {
          text: "Changing status to '" + data.status + "' is not allowed!"
        });
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
      fireEvent(this, 'toast', {
        text: 'Invalid agreement data!'
      });
      return Promise.resolve(false);
    } else {
      const endpoint = this.buildEndpoint(agreement);
      const isNew = !agreement.id;

      if (agreement.id) {
        delete agreement.id;
      }
      if (Object.keys(agreement).length > 0) {
        // set additional callback if any
        if (succCallback) {
          this.handleSuccResponseAdditionalCallback = succCallback;
        }

        fireEvent(this, 'global-loading', {
          message: getTranslation('GENERAL.SAVING_DATA'),
          active: true,
          loadingSource: this.ajaxLoadingMsgSource
        });

        return this._triggerAgreementRequest({
          method: isNew ? 'POST' : 'PATCH',
          endpoint: endpoint,
          body: agreement
        });
      } else {
        fireEvent(this, 'toast', {
          text: 'All changes are saved.'
        });
        return Promise.resolve(false);
      }
    }
  }

  private buildEndpoint(agreement: any) {
    if (agreement.id) {
      return this.getEndpoint(pmpEdpoints, this.agreementEndpoints.DETAILS, {
        id: agreement.id
      });
    } else {
      return this.getEndpoint(pmpEdpoints, this.agreementEndpoints.CREATE);
    }
  }

  deleteAgreement(id: string) {
    if (!id) {
      return;
    }
    const reqMethod = 'DELETE';
    this.fireRequest(pmpEdpoints, this.agreementEndpoints.DELETE, {id: id}, {method: reqMethod})
      .then(() => {
        this._handleAgreementDeleteSuccess(id);
      })
      .catch((reqError: any) => {
        this.handleErrorResponse(reqError, reqMethod, false);
      });
  }

  _handleAgreementDeleteSuccess(id: string) {
    window.EtoolsPmpApp.DexieDb.agreements
      .where('id')
      .equals(parseInt(id, 10))
      .delete()
      .then((deleteCount: number) => this._handleAgreementDeleteFromDexieSuccess(deleteCount))
      .catch((dexieDeleteErr: any) => this._handleAgreementDeleteFromDexieErr(dexieDeleteErr))
      .then(() => {
        // go to agreements list after delete
        store.dispatch(setShouldReloadAgreements(true));
        fireEvent(this, 'update-main-path', {path: 'agreements/list'});
      });
  }

  _handleAgreementDeleteFromDexieSuccess(deleteCount: number) {
    if (deleteCount === 1) {
      fireEvent(this, 'reload-list');
      fireEvent(this, 'toast', {
        text: 'Agreement successfully deleted.'
      });
    } else {
      throw new Error('Agreement was not deleted from dexie!');
    }
  }

  _handleAgreementDeleteFromDexieErr(dexieDeleteErr: any) {
    // Agreement dexie deleted issue
    logError('Agreement delete from local dexie db failed!', 'agreement-item-data', dexieDeleteErr);
    fireEvent(this, 'toast', {
      text:
        'The agreement was deleted from server database, but there was an issue on cleaning ' +
        'agreement data from browser cache. Use refresh data functionality to update cached agreements data.'
    });
  }
}

export {AgreementItemData as AgreementItemDataEl};
