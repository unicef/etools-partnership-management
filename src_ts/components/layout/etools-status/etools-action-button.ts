import {PolymerElement, html} from '@polymer/polymer';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import {DomRepeatEvent} from '../../../typings/globals.types';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import {fireEvent} from '../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import {StatusAction} from '../../../typings/etools-status.types';

/**
 * @polymer
 * @customElement
 */
class EtoolsActionButton extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }

        paper-button {
          @apply --layout-horizontal;
          padding: 0;
          margin: 0;
          height: 36px;
          background-color: var(--etools-action-button-main-color, #0099ff);
          color: var(--etools-action-button-text-color, #fff);
        }

        paper-button.grey {
          background-color: var(--etools-action-button-dropdown-higlight-bg, rgba(0, 0, 0, 0.54));
        }

        paper-menu-button {
          padding: 0 4px;
        }

        paper-icon-button {
          border-left: 2px solid var(--etools-action-button-divider-color, rgba(255, 255, 255, 0.12));
        }

        .main-btn-part {
          @apply --layout-flex;
          text-align: center;
          font-weight: 500;
          line-height: 34px;
        }

        .list-wrapper {
          position: relative;
          outline: none;
          z-index: 5;
          width: 100%;
          overflow-y: hidden;
          background: var(--etools-action-button-text-color, #fff);
          font-size: 0;
        }

        .list-wrapper::after {
          display: none;
        }

        .list-wrapper paper-item {
          padding: 0 16px;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          box-sizing: border-box;
          display: inline-block;
          line-height: 47px;
          background: var(--etools-action-button-text-color, #fff);
          width: 100%;
          min-width: 120px;
        }

        iron-icon[icon='info-outline'] {
          padding-left: 5px;
        }
      </style>

      <template is="dom-if" if="[[primaryAction]]">
        <paper-button raised disabled$="[[disabled]]">
          <div on-tap="_handlePrimaryClick" class="main-btn-part">
            <iron-icon icon="info-outline" hidden$="[[!showInfoIcon]]"></iron-icon>
            [[primaryAction.label]]
          </div>

          <template is="dom-if" if="[[secondaryActions.length]]">
            <paper-menu-button horizontal-align="right">
              <paper-icon-button icon="expand-more" slot="dropdown-trigger"></paper-icon-button>
              <paper-listbox slot="dropdown-content">
                <div class="list-wrapper">
                  <template is="dom-repeat" items="[[secondaryActions]]" as="item">
                    <paper-item on-tap="_handleSecondaryClick"> [[item.label]]</paper-item>
                  </template>
                </div>
              </paper-listbox>
            </paper-menu-button>
          </template>
        </paper-button>
      </template>
    `;
  }

  @property({type: Array})
  actions: StatusAction[] = [];

  @property({type: Object})
  primaryAction!: StatusAction;

  @property({type: Array})
  secondaryActions: StatusAction[] = [];

  @property({type: Boolean})
  disabled = false;

  @property({type: Boolean})
  showInfoIcon = false;

  private _actionsChangedDebouncer!: Debouncer;

  static get observers() {
    return ['_actionsChanged(actions, actions.*)'];
  }

  _actionsChanged(actions: any[], actionsData: any) {
    if (typeof actions === 'undefined' && typeof actionsData === 'undefined') {
      return;
    }
    this._actionsChangedDebouncer = Debouncer.debounce(this._actionsChangedDebouncer, timeOut.after(10), () => {
      this._handleActionsChanged();
    });
  }

  _handleActionsChanged() {
    const actions = this.actions;
    if (!actions.length) {
      return;
    }

    this.set('primaryAction', null);
    this.set('secondaryActions', []);

    let primaryAction = actions.find((elem: any) => {
      return elem.primary && !elem.hidden;
    });

    const secondaryActions = actions.filter((elem: any) => {
      return !elem.primary && !elem.hidden;
    });

    if (!primaryAction && secondaryActions && secondaryActions.length) {
      primaryAction = secondaryActions.pop();
    }

    this.set('primaryAction', primaryAction);
    this.set('secondaryActions', secondaryActions);
  }

  _handleSecondaryClick(event: DomRepeatEvent) {
    const action = event.model.item;
    fireEvent(this, action.event);
  }

  _handlePrimaryClick() {
    fireEvent(this, this.primaryAction.event);
  }
}

window.customElements.define('etools-action-button', EtoolsActionButton);
