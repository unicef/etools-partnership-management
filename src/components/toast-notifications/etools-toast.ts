import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-button/paper-button.js';

/**
 * @polymer
 * @customElement
 */
class EtoolsToast extends PolymerElement {

  public static get template() {
    // main template
    // language=HTML
    return html`
      <style>
        .toast-dismiss-btn {
          --paper-button: {
            padding: 8px;
            min-width: 16px;
            margin: 0 -8px 0 24px;
          };
        }
        .toast-dismiss-btn-general-style {
          text-transform: uppercase;
          color: var(--primary-color);
        }
        .toast-dismiss-btn-multi-line {
          --paper-button: {
            padding: 8px;
            min-width: 16px;
            margin: 16px -8px -8px 0;
            @apply --layout-self-end;
          };
        }
        .toast-general-style {
          max-width: 568px !important;
          min-height: 40px;
          max-height: 70vh !important;
        }
        .toast {
          @apply --layout-horizontal;
          @apply --layout-center;
          justify-content: space-between;
        }
        .toast-multi-line {
          @apply --layout-vertical;
          text-align: justify;
        }
      </style>
      <paper-toast id="toast"
                   class="toast-general-style"
                   on-iron-overlay-closed="toastClosed"
                   fit-into="[[fitInto]]">
        <paper-button id="confirmBtn"
                      on-tap="confirmToast"
                      class="toast-dismiss-btn-general-style">
          Ok
        </paper-button>
      </paper-toast>
    `;
  }

  static get properties() {
    return {
      fitInto: Object
    };
  }

  public fitInto: object | null = null;

  public show(details: object) {
    // @ts-ignore
    return this.$.toast.show(details);
  }

  public toggle() {
    // @ts-ignore
    return this.$.toast.toggle();
  }

  public confirmToast() {
    this.dispatchEvent(new CustomEvent('toast-confirm', {
      bubbles: true,
      composed: true
    }));
  }

  public toastClosed() {
    this.dispatchEvent(new CustomEvent('toast-closed', {
      bubbles: true,
      composed: true
    }));
  }

  public getMessageWrapper() {
    // @ts-ignore
    return this.$.toast.$.label;
  }

  protected _isMultiLine(message: string) {
    if (!message) {
      return false;
    }
    return message.toString().length > 80;
  }

  prepareToastAndGetShowProperties(detail: any) {
    let closeToastBtn = this.$.confirmBtn;
    let toast = this.$.toast;

    if (this._isMultiLine(detail.text)) {
      toast.classList.remove('toast');
      toast.classList.add('toast-multi-line');

      closeToastBtn.classList.remove('toast-dismiss-btn');
      closeToastBtn.classList.add('toast-dismiss-btn-multi-line');
    } else {
      toast.classList.remove('toast-multi-line');
      toast.classList.add('toast');

      closeToastBtn.classList.remove('toast-dismiss-btn-multi-line');
      closeToastBtn.classList.add('toast-dismiss-btn');
    }
    // @ts-ignore
    closeToastBtn.updateStyles();

    // clone detail obj
    let toastProperties = JSON.parse(JSON.stringify(detail));

    toastProperties.duration = 0;
    if (typeof detail === 'object' && typeof detail.showCloseBtn !== 'undefined') {
      if (detail.showCloseBtn === true) {
        closeToastBtn.removeAttribute('hidden');
      } else {
        closeToastBtn.setAttribute('hidden', '');
        if (!detail.duration) {
          toastProperties.duration = 5000;
        }
      }
      delete toastProperties.showCloseBtn;
    } else {
      closeToastBtn.setAttribute('hidden', '');
    }

    return toastProperties;
  }

}

window.customElements.define('etools-toast', EtoolsToast);
