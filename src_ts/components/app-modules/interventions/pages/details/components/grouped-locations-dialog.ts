import {PolymerElement, html} from '@polymer/polymer';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../../store';
import {isJsonStrMatch} from '../../../../../utils/utils';
import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles';
import {Location} from '../../../../../../typings/intervention.types';
import {property} from '@polymer/decorators';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';

class GroupedLocations {
  adminLevelLocation: Location | null = null;
  subordinateLocations: Location[] = [];
}

/**
 * @polymer
 * @customElement
 */
class GroupedLocationsDialog extends connect(store)(PolymerElement) {
  static get template() {
    return html`
      ${gridLayoutStyles}
      <style>
        [hidden] {
          display: none !important;
        }

        eetools-dialog::part(ed-scrollable) {
          min-height: 300px;
          font-size: 16px;
        }

        .adminLevelLoc {
          color: var(--primary-color);
          font-weight: bold;
        }

        .left-padding {
          padding-left: 16px;
        }

        .top-padding {
          padding-top: 16px;
        }

        .child-bottom-padding {
          padding-bottom: 8px;
        }

        .parent-padding {
          padding-bottom: 8px;
          padding-top: 8px;
        }

        .bordered-div {
          border: solid 1px var(--error-box-border-color);
          background-color: var(--error-box-bg-color);
          padding: 10px;
          margin: 16px 0px;
        }

        div.child-bottom-padding:last-of-type {
          padding-bottom: 0px;
        }
      </style>
      <etools-dialog id="groupedLocDialog" size="md" dialog-title="Locations PD/SSFA Covers" hide-confirm-btn>
        <etools-dropdown
          id="adminLevelsDropdw"
          label="Group Locations By"
          selected="{{adminLevel}}"
          placeholder="&#8212;"
          options="[[adminLevels]]"
          option-label="name"
          option-value="name"
          disable-on-focus-handling
        >
        </etools-dropdown>

        <div class="bordered-div" hidden$="[[!message]]">[[message]]</div>

        <div class="row-padding-v" hidden$="[[adminLevel]]">
          <template is="dom-repeat" items="[[interventionLocations]]">
            <div class="top-padding">- [[item.name]]</div>
          </template>
        </div>
        <div class="row-padding-v" hidden$="[[!adminLevel]]">
          <template is="dom-repeat" items="[[groupedLocations]]">
            <div class="parent-padding">
              <div class="adminLevelLoc">[[item.adminLevelLocation.name]]</div>
              <div class="left-padding">
                <template is="dom-repeat" items="[[item.subordinateLocations]]" as="subordinateLoc">
                  <div class="child-bottom-padding">- [[subordinateLoc.name]]</div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </etools-dialog>
    `;
  }

  @property({
    type: Array,
    observer: GroupedLocationsDialog.prototype.adminLevelsChanged
  })
  adminLevels!: {id: number; name: string; admin_level: any}[];

  @property({
    type: String,
    observer: GroupedLocationsDialog.prototype.adminLevelChanged
  })
  adminLevel!: string | null;

  @property({type: Array})
  locations!: Location[];

  @property({type: Array})
  interventionLocations!: Location[];

  @property({
    type: Array,
    notify: true,
    // @ts-ignore
    observer: GroupedLocationsDialog.prototype.interventionLocationIdsChanged
  })
  interventionLocationIds!: [];

  @property({type: Array})
  groupedLocations!: GroupedLocations[] | null;

  @property({type: String})
  message = '';

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.locations, state.commonData!.locations)) {
      this.locations = [...state.commonData!.locations];
    }
    if (!isJsonStrMatch(this.adminLevels, state.commonData!.locationTypes)) {
      this.adminLevels = [...state.commonData!.locationTypes];
    }
  }

  adminLevelsChanged(adminLevels: any) {
    if (!adminLevels || !adminLevels.length) {
      return;
    }
    this._removeCountry(adminLevels);
  }

  _removeCountry(adminLevels: any) {
    const index = adminLevels.findIndex(function (al: any) {
      return al.name === 'Country';
    });
    if (index > -1) {
      adminLevels.splice(index, 1);
      const aux = JSON.parse(JSON.stringify(adminLevels));
      this.adminLevels = [];
      this.adminLevels = aux;
    }
  }

  interventionLocationIdsChanged(locationIds: string[]) {
    if (!locationIds || !locationIds.length || !this.locations) {
      this.interventionLocations = [];
      return;
    }
    this._setInterventionLocationsDetails(locationIds);
  }

  _setInterventionLocationsDetails(locationIds: any[]) {
    locationIds = locationIds.map(function (loc) {
      return parseInt(loc);
    });
    const interventionLocations: Location[] = this.locations.filter(function (loc: any) {
      return locationIds.indexOf(parseInt(loc.id)) > -1;
    });

    this.interventionLocations = [];
    this.interventionLocations = interventionLocations;
  }

  adminLevelChanged(selectedAdminLevel: any) {
    this.message = '';
    const groupedLocations: GroupedLocations[] = [];
    const locationsUnableToGroup = [];

    if (!selectedAdminLevel) {
      this.groupedLocations = null;
      return;
    }
    let i;
    // Build grouped locations structure
    for (i = 0; i < this.interventionLocations.length; i++) {
      const grouping = new GroupedLocations();

      if (this.interventionLocations[i].gateway.name === selectedAdminLevel) {
        // gateway.name is location_type
        grouping.adminLevelLocation = this.interventionLocations[i];
        groupedLocations.push(grouping);
        continue;
      }

      // Find admin level parent location
      const adminLevelLocation = this._findAdminLevelParent(this.interventionLocations[i], selectedAdminLevel);
      if (!adminLevelLocation) {
        locationsUnableToGroup.push(this.interventionLocations[i].name);
        continue;
      }
      // Check if admin level parent Location is already a parent to another intervention location
      const existingGroup = this._findInGroupedLocations(groupedLocations, adminLevelLocation);
      if (!existingGroup) {
        groupedLocations.push({
          adminLevelLocation: adminLevelLocation,
          subordinateLocations: [this.interventionLocations[i]]
        });
      } else {
        existingGroup.subordinateLocations.push(this.interventionLocations[i]);
      }
    }

    if (locationsUnableToGroup && locationsUnableToGroup.length) {
      this.message = 'Locations unable to group: ' + locationsUnableToGroup.join(', ');
    }

    this.groupedLocations = groupedLocations;

    (this.$.groupedLocDialog as EtoolsDialog).notifyResize();
  }

  _findInGroupedLocations(groupedLocations: GroupedLocations[], adminLevelLocation: any) {
    if (!groupedLocations || !groupedLocations.length) {
      return null;
    }
    const existingGroup = groupedLocations.find(function (g) {
      return parseInt((g.adminLevelLocation!.id as unknown) as string) === parseInt(adminLevelLocation.id);
    });

    if (!existingGroup) {
      return null;
    }
    return existingGroup;
  }

  _findAdminLevelParent(location: Location, adminLevel: string): Location | null {
    if (!location.parent) {
      return null;
    }
    const parentLoc: Location | undefined = this.locations.find(function (loc: any) {
      return parseInt(loc.id) === parseInt(location.parent as string);
    });
    if (!parentLoc) {
      return null;
    }
    if (parentLoc.gateway.name === adminLevel) {
      return parentLoc;
    }
    return this._findAdminLevelParent(parentLoc, adminLevel);
  }

  open() {
    (this.$.groupedLocDialog as EtoolsDialog).opened = true;
  }
}

window.customElements.define('grouped-locations-dialog', GroupedLocationsDialog);

export {GroupedLocationsDialog};
