import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import CONSTANTS from '../../../../../../../config/app-constants';
import {fireEvent} from '../../../../../../utils/fire-custom-event';
import {isEmptyObject, isJsonStrMatch} from '../../../../../../utils/utils';
import {gridLayoutStyles} from '../../../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../../../styles/shared-styles';
import '../../../../../../layout/icons-actions.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../../../store';
import {property} from '@polymer/decorators';
import {Indicator, Location, Disaggregation, DisaggregationValue} from '../../../../../../../typings/intervention.types';
import {GenericObject} from '../../../../../../../typings/globals.types';

/**
 * @polymer
 * @customElement
 */
class AppliedIndicator extends connect(store)(PolymerElement) {

  static get template() {
    return html`
      ${gridLayoutStyles} ${SharedStyles}
      <style include="data-table-styles">
        [hidden] {
          display: none !important;
        }

        :host {
          display: block;
          /* '!important' is for IE */
          --list-bg-color: #eeeeee !important;
          --list-second-bg-color: #dfdfdf !important;
          --list-icon-color: white !important;
          --icons-actions: {
            background-color: #dfdfdf !important;
            margin-right: -8px;
          };
          --list-row-wrapper-padding: 0 24px 0 0 !important;

          --list-row-collapse-wrapper: {
            padding: 16px 24px 16px 24px !important;
            max-height: 220px;
            overflow-y: auto;
          };

          --icon-wrapper: {
            @apply --layout-horizontal;
            @apply --layout-center;
            @apply --layout-self-stretch;
            min-height: 48px;
            height: auto;
            padding: 0 !important;
            margin-right: 16px !important;
            background-color: var(--collapse-icon-bg-color, var(--primary-color));
            background-image: var(--collapse-icon-bg-image, none);
            background-size: 5.66px 5.66px;
          };
        }

        .divider {
          height: 24px;
        }

        .padd-left {
          padding-left: 16px;
        }

        icons-actions {
          visibility: hidden;
        }

        etools-data-table-row div[slot="row-data"]:hover icons-actions {
          visibility: visible;
        }

        .bolder-txt {
          font-weight: 600;
        }

        .indicatorType{
          font-weight: 600;
          font-size: 16px;
          margin-right: 4px;
        }
      </style>

      <etools-data-table-row>
        <div slot="row-data" class="p-relative">
          <div class="col-8">
            <label class="indicatorType">[[_getIndicatorDisplayType(indicator.indicator.unit, indicator.indicator.display_type)]]</label>
            <strong>[[_addInactivePrefix(indicator)]]</strong>
            [[_getIndicatorTitle(indicator)]]
          </div>
          <div class="col-2 right-align">
            [[_displayBaselineOrTarget(indicator.baseline, indicator.indicator.unit,
            indicator.indicator.display_type, indicator.cluster_indicator_id)]]
          </div>
          <div class="col-2 right-align">
            [[_displayBaselineOrTarget(indicator.target, indicator.indicator.unit,
            indicator.indicator.display_type, indicator.cluster_indicator_id)]]
          </div>
          <icons-actions hidden$="[[!editMode]]"
                        show-edit="[[indicator.is_active]]"
                        show-deactivate="[[_showDeactivate(inAmendment, indicator.is_active)]]"
                        show-delete="[[_showDelete(interventionStatus)]]">
          </icons-actions>
        </div>

        <div slot="row-data-details">
          <div class="layout-horizontal w100">
            <div class="col-4">
              <div class="header-text">Section / Cluster</div>
              <div>[[getSectionName(indicator.section, sections)]] / [[getClusterName(indicator.cluster_name)]]</div>
              <div class="divider"></div>

              <div hidden$="[[indicator.cluster_indicator_id]]">
                <div class="header-text">Disaggregation</div>
                <template is="dom-repeat" items="[[disaggregationNames]]">
                  <div><span class="bolder-txt">[[item.name]]</span>: [[item.groups]]</div>
                </template>
                <div hidden$="[[!_lengthIs0(disaggregationNames.length)]]">—</div>
              </div>
            </div>
            <div class="col-8 padd-left">
              <div class="header-text">Locations</div>
              <template is="dom-repeat" items="[[locationNames]]">
                <div><span class="bolder-txt">[[item.name]]</span> [[item.adminLevel]]</div>
              </template>
            </div>
          </div>
        </div>
      </etools-data-table-row>
    `;
  }

