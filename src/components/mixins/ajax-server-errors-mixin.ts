import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
import EventHelperMixin from './event-helper-mixin.js';
import AjaxErrorsParserMixin from './ajax-errors-parser-mixin.js';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EventHelperMixin
 * @appliesMixin AjaxErrorsParserMixin
 */
const AjaxServerErrorsMixin = dedupingMixin((baseClass: any) =>
    class extends EventHelperMixin(AjaxErrorsParserMixin(baseClass)) {

      static get properties() {
        return {
          serverErrors: {
            type: Array,
            notify: true
          },
          options: Object,
          useToastEvent: {
            type: Boolean,
            value: true
          },
          errorEventName: {
            value: null,
            observer: '_errorEventNameChange'
          },
          ajaxLoadingMsgSource: {
            type: String,
            value: ''
          }
        };
      }

      handleErrorResponse(response: any, ajaxMethod: string, redirectOn404: boolean) {
        if (redirectOn404 && response.status === 404) {
          this.fireEvent('404');
          return;
        }

        this.fireEvent('global-loading', {
          active: false,
          loadingSource: this.ajaxLoadingMsgSource ? this.ajaxLoadingMsgSource : null
        });

        let errors = this.tryGetResponseError(response);

        let errorMessage = this.globalMessage;

        if (!ajaxMethod) {
          ajaxMethod = 'GET';
        }

        if (['POST', 'PATCH', 'DELETE'].indexOf(ajaxMethod) > -1) {
          this.set('serverErrors', this._getErrorsArray(errors, this.useToastEvent));
        }
        this.serverErrors = this.serverErrors ? this.serverErrors : [];
        if (this.useToastEvent) {
          if (this.serverErrors.length > 1) {
            errorMessage = this.serverErrors.join('\n');
          }
          this.fireEvent('toast', {text: errorMessage, showCloseBtn: true});
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
          this.fireEvent(this.errorEventName, errors);
        }
      }

      _errorEventNameChange(eventName: string) {
        if (typeof eventName === 'string' && eventName !== '') {
          // disable toasts error notifications if eventName is given
          this.set('useToastEvent', false);
        }
      }

    });

export default AjaxServerErrorsMixin;
