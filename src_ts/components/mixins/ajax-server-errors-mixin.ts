// import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin';
import {fireEvent} from '../utils/fire-custom-event.js';
import {getErrorsArray, tryGetResponseError} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {Constructor} from '../../typings/globals.types.js';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 */
function AjaxServerErrorsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class AjaxServerErrorsClass extends baseClass {

    @property({type: Array, notify: true})
    serverErrors!: [];

    @property({type: Object})
    options!: object

    @property({type: Boolean})
    useToastEvent: boolean = true;

    @property({type: String, observer: AjaxServerErrorsClass.prototype._errorEventNameChange})
    errorEventName: string | null = null;

    @property({type: String})
    ajaxLoadingMsgSource: string = '';


    handleErrorResponse(response: any, ajaxMethod: string, redirectOn404: boolean) {
      if (redirectOn404 && response.status === 404) {
        fireEvent(this, '404');
        return;
      }

      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: this.ajaxLoadingMsgSource ? this.ajaxLoadingMsgSource : null
      });

      const errors = tryGetResponseError(response);

      // @ts-ignore
      let errorMessage = this.globalMessage;

      if (!ajaxMethod) {
        ajaxMethod = 'GET';
      }

      if (['POST', 'PATCH', 'DELETE'].indexOf(ajaxMethod) > -1) {
        this.set('serverErrors', getErrorsArray(errors, this.useToastEvent));
      }
      this.serverErrors = this.serverErrors ? this.serverErrors : [];
      if (this.useToastEvent) {
        if (this.serverErrors.length > 1) {
          errorMessage = this.serverErrors.join('\n');
        }
        fireEvent(this, 'toast', {text: errorMessage, showCloseBtn: true});
      } else {
        if (this.serverErrors.length === 0) {
          this._fireAjaxErrorEvent(errorMessage);
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

    _errorEventNameChange(eventName: string) {
      if (typeof eventName === 'string' && eventName !== '') {
        // disable toasts error notifications if eventName is given
        this.set('useToastEvent', false);
      }
    }

  }
  return AjaxServerErrorsClass;
}

export default AjaxServerErrorsMixin;
