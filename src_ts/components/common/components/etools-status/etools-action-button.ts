/* eslint-disable lit-a11y/click-events-have-key-events */
import {LitElement, html, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {StatusAction} from '../../../../typings/etools-status.types';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@shoelace-style/shoelace/dist/components/button/button.js';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';

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
        sl-button#primary {
          flex: 1 1 0;
        }
        .main-btn-part {
          flex: 1;
          text-align: center;
          font-weight: 500;
          line-height: 34px;
          padding-top: 2px;
          text-transform: uppercase;
        }
        sl-dropdown #splitBtn::part(trigger) {
          display: inline-flex;
          vertical-align: middle;
        }
        sl-button {
          --sl-spacing-medium: 0;
        }

        sl-button[slot='trigger'] {
          width: 40px;
          min-width: 40px;
          border-inline-start: 1px solid rgba(255, 255, 255, 0.12);
        }
        sl-button#primary::part(label) {
          display: flex;
          padding-inline-end: 0px;
          width: 100%;
        }
      </style>

      ${this.primaryAction
        ? html`<sl-button
            id="primary"
            variant="primary"
            @click="${this._handlePrimaryClick}"
            ?disabled="${this.disabled}"
            class="split-btn"
          >
            <span class="main-btn-part">
              <etools-icon name="info-outline" ?hidden="${!this.showInfoIcon}"></etools-icon>
              ${this.primaryAction.label}
            </span>
            ${(this.secondaryActions || []).length
              ? html` <sl-dropdown id="splitBtn" @click="${(event: MouseEvent) => event.stopImmediatePropagation()}">
                  <sl-button slot="trigger" variant="primary" class="no-marg">
                    <etools-icon name="expand-more"></etools-icon
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
