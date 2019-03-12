import { PolymerElement, html } from '@polymer/polymer';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-dialog/etools-dialog.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../../store';
import { isJsonStrMatch } from '../../../../../utils/utils';
import { gridLayoutStyles } from '../../../../../styles/grid-layout-styles';

/**
 * @polymer
 * @customElement
 */
class GroupedLocationsDialog extends connect(store)(PolymerElement) {
  [x: string]: any;

  static get template() {
    return html`
      ${gridLayoutStyles}
      <style>
        [hidden] {
          display: none !important;
        }

        etools-dialog {
          --etools-dialog-scrollable: {
            min-height: 300px;
            font-size: 16px;
          };
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
        <etools-dropdown id="adminLevelsDropdw"
                        label="Group Locations By"
                        selected="{{adminLevel}}"
                        placeholder="&#8212;"
                        options="[[adminLevels]]"
                        option-label="name"
                        option-value="name"
                        disable-on-focus-handling>
        </etools-dropdown>

        <div class="bordered-div" hidden$="[[!message]]">
          [[message]]
        </div>

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
                  <div class="child-bottom-padding"> - [[subordinateLoc.name]]</div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </etools-dialog>
    `;
  }

  static get properties() {
    return {
      adminLevels: { // location types
        type: Array,
        statePath: 'locationTypes',
        observer: 'adminLevelsChanged'
      },
      adminLevel: {
        type: String,
        adminLevel: null,
        observer: 'adminLevelChanged'
      },
      locations: {
        type: Array,
        statePath: 'locations'
      },
      interventionLocations: {
        type: Array
      },
      interventionLocationIds: {
        type: Array,
        observer: 'interventionLocationIdsChanged',
        notify: true
      },
      groupedLocations: {
        type: Array
      },
      message: {
        type: String,
        value: null
      }
    };
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.locations, state.commonData!.locations )) {
      this.locations = [...state.commonData!.locations];
    }
    if (!isJsonStrMatch(this.adminLevels, state.commonData!.locationTypes )) {
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
    let index = adminLevels.findIndex(function(al: any) {
      return al.name === 'Country';
    });
    if (index > -1) {
      adminLevels.splice(index, 1);
      let aux = JSON.parse(JSON.stringify(adminLevels));
      this.adminLevels = [];
      this.adminLevels = aux;
    }
  }

  interventionLocationIdsChanged(locationIds: []) {
    if (!locationIds || !locationIds.length || !this.locations) {
      this.interventionLocations = [];
      return;
    }
    this._setInterventionLocationsDetails(locationIds);
  }

  _setInterventionLocationsDetails(locationIds: any[]) {
    locationIds = locationIds.map(function(loc) {
      return parseInt(loc);
    });
    let interventionLocations = this.locations.filter(function(loc: any) {
      return locationIds.indexOf(parseInt(loc.id)) > -1;
    });

    this.interventionLocations = [];
    this.interventionLocations = interventionLocations;
  }

  adminLevelChanged(adminLevel: any) {
    this.message = '';
    let groupedLocations = [];
    let locationsUnableToGroup = [];
    if (!adminLevel) {
      this.groupedLocations = null;
      return;
    }
    let i;
    // Build grouped locations structure
    for (i = 0; i < this.interventionLocations.length; i++) {
      let grouping = {
        adminLevelLocation: null,
        subordinateLocations: []
      };
      if (this.interventionLocations[i].gateway.name === adminLevel) { // gateway.name is location_type
        grouping.adminLevelLocation = this.interventionLocations[i];
        groupedLocations.push(grouping);
        continue;
      }

      // Find admin level parent location
      let adminLevelLocation = this._findAdminLevelParent(this.interventionLocations[i], adminLevel);
      if (!adminLevelLocation) {
        locationsUnableToGroup.push(this.interventionLocations[i].name);
        continue;
      }
      // Check if admin level parent Location is already a parent to another intervention location
      let existingGroup = this._findInGroupedLocations(groupedLocations, adminLevelLocation);
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
    this.$.groupedLocDialog.notifyResize();
  }

  _findInGroupedLocations(groupedLocations: [], adminLevelLocation: any) {
    if (!groupedLocations || !groupedLocations.length) {
      return null;
    }
    let existingGroup = groupedLocations.find(function(g) {
      return parseInt(g.adminLevelLocation.id) === parseInt(adminLevelLocation.id);
    });

    if (!existingGroup) {
      return null;
    }
    return existingGroup;
  }

  _findAdminLevelParent(location: any, adminLevel: any) {
    if (!location.parent) {
      return null;
    }
    let parent = this.locations.find(function(loc: any) {
      return parseInt(loc.id) === parseInt(location.parent);
    });
    if (!parent) {
      return null;
    }
    if (parent.gateway.name === adminLevel) {
      return parent;
    }
    return this._findAdminLevelParent(parent, adminLevel);
  }

  open() {
    this.$.groupedLocDialog.opened = true;
  }

}

window.customElements.define('grouped-locations-dialog', GroupedLocationsDialog);
