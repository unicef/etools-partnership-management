import {LitElement, html, customElement, property, PropertyValues} from 'lit-element';

import '@polymer/paper-toggle-button/paper-toggle-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';

import '../../../../../common/components/icons-actions';
import './add-edit-staff-members';
import {translate} from 'lit-translate';
import {StaffMember} from '../../../../../../models/partners.models';
import {openDialog} from '../../../../../utils/dialog';
import {etoolsCpHeaderActionsBarStyles} from '../../../../../styles/etools-cp-header-actions-bar-styles-lit';
import cloneDeep from 'lodash-es/cloneDeep';

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
          <div class="separator" ?hidden="${!this.editMode}"></div>
          <paper-icon-button
            icon="add-box"
            ?disabled="${!this.editMode}"
            ?hidden="${!this.editMode}"
            title="${translate('GENERAL.ADD')}"
            @click="${this._addPartnerContact}"
          >
          </paper-icon-button>
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
              ?hidden="${!this._isVisible(item.active, this.showInactive)}"
            >
              <div slot="row-data" class="p-relative">
                <span class="col-data col-2">${this._displayValue(item.title)}</span>
                <span class="col-data col-2">${this._displayValue(item.first_name)}</span>
                <span class="col-data col-2">${this._displayValue(item.last_name)}</span>
                <span class="col-data col-2">${this._displayValue(item.phone)}</span>
                <span class="col-data col-2">${this._displayValue(item.email)}</span>
                <span class="col-data col-2 center-align">
                  <span ?hidden="${item.active}" class="placeholder-style">&#8212;</span>
                  <iron-icon icon="check" ?hidden="${!item.active}"></iron-icon>
                </span>
                <icons-actions2
                  .item="${item}"
                  ?hidden="${!this.editMode}"
                  .showDelete="${this.showDelete}"
                  @edit="${this._editPartnerContact}"
                >
                </icons-actions2>
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

  @property({type: Boolean})
  showDelete = false;

  @property({type: Boolean})
  editMode = false;

  @property({type: Array})
  dataItems: StaffMember[] = [];

  @property({type: Number})
  partnerId: number | null = null;

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
      return b.active - a.active;
    });
  }

  showInactiveChange(e: CustomEvent) {
    if (!e.detail) {
      return;
    }
    this.showInactive = (e.currentTarget as HTMLInputElement).checked;
  }

  _addPartnerContact() {
    this.openAddEditDialog(new StaffMember({}));
  }

  _editPartnerContact(e: CustomEvent) {
    this.openAddEditDialog(e.detail);
  }

  openAddEditDialog(item?: any) {
    if (!item) {
      item = new StaffMember({});
    }
    openDialog({
      dialog: 'add-edit-staff-members',
      dialogData: {
        item: cloneDeep(item),
        partnerId: this.partnerId,
        dataItems: cloneDeep(this.dataItems),
        mainEl: this
      }
    });
  }

  _isVisible(active: boolean, showInactive: boolean) {
    return active || showInactive;
  }

  _emptyList(length: number) {
    return length === 0;
  }

  _displayValue(value: any) {
    return value ? value : '—';
  }
}
