import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/polymer/lib/elements/dom-repeat';

export class WarnMessage {
  public msg: string = '';
  constructor(m: string) {
    this.msg = m;
  }
}

/**
 * @polymer
 * @customElement
 */
class EtoolsWarnMessage extends PolymerElement {

  static get template() {
    // language=HTML
    return html`
      <style>
        :host {
          width: 100%;
        }

        .warning {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 16px 24px;
          background-color: var(--lightest-info-color);
        }

        .warning p {
          margin: 0;
        }
        .warning p + p {
          margin-top: 12px;
        }
        
      </style>

      <div class="warning">
        <template is="dom-repeat" items="[[_internalMsgs]]">
          <p>[[item.msg]]</p>
        </template>
      </div>

    `;
  }

  public static get properties() {
    return {
      messages: {
        type: String,
        observer: '_messagesChanged'
      },
      _internalMsgs: Array
    };
  }

  public messages: string | string[] = [];
  // @ts-ignore
  private _internalMsgs: WarnMessage[] = [];

  // @ts-ignore
  private _messagesChanged(msgs: string | string[]) {
    if (!msgs || msgs.length === 0) {
      return;
    }
    this._internalMsgs = (msgs instanceof Array && msgs.length > 0)
        ? msgs.map((msg: string) => new WarnMessage(msg))
        : [new WarnMessage(msgs as string)];
  }

}

window.customElements.define('etools-warn-message', EtoolsWarnMessage);
