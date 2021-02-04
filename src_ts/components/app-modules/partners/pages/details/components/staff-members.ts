import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@polymer/paper-icon-button/paper-icon-button';

import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';

import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../../styles/shared-styles';
import {etoolsCpHeaderActionsBarStyles} from '../../../../../styles/etools-cp-header-actions-bar-styles';

import '../../../../interventions/pages/intervention-tab-pages/common/layout/icons-actions';
import './add-edit-staff-members';
import {property} from '@polymer/decorators';
import {StaffMember} from '../../../../../../models/partners.models';
import {openDialog} from '../../../../../utils/dialog';

/**
 * @polymer
 * @customElement
 */
class StaffMembers extends PolymerElement {
  static get template() {
    // language=HTML
    return html`
      ${gridLayoutStyles} ${SharedStyles} ${etoolsCpHeaderActionsBarStyles}
      <style include="data-table-styles">
        [hidden] {
          display: none !important;
        }

        :host {
          display: block;
          width: 100%;
        }

        etools-content-panel {
          margin-top: 24px;
        }

        icons-actions {
          visibility: hidden;
        }

        etools-data-table-row:hover icons-actions {
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
        panel-title="Partner Contacts ([[dataItems.length]])"
        show-expand-btn
      >
        <div slot="panel-btns" class="cp-header-actions-bar">
          <paper-toggle-button id="showInactive" checked="{{showInactive}}"> Show Inactive </paper-toggle-button>
          <div class="separator" hidden$="[[!editMode]]"></div>
          <paper-icon-button
            icon="add-box"
            disabled="[[!editMode]]"
            hidden$="[[!editMode]]"
            title="Add"
            on-click="_addPartnerContact"
          >
          </paper-icon-button>
        </div>

        <div hidden$="[[_emptyList(dataItems.length)]]">
          <etools-data-table-header no-collapse no-title>
            <etools-data-table-column class="col-2">
              Position
            </etools-data-table-column>
            <etools-data-table-column class="col-2">
              First Name
            </etools-data-table-column>
            <etools-data-table-column class="col-2">
              Last Name
            </etools-data-table-column>
            <etools-data-table-column class="col-2">
              Phone Number
            </etools-data-table-column>
            <etools-data-table-column class="col-2">
              Email Address
            </etools-data-table-column>
            <etools-data-table-column class="col-2 center-align">
              Active Staff
            </etools-data-table-column>
          </etools-data-table-header>

          <template is="dom-repeat" items="{{dataItems}}">
            <etools-data-table-row
              secondary-bg-on-hover
              no-collapse
              hidden$="[[!_isVisible(item.active, showInactive)]]"
            >
              <div slot="row-data" class="p-relative">
                <span class="col-data col-2">
                  [[_displayValue(item.title)]]
                </span>
                <span class="col-data col-2">
                  [[_displayValue(item.first_name)]]
                </span>
                <span class="col-data col-2">
                  [[_displayValue(item.last_name)]]
                </span>
                <span class="col-data col-2">
                  [[_displayValue(item.phone)]]
                </span>
                <span class="col-data col-2">
                  [[_displayValue(item.email)]]
                </span>
                <span class="col-data col-2 center-align">
                  <span hidden$="[[item.active]]" class="placeholder-style">&#8212;</span>
                  <iron-icon icon="check" hidden$="[[!item.active]]"></iron-icon>
                </span>
                <icons-actions
                  item$="[[item]]"
                  hidden$="[[!editMode]]"
                  show-delete="[[showDelete]]"
                  on-edit="_editPartnerContact"
                >
                </icons-actions>
              </div>
            </etools-data-table-row>
          </template>
        </div>

        <div class="row-h" hidden$="[[!_emptyList(dataItems.length)]]">
          <p>There are no staff members added.</p>
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

  static get observers() {
    return ['dataItemsChanged(dataItems, dataItems.*)'];
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

  _addPartnerContact() {
    this.openAddEditDialog(new StaffMember({}));
  }

  _editPartnerContact(e: Event) {
    const item = JSON.parse((e.target as PolymerElement).getAttribute('item')!);
    this.openAddEditDialog(item);
  }

  openAddEditDialog(item?: any) {
    if(!item) {
      item = new StaffMember({});
    }
    openDialog({
      dialog: 'add-edit-staff-members',
      dialogData: {
        item: item,
        partnerId: this.partnerId,
        dataItems: this.dataItems,
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

window.customElements.define('staff-members', StaffMembers);
