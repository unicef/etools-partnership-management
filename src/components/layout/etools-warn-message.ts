import { PolymerElement, html } from '@polymer/polymer';

/**
 * @polymer
 * @customElement
 */
class EtoolsWarnMessage extends PolymerElement {

  static get template() {
    return html`
    <style>
      :host {
        width: 100%;
      }

      .warning {
        display: flex;
        flex-direction: row;
        flex: 1;
        padding: 16px 24px;
        background-color: var(--lightest-info-color);
      }

    </style>

    <div class="warning">
      [[message]]
    </div>

    `;
  }

  static get properties() {
    return {
      message: {
        type: String,
        value: ''
      }
    };
  }

}

window.customElements.define('etools-warn-message', EtoolsWarnMessage);
