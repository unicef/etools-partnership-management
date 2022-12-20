import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

import {fireEvent} from '../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 */
class IconsActions extends PolymerElement {
  static get template() {
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

        paper-icon-button {
          color: var(--dark-icon-color, #6f6f70);
        }
      </style>

      <paper-icon-button hidden$="[[!showEdit]]" icon="create" on-tap="_onEdit"></paper-icon-button>
      <paper-icon-button hidden$="[[!showDelete]]" icon="delete" on-tap="_onDelete"></paper-icon-button>
      <paper-icon-button hidden$="[[!showDeactivate]]" icon="block" on-tap="_onDeactivate"></paper-icon-button>
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
