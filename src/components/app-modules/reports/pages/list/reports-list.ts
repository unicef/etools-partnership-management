import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout-classes.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-dropdown/etools-dropdown-multi.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';

import '../../components/reports-display-list.js';
import { SharedStyles } from '../../../../styles/shared-styles.js';
import { listFilterStyles } from '../../../../styles/list-filter-styles.js';
import AppNavigationHelperMixin from '../../../../mixins/app-navigation-helper-mixin.js';
import ListFiltersMixin from '../../../../mixins/list-filters-mixin.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../store.js';
import { isJsonStrMatch } from '../../../../utils/utils.js';
import { partnersDropdownDataSelector } from '../../../../../reducers/partners.js';
import CONSTANTS from '../../../../../config/app-constants.js';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin AppNavigationHelper
 * @appliesMixin ListFilters
 */
const ReportsListRequiredMixins = EtoolsMixinFactory.combineMixins([
  AppNavigationHelperMixin,
  ListFiltersMixin
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin ReportsListRequiredMixins
 */
class ReportsList extends connect(store)(ReportsListRequiredMixins) {

  static get is() {
    return 'reports-list';
  }

  static get template() {
    return html`
    ${SharedStyles} ${listFilterStyles}
    <style include="paper-material-styles">
    </style>

    <div id="filters" class="paper-material" elevation="1">

      <div id="filters-fields">

        <paper-input id="query"
                      class="filter"
                      type="search"
                      autocomplete="off"
                      value="{{queryParams.pd_ref_title}}"
                      placeholder="Search">
          <iron-icon icon="search" slot="prefix"></iron-icon>
        </paper-input>

        <template is="dom-repeat" items="[[selectedFilters]]" as="filter">
          <template is="dom-if" if="[[filter.singleSelection]]">
            <etools-dropdown
                class="filter"
                label="[[filter.filterName]]"
                placeholder="&#8212;"
                disabled$="[[!filter.selectionOptions.length]]"
                options="[[filter.selectionOptions]]"
                option-value="[[filter.optionValue]]"
                option-label="[[filter.optionLabel]]"
                selected="{{filter.alreadySelected}}"
                on-selected-changed="filterValueChanged"
                data-filter-path$="[[filter.path]]"
                hide-search="[[filter.hideSearch]]"
                min-width="[[filter.minWidth]]"
                horizontal-align="left"
                no-dynamic-align
                enable-none-option>
            </etools-dropdown>
          </template>
          <template is="dom-if" if="[[!filter.singleSelection]]">
            <etools-dropdown-multi
                class="filter"
                label="[[filter.filterName]]"
                placeholder="&#8212;"
                disabled$="[[!filter.selectionOptions.length]]"
                options="[[filter.selectionOptions]]"
                option-value="[[filter.optionValue]]"
                option-label="[[filter.optionLabel]]"
                selected-values="{{filter.alreadySelected}}"
                trigger-value-change-event
                on-etools-selected-items-changed="esmmValueChanged"
                data-filter-path$="[[filter.path]]"
                hide-search="[[filter.hideSearch]]"
                min-width="[[filter.minWidth]]"
                horizontal-align="left"
                no-dynamic-align>
            </etools-dropdown-multi>
          </template>
        </template>

      </div>

      <div class="fixed-controls">

        <paper-menu-button id="filterMenu" ignore-select horizontal-align="right">
          <paper-button class="button" slot="dropdown-trigger">
            <iron-icon icon="filter-list"></iron-icon>
            Filters
          </paper-button>
          <div slot="dropdown-content" class="clear-all-filters">
            <paper-button on-tap="clearAllFilterValues"
                  class="secondary-btn">
                    CLEAR ALL
            </paper-button>
          </div>
          <paper-listbox slot="dropdown-content" multi>
            <template is="dom-repeat" items="[[listFilterOptions]]">
              <paper-icon-item on-tap="selectFilter" selected$="[[item.selected]]">
                <iron-icon icon="check" slot="item-icon" hidden$="[[!item.selected]]"></iron-icon>
                <paper-item-body>[[item.filterName]]</paper-item-body>
              </paper-icon-item>
            </template>
          </paper-listbox>
        </paper-menu-button>

      </div>

    </div>

    <reports-display-list query-params="[[queryParams]]"
                          paginator="{{paginator}}"
                          wait-query-params-init></reports-display-list>
    `;
  }

  static get properties() {
    return {
      urlParams: {
        type: Object
      },
      active: {
        type: Boolean,
        value: false
      },
      csvDownloadUrl: {
        type: String,
        notify: true
      },
      // filters options
      partners: {
        type: Array,
        statePath: 'partnersDropdownData'
      },
      cpOutputs: {
        type: Array,
        statePath: 'cpOutputs'
      },
      sections: {
        type: Array,
        statePath: 'sections'
      },
      reportStatuses: {
        type: Array,
        statePath: 'reportStatuses'
      },
      reportTypes: {
        type: Array,
        statePath: 'reportTypes'
      },
      unicefUsersData: {
        type: Array,
        statePath: 'unicefUsersData'
      },
      // selected filters values
      queryParams: {
        type: Object,
        value: {
          pd_ref_title: null,
          external_partner_id: null,
          cp_output: null,
          section: null,
          status: [],
          report_type: null,
          unicef_focal_points: []
        }
      },
      paginator: {
        type: Object
      },
      _initComplete: {
        type: Boolean,
        value: false
      },
      _prevFiltersChangedArgs: String
    };
  }

  static get observers() {
    return [
      '_initListFilters(partners, cpOutputs, sections, unicefUsersData, reportStatuses, reportTypes)',
      '_updateURL(queryParams.*, paginator.page, paginator.page_size, _initComplete)',
      '_init(active)',
      '_filtersChanged(queryParams.pd_ref_title, queryParams.external_partner_id, ' +
        'queryParams.cp_output, queryParams.section, queryParams.status.length, queryParams.report_type, ' +
        'queryParams.unicef_focal_points.length)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.cpOutputs, state.commonData!.cpOutputs)) {
      this.cpOutputs = [...state.commonData!.cpOutputs];
    }
    if (!isJsonStrMatch(this.sections, state.commonData!.sections)) {
      this.sections = [...state.commonData!.sections];
    }
    if (!isJsonStrMatch(this.reportTypes, state.commonData!.reportTypes)) {
      this.reportTypes = [...state.commonData!.reportTypes];
    }
    if (!isJsonStrMatch(this.reportStatuses, state.commonData!.reportStatuses)) {
      this.reportStatuses = [...state.commonData!.reportStatuses];
    }
    if (!isJsonStrMatch(this.unicefUsersData, state.commonData!.unicefUsersData)) {
      this.unicefUsersData = [...state.commonData!.unicefUsersData];
    }
    this.pertners = partnersDropdownDataSelector(state);
  }

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    this.fireEvent('global-loading', {active: false, loadingSource: 'reports-page'});
  }

  _initListFilters(partners, cpOutputs, sections, unicefUsersData, reportStatuses, reportTypes) {
    if (!partners || partners.length === 0 || !cpOutputs || !sections ||
        !unicefUsersData || unicefUsersData.length === 0 || !reportStatuses || !reportTypes) {
      return;
    }
    // init list filter options
    // IMPORTANT!!!
    // If you change filterName make sure you update it as well in _updateSelectedFiltersValues method
    // IMPORTANT!!!
    this.initListFiltersData([
      {
        filterName: 'CP Output',
        type: 'esmm',
        singleSelection: true,
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: cpOutputs,
        alreadySelected: null,
        path: 'queryParams.cp_output',
        selected: false,
        minWidth: '400px'
      },
      {
        filterName: 'Partner',
        type: 'esmm',
        singleSelection: true,
        optionValue: 'value',
        optionLabel: 'label',
        selectionOptions: partners,
        alreadySelected: null,
        path: 'queryParams.external_partner_id',
        selected: false,
        minWidth: '400px'
      },
      {
        filterName: 'Report Status',
        type: 'esmm', // etools-dropdown-multi
        singleSelection: false,
        selectionOptions: reportStatuses,
        optionValue: 'value',
        optionLabel: 'label',
        alreadySelected: [],
        path: 'queryParams.status',
        selected: true,
        minWidth: '160px',
        hideSearch: true
      },
      {
        filterName: 'Report Type',
        type: 'esmm',
        singleSelection: true,
        selectionOptions: reportTypes,
        optionValue: 'value',
        optionLabel: 'label',
        alreadySelected: null,
        path: 'queryParams.report_type',
        selected: true,
        minWidth: '300px',
        hideSearch: true
      },
      {
        filterName: 'Section',
        type: 'esmm',
        singleSelection: true,
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: sections,
        alreadySelected: null,
        path: 'queryParams.section',
        selected: false,
        minWidth: '400px',
        hideSearch: true
      },
      {
        filterName: 'UNICEF focal points',
        type: 'esmm',
        singleSelection: false,
        optionValue: 'email',
        optionLabel: 'name',
        selectionOptions: unicefUsersData,
        alreadySelected: [],
        path: 'queryParams.unicef_focal_points',
        selected: false,
        minWidth: '400px'
      }
    ]);
    this._updateSelectedFiltersValues();
  }

  // update selected filters(prezent in URL) at page refresh
  _updateSelectedFiltersValues() {
    this._updateFiltersValsDebouncer = Polymer.Debouncer.debounce(this._updateFiltersValsDebouncer,
        Polymer.Async.timeOut.after(100),
        () => {
          let filtersValues = [
            {
              filterName: 'Report Status',
              selectedValue: this.queryParams.status
            },
            {
              filterName: 'Report Type',
              selectedValue: this.queryParams.report_type
            },
            {
              filterName: 'Partner',
              selectedValue: this.queryParams.external_partner_id
            },
            {
              filterName: 'CP Output',
              selectedValue: this.queryParams.cp_output
            },
            {
              filterName: 'Section',
              selectedValue: this.queryParams.section
            },
            {
              filterName: 'UNICEF focal points',
              selectedValue: this.queryParams.unicef_focal_points
            }
          ];
          this.updateShownFilters(filtersValues);
        });
  }

  _init(active) {
    if (!active) {
      return;
    }
    let urlQueryParams = this.urlParams;
    this.set('_initComplete', false);

    if (_.isEmpty(urlQueryParams)) {
      urlQueryParams.status = 'Sub|Ove|Sen';
    }

    this.setProperties({
      'queryParams.pd_ref_title': urlQueryParams.pd_ref_title ? urlQueryParams.pd_ref_title : '',
      'queryParams.external_partner_id':
          urlQueryParams.external_partner_id ? urlQueryParams.external_partner_id : null,
      'queryParams.cp_output': urlQueryParams.cp_output ? urlQueryParams.cp_output : null,
      'queryParams.section': urlQueryParams.section ? urlQueryParams.section : null,
      'queryParams.status': urlQueryParams.status ? urlQueryParams.status.split('|') : this.queryParams.status,
      'queryParams.unicef_focal_points': urlQueryParams.unicef_focal_points
          ? urlQueryParams.unicef_focal_points.split('|') : [],
      'queryParams.report_type': urlQueryParams.report_type ? urlQueryParams.report_type : null,
      'paginator.page': urlQueryParams.page ? Number(urlQueryParams.page) : 1,
      'paginator.page_size':
          urlQueryParams.page_size ? Number(urlQueryParams.page_size) : CONSTANTS.DEFAULT_LIST_SIZE
    });

    this._updateSelectedFiltersValues();
    this.set('_initComplete', true);
  }

  _updateURL(queryParamsData, pageNr, pageSize, _initComplete) {
    if (!_initComplete) {
      return;
    }
    if (!queryParamsData || !pageNr || !pageSize) {
      return;
    }

    let qs = this._buildQueryString();
    // update URL
    this.updateAppState('reports/list', qs, true);
  }

  // Outputs the query string for the list
  _buildQueryString() {
    let qStrData = [];
    if (!_.isEmpty(this.queryParams)) {
      Object.keys(this.queryParams).forEach(function(k) {
        let qStrVal;
        if (this.queryParams[k] instanceof Array && !_.isEmpty(this.queryParams[k])) {
          qStrVal = this.queryParams[k].join('|');
        } else if (['string', 'number'].indexOf(typeof this.queryParams[k]) > -1) {
          qStrVal = this.queryParams[k];
        }
        if (qStrVal) {
          qStrData.push(k + '=' + qStrVal);
        }
      }.bind(this));
    }
    if (!_.isEmpty(this.paginator)) {
      if (this.paginator.page) {
        qStrData.push('page=' + this.paginator.page);
      }
      if (this.paginator.page_size) {
        qStrData.push('page_size=' + this.paginator.page_size);
      }
    }
    return qStrData.join('&');
  }

  /**
   * _prevFiltersChangedArgs check will prevent page reset in case queryParams array values are updated,
   * but with the same value. Ex: by default queryParams.unicef_focal_points = [], when filter si selected from menu,
   * queryParams.unicef_focal_points is updated, but to a new empty array (by esmm) and this will
   * trigger _filtersChanged observer.
   * @private
   */
  _filtersChanged() {
    // eslint-disable-next-line
    let sAgrs = JSON.stringify(arguments);
    if (this._prevFiltersChangedArgs !== sAgrs) {
      this.set('paginator.page', 1);
      this._prevFiltersChangedArgs = sAgrs;
    }
  }
}

window.customElements.define(ReportsList.is, ReportsList);
