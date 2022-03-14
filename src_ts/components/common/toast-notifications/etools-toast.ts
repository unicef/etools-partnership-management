import '@polymer/paper-toast/paper-toast.js';
import '@polymer/paper-button/paper-button.js';
import {PaperToastElement} from '@polymer/paper-toast/paper-toast.js';
import {PaperButtonElement} from '@polymer/paper-button/paper-button.js';
import {GenericObject} from '@unicef-polymer/etools-types';
import {html, LitElement} from 'lit-element';

/**
 * @polymer
 * @customElement
 */
class EtoolsToast extends LitElement {
  render() {
    // main template
    // language=HTML
    return html`
      <style>
        .toast-dismiss-btn {
          --paper-button: {
            padding: 8px;
            min-width: 16px;
            margin: 0 -8px 0 24px;
          }
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
            align-self: flex-end;
          }
        }
        .toast-general-style {
          max-width: 568px !important;
          min-height: 40px;
          max-height: 70vh !important;
        }
        .toast {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
        }
        .toast-multi-line {
          display: flex;
          flex-direction: column;
          text-align: justify;
        }
      </style>
      <paper-toast id="toast" class="toast-general-style" @iron-overlay-closed="toastClosed">
        <paper-button id="confirmBtn" @tap="confirmToast" class="toast-dismiss-btn-general-style"> Ok </paper-button>
      </paper-toast>
    `;
  }

  public fitInto: GenericObject | null = null;

  public show(details: GenericObject) {
    return (this.shadowRoot?.querySelector('#toast') as PaperToastElement).show(details);
  }

  public toggle() {
    return (this.shadowRoot?.querySelector('#toast') as PaperToastElement).toggle();
  }

  public confirmToast() {
    this.dispatchEvent(
      new CustomEvent('toast-confirm', {
        bubbles: true,
        composed: true
      })
    );
  }

  public toastClosed() {
    this.dispatchEvent(
      new CustomEvent('toast-closed', {
        bubbles: true,
        composed: true
      })
    );
  }

  public getMessageWrapper() {
    return (this.shadowRoot?.querySelector('#toast') as PaperToastElement).$.label as HTMLSpanElement;
  }

  protected _isMultiLine(message: string) {
    if (!message) {
      return false;
    }
    return message.toString().length > 80;
  }

  prepareToastAndGetShowProperties(detail: any) {
    const closeToastBtn = this.shadowRoot?.querySelector('#confirmBtn') as PaperButtonElement;
    const toast = this.shadowRoot?.querySelector('#toast')!;

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

    closeToastBtn.updateStyles();

    // clone detail obj
    const toastProperties = JSON.parse(JSON.stringify(detail));

    if (toastProperties.showCloseBtn === true) {
      toastProperties.duration = 0;
      closeToastBtn.removeAttribute('hidden');
    } else {
      closeToastBtn.setAttribute('hidden', '');
      toastProperties.duration = toastProperties.duration || 5000;
    }
    delete toastProperties.showCloseBtn;

    return toastProperties;
  }
}

window.customElements.define('etools-toast', EtoolsToast);

export {EtoolsToast as EtoolsToastEl};
