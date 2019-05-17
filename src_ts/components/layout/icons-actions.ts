import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

import {fireEvent} from '../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../typings/globals.types';

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
          @apply --layout-horizontal;
          @apply --layout-center;
          background-color: var(--list-second-bg-color);
          position: absolute;
          top: 1px;
          right: 0;
          bottom: 1px;

          @apply --icons-actions;
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
  itemDetails!: GenericObject;

  @property({type: Boolean})
  showEdit: boolean = true;

  @property({type: Boolean})
  showDelete: boolean = true;

  @property({type: Boolean})
  showDeactivate: boolean = false;

  _onEdit() {
    fireEvent(this, 'edit');
  }

  _onDelete() {
    fireEvent(this, 'delete');
  }

  _onDeactivate() {
    fireEvent(this, 'deactivate');
  }

}

window.customElements.define('icons-actions', IconsActions);

export {IconsActions as IconsActionsEl};
