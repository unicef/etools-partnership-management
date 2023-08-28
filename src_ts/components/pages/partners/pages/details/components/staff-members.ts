import {LitElement, html, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';

import '@polymer/paper-toggle-button/paper-toggle-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';

import '../../../../../common/components/icons-actions';
import {translate} from 'lit-translate';
import {StaffMember} from '../../../../../../models/partners.models';
import {etoolsCpHeaderActionsBarStyles} from '../../../../../styles/etools-cp-header-actions-bar-styles-lit';
import {User} from '@unicef-polymer/etools-types/dist/user.types';

/**
 * @polymer
 * @customElement
 */
@customElement('staff-members')
export class StaffMembers extends LitElement {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    return html`
      <style>
        ${sharedStyles} ${dataTableStylesLit} ${etoolsCpHeaderActionsBarStyles} [hidden] {
          display: none !important;
        }

        :host {
          display: block;
          width: 100%;
        }

        etools-content-panel {
          margin-top: 24px;
        }

        icons-actions2 {
          visibility: hidden;
        }

        etools-data-table-row:hover icons-actions2 {
          visibility: visible;
        }

        iron-icon {
          color: var(--dark-secondary-text-color);
        }
        span.col-data {
          word-break: break-all;
          word-wrap: break-word;
        }

        paper-toggle-button#showInactive {
          font-size: 16px;
          --paper-toggle-button-label-color: var(--primary-text-color);
          --paper-toggle-button-checked-bar-color: var(--primary-color);
        }
      </style>
      <etools-content-panel
        class="content-section"
        panel-title="${translate('PARTNER_CONTACTS')} (${this.dataItems?.length})"
        show-expand-btn
      >
        <div slot="panel-btns" class="cp-header-actions-bar">
          <paper-toggle-button
            id="showInactive"
            ?checked="${this.showInactive}"
            @iron-change="${this.showInactiveChange}"
          >
            ${translate('SHOW_INACTIVE')}
          </paper-toggle-button>
          <div class="separator"></div>
          <a href="${this._getAMPLink(this.partnerId, this.user)}" target="_blank">
            <iron-icon id="information-icon" icon="icons:open-in-new"></iron-icon>
            <paper-tooltip for="information-icon" position="top">Access Management Portal</paper-tooltip>
          </a>
        </div>

        <div ?hidden="${this._emptyList(this.dataItems?.length)}">
          <etools-data-table-header no-collapse no-title>
            <etools-data-table-column class="col-2">${translate('POSITION')}</etools-data-table-column>
            <etools-data-table-column class="col-2">${translate('FIRST_NAME')}</etools-data-table-column>
            <etools-data-table-column class="col-2">${translate('LAST_NAME')}</etools-data-table-column>
            <etools-data-table-column class="col-2">${translate('PHONE_NUMBER')}</etools-data-table-column>
            <etools-data-table-column class="col-2">${translate('EMAIL_ADDRESS')}</etools-data-table-column>
            <etools-data-table-column class="col-2 center-align">${translate('ACTIVE_STAFF')}</etools-data-table-column>
          </etools-data-table-header>

          ${this.dataItems?.map(
            (item) => html`<etools-data-table-row
              secondary-bg-on-hover
              no-collapse
              ?hidden="${!this._isVisible(item.has_active_realm, this.showInactive)}"
            >
              <div slot="row-data" class="p-relative">
                <span class="col-data col-2">${this._displayValue(item.title)}</span>
                <span class="col-data col-2">${this._displayValue(item.first_name)}</span>
                <span class="col-data col-2">${this._displayValue(item.last_name)}</span>
                <span class="col-data col-2">${this._displayValue(item.phone)}</span>
                <span class="col-data col-2">${this._displayValue(item.email)}</span>
                <span class="col-data col-2 center-align">
                  <span ?hidden="${item.has_active_realm}" class="placeholder-style"
                    >${!item.active
                      ? translate('INACTIVE')
                      : !item.has_active_realm
                      ? translate('NO_ACCESS')
                      : ''}</span
                  >
                  <iron-icon icon="check" ?hidden="${!item.has_active_realm}"></iron-icon>
                </span>
              </div>
            </etools-data-table-row>`
          )}
        </div>

        <div class="row-h" ?hidden="${!this._emptyList(this.dataItems?.length)}">
          <p>${translate('THERE_ARE_NO_STAFF_MEMBERS_ADDED')}</p>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Boolean})
  showInactive = false;

  @property({type: Array})
  dataItems: StaffMember[] = [];

  @property({type: Number})
  partnerId: number | null = null;

  @property({type: Object})
  user!: User;

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('dataItems')) {
      this.dataItemsChanged();
    }
  }

  dataItemsChanged() {
    this._sortInactiveLast();
  }

  _sortInactiveLast() {
    if (!this.dataItems) {
      return;
    }
    this.dataItems.sort((a: any, b: any) => {
      return b.has_active_realm - a.has_active_realm;
    });
  }

  showInactiveChange(e: CustomEvent) {
    if (!e.detail) {
      return;
    }
    this.showInactive = (e.currentTarget as HTMLInputElement).checked;
  }

  _getAMPLink(partnerId: number | null, user: User) {
    let url = `/amp/users/`;
    if (user && user.is_unicef_user) {
      url += `list?organization_type=partner&organization_id=${partnerId}`;
    }
    return url;
  }

  _isVisible(has_active_realm: boolean, showInactive: boolean) {
    return has_active_realm || showInactive;
  }

  _emptyList(length: number) {
    return length === 0;
  }

  _displayValue(value: any) {
    return value ? value : '—';
  }
}