  @property({type: Object})
  indicator!: Indicator;

  @property({type: Boolean})
  inAmendment!: boolean;

  @property({type: Array})
  locations!: Location[];

  @property({type: Array})
  locationNames: {name: string; adminLevel: string}[] = [];

  @property({type: Array})
  sections!: GenericObject[];

  @property({type: Array})
  disaggregations!: Disaggregation[];

  @property({type: Array})
  disaggregationNames: {name: string; groups: string}[] = [];

  @property({type: Boolean})
  editMode!: boolean;

  @property({type: String})
  interventionStatus!: string;


  static get observers() {
    return [
      'setIndicatorDetails(indicator, disaggregations, locations)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.sections, state.commonData!.sections)) {
      this.sections = state.commonData!.sections;
    }
    if (!isJsonStrMatch(this.locations, state.commonData!.locations)) {
      this.locations = state.commonData!.locations;
    }
    if (!isJsonStrMatch(this.disaggregations, state.commonData!.disaggregations)) {
      this.disaggregations = state.commonData!.disaggregations;
    }
    if (this.inAmendment !== state.pageData!.in_amendment) {
      this.inAmendment = state.pageData!.in_amendment;
    }
  }

  ready() {
    super.ready();
    this._initAppliedIndicatorListeners();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeAppliedIndicatorListeners();
  }

  _initAppliedIndicatorListeners() {
    this._editIndicator = this._editIndicator.bind(this);
    this._deleteIndicator = this._deleteIndicator.bind(this);
    this._deactivateIndicator = this._deactivateIndicator.bind(this);

    this.addEventListener('edit', this._editIndicator as EventListener);
    this.addEventListener('delete', this._deleteIndicator as EventListener);
    this.addEventListener('deactivate', this._deactivateIndicator as EventListener);
  }

  _removeAppliedIndicatorListeners() {
    this.removeEventListener('edit', this._editIndicator as EventListener);
    this.removeEventListener('delete', this._deleteIndicator as EventListener);
    this.removeEventListener('deactivate', this._deactivateIndicator as EventListener);
  }

  _showDeactivate(inAmendment: boolean, indicIsActive: boolean) {
    return (inAmendment && indicIsActive);
  }

  _showDelete(interventionStatus: string) {
    return (!interventionStatus ||
        interventionStatus === CONSTANTS.STATUSES.Draft.toLowerCase());
  }

  setIndicatorDetails(indicator: any, disaggregations: any, locations: any) {
    if (typeof indicator === 'undefined' ||
        typeof disaggregations === 'undefined' ||
        typeof locations === 'undefined') {
      return;
    }
    this._updateCollapsableIconBg(indicator);
    this._setLocationNames();
    this._setDisaggregationNames();
  }

  _editIndicator(e: CustomEvent) {
    e.stopPropagation();
    fireEvent(this, 'edit-indicator');
  }

  _deleteIndicator(e: CustomEvent) {
    e.stopPropagation();
    fireEvent(this, 'delete-indicator');
  }

  _deactivateIndicator(e: CustomEvent) {
    e.stopPropagation();
    fireEvent(this, 'deactivate-indicator');
  }

