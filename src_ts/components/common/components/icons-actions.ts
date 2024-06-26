import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {property} from 'lit/decorators.js';
import {GenericObject} from '@unicef-polymer/etools-types';
import {LitElement, html} from 'lit';

/**
 * @LitElement
 * @customElement
 */
class IconsActions extends LitElement {
  render() {
    return html`
      <style>
        [hidden] {
          display: none !important;
        }

        :host {
          display: -ms-flexbox;
          display: -webkit-flex;
          display: flex;
          -ms-flex-direction: row;
          -webkit-flex-direction: row;
          flex-direction: row;
          -ms-flex-align: center;
          -webkit-align-items: center;
          align-items: center;
          position: absolute;
          right: 0;
          top: 0;
          bottom: 0;
        }

        :host-context([dir='rtl']):host {
          right: unset;
          left: 0;
        }
      </style>

      <etools-icon-button ?hidden="${!this.showEdit}" name="create" @click="${this._onEdit}"></etools-icon-button>
      <etools-icon-button ?hidden="${!this.showDelete}" name="delete" @click="${this._onDelete}"></etools-icon-button>
      <etools-icon-button
        ?hidden="${!this.showDeactivate}"
        name="block"
        @click="${this._onDeactivate}"
      ></etools-icon-button>
    `;
  }

  @property({type: Object})
  item!: GenericObject;

  @property({type: Boolean})
  showEdit = true;

  @property({type: Boolean})
  showDelete = true;

  @property({type: Boolean})
  showDeactivate = false;

  _onEdit() {
    fireEvent(this, 'edit', this.item);
  }

  _onDelete() {
    fireEvent(this, 'delete', this.item);
  }

  _onDeactivate() {
    fireEvent(this, 'deactivate', this.item);
  }
}

window.customElements.define('icons-actions2', IconsActions);

export {IconsActions as IconsActionsEl};
