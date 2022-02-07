// import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin';
import {fireEvent} from '../../utils/fire-custom-event.js';
import {getErrorsArray, tryGetResponseError} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {LitElement, property} from 'lit-element';
import {Constructor, GenericObject} from '@unicef-polymer/etools-types';

const globalMessage = 'An error occurred. Please try again later.';

/**
 * @polymer
 * @mixinFunction
 */
function AjaxServerErrorsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class AjaxServerErrorsClass extends baseClass {
    @property({type: Array}) // @dci , notify: true
    serverErrors!: any[];

    @property({type: Object})
    options!: GenericObject;

    @property({type: Boolean})
    useToastEvent = true;

    _errorEventName: string | null = null;

    @property({type: String})
    get errorEventName() {
      return this._errorEventName;
    }

    set errorEventName(errorEventName) {
      this._errorEventName = errorEventName;
      this._errorEventNameChange(this._errorEventName);
    }

    @property({type: String})
    ajaxLoadingMsgSource = '';

    handleErrorResponse(response: any, ajaxMethod: string, redirectOn404: boolean) {
      if (redirectOn404 && response.status === 404) {
        fireEvent(this, '404');
        return;
      }

      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: this.ajaxLoadingMsgSource ? this.ajaxLoadingMsgSource : null
      });

      if (!ajaxMethod) {
        ajaxMethod = 'GET';
      }

      if (['POST', 'PATCH', 'DELETE'].indexOf(ajaxMethod) > -1) {
        const errors = tryGetResponseError(response);
        this.serverErrors = getErrorsArray(errors);
      }
      this.serverErrors = this.serverErrors || [];

      if (this.useToastEvent) {
        const toastMsg = this.serverErrors.length ? this.serverErrors.join('\n') : globalMessage;
        fireEvent(this, 'toast', {text: toastMsg, showCloseBtn: true});
      } else {
        if (this.serverErrors.length === 0) {
          this._fireAjaxErrorEvent(globalMessage);
        } else {
          this._fireAjaxErrorEvent(this.serverErrors);
        }
      }
    }

    _fireAjaxErrorEvent(errors: any) {
      if (typeof this.errorEventName === 'string' && this.errorEventName !== '') {
        if (typeof errors === 'string') {
          errors = [errors];
        }
        fireEvent(this, this.errorEventName, errors);
      }
    }

    _errorEventNameChange(eventName: string | null) {
      if (typeof eventName === 'string' && eventName !== '') {
        // disable toasts error notifications if eventName is given
        this.useToastEvent = false;
      }
    }
  }
  return AjaxServerErrorsClass;
}

export default AjaxServerErrorsMixin;