  _updateCollapsableIconBg(indicator: any) {
    if (indicator.cluster_indicator_id) {
      this.updateStyles({'--collapse-icon-bg-color': 'var(--ternary-color)', '--collapse-icon-bg-image': 'none'});
    } else {
      let hfBgImg = 'none';
      if (indicator.is_high_frequency) {
        hfBgImg = 'linear-gradient(135deg, #066ac7 12.50%, #0099ff 12.50%, #0099ff 50%, #066ac7 50%, ' +
            '#066ac7 62.50%, #0099ff 62.50%, #0099ff 100%)';
      }
      this.updateStyles({
        '--collapse-icon-bg-color': 'var(--primary-color)',
        '--collapse-icon-bg-image': hfBgImg
      });
    }
  }

  _setLocationNames() {
    if (!this.locations) {
      return;
    }
    const locations = this.locations.filter((loc: any) => {
      return this.indicator.locations.indexOf(parseInt(loc.id)) > -1;
    });
    const locNames = locations.map((l: any) => {
      return {
        name: l.name.substring(0, l.name.indexOf('[')),
        adminLevel: l.name.substring(l.name.indexOf('['))
      };
    });
    this.locationNames = locNames;
  }

  getSectionName(sectionId: string) {
    let sectionName = '—';
    if (sectionId && !isEmptyObject(this.sections)) {
      const section = this.sections.find(function(s: any) {
        return parseInt(s.id) === parseInt(sectionId);
      });
      if (section) {
        sectionName = section.name;
      }
    }
    return sectionName;
  }

  getClusterName(clusterName: string) {
    return !clusterName ? '—' : clusterName;
  }

  _setDisaggregationNames() {
    if (!this.indicator.disaggregation || !this.indicator.disaggregation.length) {
      this.disaggregationNames = [];
      return;
    }
    const disaggregs = this.disaggregations.filter((d: Disaggregation) => {
      return this.indicator.disaggregation.indexOf(d.id!) > -1;
    });
    const disaggregNames = disaggregs.map((d: any) => {
      return {name: d.name, groups: this._getDisaggregGroups(d.disaggregation_values)};
    });
    this.disaggregationNames = disaggregNames;
  }

  _getDisaggregGroups(disaggregGroups: DisaggregationValue[]) {
    if (!disaggregGroups || !disaggregGroups.length) {
      return '—';
    }
    const groups = disaggregGroups.reduce(function(flattened: string, current: any) {
      return flattened + ', ' + current.value;
    }, '');

    return groups.substring(1, groups.length);
  }

  // Both unit and displayType are used because of inconsitencies in the db.
  _getIndicatorDisplayType(unit: string, displayType: string) {
    if (!unit) {
      return '';
    }

    switch (unit) {
      case 'number':
        return '# ';
      case 'percentage':
        if (displayType === 'percentage') {
          return '% ';
        } else if (displayType === 'ratio') {
          return '÷ ';
        }
        return '';
      default:
        return '';
    }
  }

  _getIndicatorTitle(indicator: any) {
    if (!indicator) {
      return '—';
    }
    if (indicator.cluster_indicator_id) {
      return indicator.cluster_indicator_title;
    } else {
      return indicator.indicator ? indicator.indicator.title : '—';
    }
  }


  _displayBaselineOrTarget(item: any, unit: string, displayType: string, isCluster: boolean) {
    if (!item) {
      return '—';
    }
    if (!item.v && parseInt(item.v) !== 0) {
      return '—';
    }

    if (isCluster && this._clusterIndIsRatio(item)) {
      return item.v + ' / ' + item.d;
    }

    if (unit === 'percentage' && displayType === 'ratio') {
      return item.v + ' / ' + item.d;
    }

    return item.v;
  }

  _clusterIndIsRatio(item: any) {
    return item.d && parseInt(item.d) !== 1 && parseInt(item.d) !== 100;
  }

  _addInactivePrefix(indicator: any) {
    return (!indicator || indicator.is_active) ? '' : '(inactive)';
  }

  _lengthIs0(length: number) {
    return length === 0;
  }

}

window.customElements.define('applied-indicator', AppliedIndicator);
export {AppliedIndicator as AppliedIndicatorEl};
