/* eslint-disable lit-a11y/click-events-have-key-events */
import {LitElement, html, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {StatusAction} from '../../../../typings/etools-status.types';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button-group';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';

/**
 * @LitElement
 * @customElement
 */
@customElement('etools-action-button')
export class EtoolsActionButton extends LitElement {
  render() {
    return html`
      <style>
        :host {
          display: flex;
        }
        *[hidden] {
          display: none;
        }
        etools-button {
          margin-inline: 0px !important;
          --sl-spacing-medium: 0;
        }
        etools-button-group {
          --etools-button-group-color: var(--sl-color-primary-600);
        }
        etools-button[slot='trigger'] {
          width: 45px;
          min-width: 45px;
          border-inline-start: 1px solid rgba(255, 255, 255, 0.12);
        }
        etools-button#primary {
          flex: 1;
        }
        etools-button#primary::part(label) {
          display: flex;
          width: 100%;
          justify-content: center;
        }

        sl-menu-item {
          text-transform: uppercase;
        }
        etools-icon {
          padding-inline-start: 8px;
          color: var(--light-icon-color);
          cursor: pointer;
        }
      </style>

      ${this.primaryAction
        ? html`<etools-button-group>
            ${this.showInfoIcon
              ? html` <sl-tooltip placement="top" style="--max-width: 120px;" hoist content="${this.infoText}">
                  <etools-icon name="info-outline"></etools-icon
                ></sl-tooltip>`
              : html``}
            <etools-button
              id="primary"
              variant="primary"
              @click="${this._handlePrimaryClick}"
              ?disabled="${this.disabled}"
            >
              ${this.primaryAction.label}
            </etools-button>
            ${(this.secondaryActions || []).length
              ? html` <sl-dropdown
                  id="splitBtn"
                  placement="bottom-end"
                  @click="${(event: MouseEvent) => event.stopImmediatePropagation()}"
                >
                  <etools-button slot="trigger" variant="primary" caret></etools-button>
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
          </etools-button-group> `
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

  @property({type: String})
  infoText = '';

  connectedCallback(): void {
    super.connectedCallback();

    this._handleActionsChanged = debounce(this._handleActionsChanged.bind(this), 50) as any;
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('actions')) {
      this._actionsChanged(this.actions);
    }
  }

  _actionsChanged(actions: any[]) {
    if (typeof actions === 'undefined') {
      return;
    }
    this._handleActionsChanged();
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
