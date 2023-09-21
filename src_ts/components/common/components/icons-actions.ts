import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {property} from 'lit/decorators.js';
import {GenericObject} from '@unicef-polymer/etools-types';
import {LitElement, html} from 'lit';

/**
 * @polymer
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

      <sl-icon-button hidden$="[[!showEdit]]" name="create" on-tap="_onEdit"></sl-icon-button>
      <sl-icon-button hidden$="[[!showDelete]]" name="delete" on-tap="_onDelete"></sl-icon-button>
      <sl-icon-button hidden$="[[!showDeactivate]]" name="block" on-tap="_onDeactivate"></sl-icon-button>
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
