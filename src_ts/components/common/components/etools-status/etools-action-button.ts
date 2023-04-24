/* eslint-disable lit-a11y/click-events-have-key-events */
import {LitElement, customElement, html, property, PropertyValues} from 'lit-element';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-menu-button/paper-menu-button.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {StatusAction} from '../../../../typings/etools-status.types';

/**
 * @polymer
 * @customElement
 */
@customElement('etools-action-button')
export class EtoolsActionButton extends LitElement {
  render() {
    return html`
      <style>
        :host {
          display: block;
        }

        paper-button {
          display: flex;
          flex-direction: row;
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
          border-inline-start: 2px solid var(--etools-action-button-divider-color, rgba(255, 255, 255, 0.12));
        }

        .main-btn-part {
          flex: 1;
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
          padding-inline-start: 5px;
        }
      </style>

      ${this.primaryAction
        ? html`<paper-button raised ?disabled="${this.disabled}">
            <div @click="${this._handlePrimaryClick}" class="main-btn-part">
              <iron-icon icon="info-outline" ?hidden="${!this.showInfoIcon}"></iron-icon>
              ${this.primaryAction.label}
            </div>
            ${(this.secondaryActions || []).length
              ? html` <paper-menu-button horizontal-align>
                  <paper-icon-button icon="expand-more" slot="dropdown-trigger"></paper-icon-button>
                  <paper-listbox slot="dropdown-content">
                    <div class="list-wrapper">
                      ${this.secondaryActions.map(
                        (item) =>
                          html`<paper-item @click="${() => this._handleSecondaryClick(item)}">
                            ${item.label}</paper-item
                          >`
                      )}
                    </div>
                  </paper-listbox>
                </paper-menu-button>`
              : ''}
          </paper-button> `
        : ''}
    `;
  }

  @property({type: Array})
  actions: StatusAction[] = [];

  @property({type: Object})
  primaryAction!: StatusAction | null | undefined;

  @property({type: Array})
  secondaryActions: StatusAction[] = [];

  @property({type: Boolean})
  disabled = false;

  @property({type: Boolean})
  showInfoIcon = false;

  private _actionsChangedDebouncer!: Debouncer;

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('actions')) {
      this._actionsChanged(this.actions);
    }
  }

  _actionsChanged(actions: any[]) {
    if (typeof actions === 'undefined') {
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

    this.primaryAction = null;
    this.secondaryActions = [];

    let primaryAction = actions.find((elem: any) => {
      return elem.primary && !elem.hidden;
    });

    const secondaryActions = actions.filter((elem: any) => {
      return !elem.primary && !elem.hidden;
    });

    if (!primaryAction && secondaryActions && secondaryActions.length) {
      primaryAction = secondaryActions.pop();
    }

    this.primaryAction = primaryAction;
    this.secondaryActions = secondaryActions;
  }

  _handleSecondaryClick(item: any) {
    fireEvent(this, item.event);
  }

  _handlePrimaryClick() {
    fireEvent(this, this.primaryAction!.event);
  }
}
