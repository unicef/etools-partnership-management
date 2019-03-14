import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import './etools-toast'

/**
 * @polymer
 * @mixinFunction
 */
const ToastNotifications = dedupingMixin((baseClass: any) =>
    // @ts-ignore
    class extends EtoolsLogsMixin(baseClass) {
      static get properties() {
        return {
          _toast: Object,
          _toastQueue: Array,
          currentToastMessage: String
        };
      }

      protected _toast: object | null = null;
      protected _toastQueue: object[] = [];
      public currentToastMessage: string = '';

      public connectedCallback() {
        super.connectedCallback();
        this.queueToast = this.queueToast.bind(this);
        // @ts-ignore
        this.addEventListener('toast', this.queueToast);
      }

      public disconnectedCallback() {
        super.disconnectedCallback();
        // @ts-ignore
        this.removeEventListener('toast', this.queueToast);
        if (this._toast) {
          // @ts-ignore
          this._toast.removeEventListener('toast-confirm', this._toggleToast);
          // @ts-ignore
          this._toast.removeEventListener('toast-closed', this.dequeueToast);
        }
      }

      public queueToast(e: CustomEvent) {
        e.stopPropagation();
        let detail = e.detail;
        if (!this._toast) {
          this.createToastNotificationElement();
        }

        if (!this._toastQueue.length) {
          // @ts-ignore
          this.push('_toastQueue', detail);
          // @ts-ignore
          let toastProperties = this._toast.prepareToastAndGetShowProperties(detail);
          this._showToast(toastProperties);
        } else {
          let alreadyInQueue = this._toastQueue.filter(function (toastDetail) {
            return JSON.stringify(toastDetail) === JSON.stringify(detail);
          });
          if (alreadyInQueue.length === 0) {
            // @ts-ignore
            this.push('_toastQueue', detail);
          } // else already in the queue
        }
      }

      public createToastNotificationElement() {
        this._toast = document.createElement('etools-toast');
        this._toggleToast = this._toggleToast.bind(this);
        // @ts-ignore
        this._toast.addEventListener('toast-confirm', this._toggleToast);
        // @ts-ignore
        document.querySelector('body')!.appendChild(this._toast);
        this._toastAfterRenderSetup();
      }

      protected _toastAfterRenderSetup() {
        if (this._toast !== null) {
          // alter message wrapper css
          setTimeout(() => {
            // @ts-ignore
            let messageWrapper = this._toast.getMessageWrapper();
            if (messageWrapper) {
              messageWrapper.style.whiteSpace = 'pre-wrap';
            }
          }, 0);
        }
        // add close listener
        this.dequeueToast = this.dequeueToast.bind(this);
        // @ts-ignore
        this._toast.addEventListener('toast-closed', this.dequeueToast);
      }

      public dequeueToast() {
        // @ts-ignore
        this.shift('_toastQueue');
        if (this._toastQueue.length) {
          // @ts-ignore
          let toastProperties = this._toast.prepareToastAndGetShowProperties(this._toastQueue[0]);
          this._showToast(toastProperties);
        }
      }

      protected _toggleToast() {
        if (this._toast) {
          // @ts-ignore
          this._toast.toggle();
        }
      }

      protected _showToast(toastProperties: any) {
        // @ts-ignore
        this.set('currentToastMessage', toastProperties.text);
        // @ts-ignore
        this._toast.show(toastProperties);
      }
    });

export default ToastNotifications;
