// import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
import './etools-toast';
import {GenericObject, Constructor} from '@unicef-polymer/etools-types';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {EtoolsToastEl} from './etools-toast';
import {store} from '../../redux/store';
import get from 'lodash-es/get';

/**
 * @polymer
 * @mixinFunction
 */
function ToastNotificationsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class ToastNotifsClass extends baseClass {
    @property({type: Object})
    _toast: EtoolsToastEl | null = null;

    @property({type: Array})
    _toastQueue: GenericObject[] = [];

    @property({type: String})
    currentToastMessage = '';

    public connectedCallback() {
      super.connectedCallback();
      this.queueToast = this.queueToast.bind(this);
      // @ts-ignore
      document.body.addEventListener('toast', this.queueToast);
    }

    public disconnectedCallback() {
      super.disconnectedCallback();

      document.body.removeEventListener('toast', this.queueToast as any);
      if (this._toast) {
        this._toast.removeEventListener('toast-confirm', this._toggleToast);
        this._toast.removeEventListener('toast-closed', this.dequeueToast);
      }
    }

    public queueToast(e: CustomEvent) {
      e.stopPropagation();
      const detail = e.detail;
      if (!this._toast) {
        this.createToastNotificationElement();
      }

      if (!this._toastQueue.length) {
        this.push('_toastQueue', detail);
        const toastProperties = this._toast!.prepareToastAndGetShowProperties(detail);
        this._showToast(toastProperties);
      } else {
        const alreadyInQueue = this._toastQueue.filter(function (toastDetail) {
          return JSON.stringify(toastDetail) === JSON.stringify(detail);
        });
        if (alreadyInQueue.length === 0) {
          this.push('_toastQueue', detail);
        } // else already in the queue
      }
    }

    public createToastNotificationElement() {
      this._toast = document.createElement('etools-toast') as any;
      this.closeToast = this.closeToast.bind(this);
      this._toast!.addEventListener('toast-confirm', this.closeToast);
      // @ts-ignore
      document.querySelector('body')!.appendChild(this._toast);
      this._toastAfterRenderSetup();
    }

    protected _toastAfterRenderSetup() {
      if (this._toast !== null) {
        // alter message wrapper css
        setTimeout(() => {
          const messageWrapper = this._toast!.getMessageWrapper();
          if (messageWrapper) {
            messageWrapper.style.whiteSpace = 'pre-wrap';
          }
        }, 0);
      }
      // add close listener
      this.dequeueToast = this.dequeueToast.bind(this);
      this._toast!.addEventListener('toast-closed', this.dequeueToast);
    }

    public dequeueToast() {
      this.shift('_toastQueue');
      if (this._toastQueue.length) {
        const toastProperties = this._toast!.prepareToastAndGetShowProperties(this._toastQueue[0]);
        this._showToast(toastProperties);
      }
    }

    closeToast() {
      if (get(store.getState(), 'app.toastNotification.active')) {
        store.dispatch({
          type: 'CLOSE_TOAST'
        });
      }
      this._toggleToast();
    }

    protected _toggleToast() {
      if (this._toast) {
        this._toast.toggle();
      }
    }

    protected _showToast(toastProperties: any) {
      this.set('currentToastMessage', toastProperties.text);
      this._toast!.show(toastProperties);
    }
  }
  return ToastNotifsClass;
}
export default ToastNotificationsMixin;
