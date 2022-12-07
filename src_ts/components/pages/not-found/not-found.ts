import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {html, LitElement} from 'lit-element';
import {BASE_URL} from '../../../config/config';
import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {fireEvent} from '../../utils/fire-custom-event';

/**
 * @polymer
 * @customElement
 */
class NotFound extends LitElement {
  static get styles() {
    return [elevationStyles];
  }
  render() {
    return html`
      ${sharedStyles}${pageLayoutStyles}
      <style>
        :host {
          display: block;
          width: 100%;
          padding: 24px;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
        }

        div[elevation='1'] {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        a {
          color: var(--primary-color);
        }

        h1 {
          @apply --page-title;
          margin-bottom: 24px;
        }

        .page-content {
          background-color: var(--primary-background-color);
          padding: 18px 24px;
        }
      </style>

      <div class="page-content elevation" elevation="1">
        <h1>404 - Page not found!</h1>
        <a href="${BASE_URL}partners/list">Head back home.</a>
      </div>
    `;
  }
  connectedCallback(): void {
    super.connectedCallback();
    // Disable loading message for tab load, triggered by parent element on stamp or by tap event on tabs
    fireEvent(this, 'clear-loading-messages');
  }
}

window.customElements.define('not-found', NotFound);
