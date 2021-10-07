/* eslint-disable lit-a11y/anchor-is-valid */
import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-styles/element-styles/paper-material-styles';
import {SharedStyles} from '../../styles/shared-styles';

/**
 * @polymer
 * @customElement
 */
class NotFound extends PolymerElement {
  static get template() {
    return html`
      ${SharedStyles}
      <style include="paper-material-styles">
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
      </style>

      <div class="paper-material" elevation="1">
        <h1>404 - Page not found!</h1>
        <a href$="[[rootPath]]partners/list">Head back home.</a>
      </div>
    `;
  }
}

window.customElements.define('not-found', NotFound);
