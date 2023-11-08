/* eslint-disable lit-a11y/click-events-have-key-events */
import {LitElement, html, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {StatusAction} from '../../../../typings/etools-status.types';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/button-group/button-group.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {buttonsStyles} from '@unicef-polymer/etools-unicef/src/styles/button-styles';

/**
 * @LitElement
 * @customElement
 */
@customElement('etools-action-button')
export class EtoolsActionButton extends LitElement {
  static get styles() {
    return [buttonsStyles];
  }
  render() {
    return html`
      <style>
        :host {
          display: flex;
        }
        *[hidden] {
          display: none;
        }
        sl-button {
          margin-inline: 0px !important;
          --sl-spacing-medium: 0;
        }
        sl-button-group {
          display: flex;
          background-color: var(--sl-color-primary-600);
          flex: 1;
        }
        sl-button-group::part(base) {
          width: 100%;
        }
        sl-button[slot='trigger'] {
          width: 45px;
          min-width: 45px;
          border-inline-start: 1px solid rgba(255, 255, 255, 0.12);
        }
        sl-button#primary {
          flex: 1;
        }
        sl-button#primary::part(label) {
          display: flex;
          width: 100%;
          justify-content: center;
        }

        sl-menu-item {
          text-transform: uppercase;
        }
      </style>

      ${this.primaryAction
        ? html`<sl-button-group>
            <sl-button id="primary" variant="primary" @click="${this._handlePrimaryClick}" ?disabled="${this.disabled}">
              ${this.showInfoIcon ? html`<etools-icon slot="prefix" name="info-outline"></etools-icon>` : html``}
              ${this.primaryAction.label}
            </sl-button>
            ${(this.secondaryActions || []).length
              ? html` <sl-dropdown
                  id="splitBtn"
                  placement="bottom-end"
                  @click="${(event: MouseEvent) => event.stopImmediatePropagation()}"
                >
                  <sl-button slot="trigger" variant="primary" caret></sl-button>
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
          </sl-button-group> `
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
