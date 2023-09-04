/* eslint-disable lit-a11y/click-events-have-key-events */
import {LitElement, html, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {StatusAction} from '../../../../typings/etools-status.types';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import {buttonsStyles} from '../../../styles/buttons-styles-lit';

/**
 * @polymer
 * @customElement
 */
@customElement('etools-action-button')
export class EtoolsActionButton extends LitElement {
  render() {
    return html`
      ${buttonsStyles}
      <style>
        :host {
          display: flex;
        }

        paper-menu-button {
          padding: 0 4px;
        }

        paper-icon-button {
          border-inline-start: 2px solid var(--etools-action-button-divider-color, rgba(255, 255, 255, 0.12));
        }
        sl-button#primary {
          flex: 1 1 0;
        }

        .main-btn-part {
          display: inline-block;
          flex: 1;
          text-align: center;
          font-weight: 500;
          line-height: 34px;
          padding: 0 30px;
          text-transform: uppercase;
        }

        iron-icon[icon='info-outline'] {
          padding-inline-start: 5px;
        }

        sl-dropdown.splitBtn::part(trigger) {
          display: inline-flex;
          vertical-align: middle;
        }

        sl-button[slot='trigger'] {
          width: 40px;
          border-inline-start: 1px solid rgba(255, 255, 255, 0.12);
          --sl-spacing-medium: 0;
        }
        sl-button#primary::part(label) {
          padding-inline-end: 0px;
        }
      </style>

      ${this.primaryAction
        ? html`<sl-button id="primary" variant="primary" ?disabled="${this.disabled}" class="primary-btn split-btn">
            <div @click="${this._handlePrimaryClick}" class="main-btn-part">
              <iron-icon icon="info-outline" ?hidden="${!this.showInfoIcon}"></iron-icon>
              ${this.primaryAction.label}
            </div>
            ${(this.secondaryActions || []).length
              ? html` <sl-dropdown id="splitBtn">
                  <sl-button slot="trigger" variant="primary" class="primary-btn no-marg">
                    <sl-icon name="chevron-down"></sl-icon
                  ></sl-button>
                  <sl-menu>
                    ${this.secondaryActions.map(
                      (item) =>
                        html`<sl-menu-item @click="${() => this._handleSecondaryClick(item)}">
                          ${item.label}</sl-menu-item
                        >`
                    )}
                  </sl-menu>
                </sl-dropdown>`
              : ''}
          </sl-button> `
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
