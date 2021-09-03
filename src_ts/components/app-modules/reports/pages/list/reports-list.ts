import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';

import '../../components/reports-display-list';
import {SharedStyles} from '../../../../styles/shared-styles';
import {listFilterStyles} from '../../../../styles/list-filter-styles';
import ListFiltersMixin from '../../../../mixins/list-filters-mixin';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../redux/store';
import {isJsonStrMatch, isEmptyObject} from '../../../../utils/utils';
import {partnersDropdownDataSelector} from '../../../../../redux/reducers/partners';
import CONSTANTS from '../../../../../config/app-constants';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {updateAppState} from '../../../../utils/navigation-helper';
import {property} from '@polymer/decorators';
import {LabelAndValue, MinimalUser, CpOutput, GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin ListFiltersMixin
 */
// @ts-ignore
class ReportsList extends connect(store)(ListFiltersMixin(PolymerElement)) {
  static get is() {
    return 'reports-list';
  }

  static get template() {
    return html`
      ${SharedStyles} ${listFilterStyles}
      <style include="paper-material-styles"></style>

      <div id="filters" class="paper-material" elevation="1">
        <div id="filters-fields">
          <paper-input
            id="query"
            class="filter"
            type="search"
            autocomplete="off"
            value="{{queryParams.pd_ref_title}}"
            placeholder="Search"
          >
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
                selected="{{filter.selectedValue}}"
                trigger-value-change-event
                on-etools-selected-item-changed="filterValueChanged"
                data-filter-path$="[[filter.path]]"
                hide-search="[[filter.hideSearch]]"
                min-width="[[filter.minWidth]]"
                horizontal-align="left"
                no-dynamic-align
                enable-none-option
              >
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
                selected-values="{{filter.selectedValue}}"
                trigger-value-change-event
                on-etools-selected-items-changed="esmmValueChanged"
                data-filter-path$="[[filter.path]]"
                hide-search="[[filter.hideSearch]]"
                min-width="[[filter.minWidth]]"
                horizontal-align="left"
                no-dynamic-align
              >
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
              <paper-button on-tap="clearAllFilters" class="secondary-btn">CLEAR ALL</paper-button>
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

      <reports-display-list
        query-params="[[queryParams]]"
        paginator="{{paginator}}"
        wait-query-params-init
      ></reports-display-list>
    `;
  }

  @property({type: Object})
  urlParams!: GenericObject;

  @property({type: Boolean})
  active = false;

  @property({type: String, notify: true})
  csvDownloadUrl!: string;

  // filters options
  @property({type: Array})
  partners!: LabelAndValue[];

  @property({type: Array})
  cpOutputs!: CpOutput[];

  @property({type: Array})
  sections!: GenericObject[];

  @property({type: Array})
  reportStatuses!: LabelAndValue[];

  @property({type: Array})
  reportTypes!: LabelAndValue[];

  @property({type: Array})
  unicefUsersData!: MinimalUser[];

  // selected filters values
  @property({type: Object})
  queryParams: GenericObject = {
    pd_ref_title: null,
    external_partner_id: null,
    cp_output: null,
    section: null,
    status: [],
    report_type: null,
    unicef_focal_points: []
  };

  @property({type: Object})
  paginator: GenericObject = {
    page: 1,
    page_size: 10
  };

  @property({type: Boolean})
  _initComplete = false;

  @property({type: String})
  _prevFiltersChangedArgs!: string;

  private _updateFiltersValsDebouncer!: Debouncer;

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
    this.partners = [...partnersDropdownDataSelector(state)];
  }

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'reports-page'
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._initComplete = false;
  }

  _initListFilters(
    partners: any[],
    cpOutputs: any[],
    sections: any[],
    unicefUsersData: any[],
    reportStatuses: any[],
    reportTypes: any[]
  ) {
    if (
      !partners ||
      partners.length === 0 ||
      !cpOutputs ||
      !sections ||
      !unicefUsersData ||
      unicefUsersData.length === 0 ||
      !reportStatuses ||
      !reportTypes
    ) {
      return;
    }
    // init list filter options
    // IMPORTANT!!!
    // If you change filterName make sure you update it as well in _updateSelectedFiltersValues method
    // IMPORTANT!!!
    this.initListFiltersData([
      {
        filterName: 'CP Output',
        type: 'etools-dropdown-multi',
        singleSelection: true,
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: cpOutputs,
        selectedValue: null,
        path: 'queryParams.cp_output',
        selected: false,
        minWidth: '400px'
      },
      {
        filterName: 'Partner',
        type: 'etools-dropdown-multi',
        singleSelection: true,
        optionValue: 'value',
        optionLabel: 'label',
        selectionOptions: partners,
        selectedValue: null,
        path: 'queryParams.external_partner_id',
        selected: false,
        minWidth: '400px'
      },
      {
        filterName: 'Report Status',
        type: 'etools-dropdown-multi',
        singleSelection: false,
        selectionOptions: reportStatuses,
        optionValue: 'value',
        optionLabel: 'label',
        selectedValue: [],
        path: 'queryParams.status',
        selected: true,
        minWidth: '160px',
        hideSearch: true
      },
      {
        filterName: 'Report Type',
        type: 'etools-dropdown-multi',
        singleSelection: true,
        selectionOptions: reportTypes,
        optionValue: 'value',
        optionLabel: 'label',
        selectedValue: null,
        path: 'queryParams.report_type',
        selected: true,
        minWidth: '300px',
        hideSearch: true
      },
      {
        filterName: 'Section',
        type: 'etools-dropdown-multi',
        singleSelection: true,
        optionValue: 'id',
        optionLabel: 'name',
        selectionOptions: sections,
        selectedValue: null,
        path: 'queryParams.section',
        selected: false,
        minWidth: '400px',
        hideSearch: true
      },
      {
        filterName: 'UNICEF focal points',
        type: 'etools-dropdown-multi',
        singleSelection: false,
        optionValue: 'email',
        optionLabel: 'name',
        selectionOptions: unicefUsersData,
        selectedValue: [],
        path: 'queryParams.unicef_focal_points',
        selected: false,
        minWidth: '400px'
      }
    ]);
    this._updateSelectedFiltersValues();
  }

  // update selected filters(prezent in URL) at page refresh
  _updateSelectedFiltersValues() {
    this._updateFiltersValsDebouncer = Debouncer.debounce(this._updateFiltersValsDebouncer, timeOut.after(100), () => {
      const filtersValues = [
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

  _init(active: boolean) {
    if (!active) {
      return;
    }
    const urlQueryParams = this.urlParams;
    this.set('_initComplete', false);
    if (isEmptyObject(urlQueryParams)) {
      urlQueryParams.status = 'Sub|Ove|Sen';
    }

    this.setProperties({
      'queryParams.pd_ref_title': urlQueryParams.pd_ref_title ? urlQueryParams.pd_ref_title : '',
      'queryParams.external_partner_id': urlQueryParams.external_partner_id ? urlQueryParams.external_partner_id : null,
      'queryParams.cp_output': urlQueryParams.cp_output ? urlQueryParams.cp_output : null,
      'queryParams.section': urlQueryParams.section ? urlQueryParams.section : null,
      'queryParams.status': urlQueryParams.status ? urlQueryParams.status.split('|') : this.queryParams.status,
      'queryParams.unicef_focal_points': urlQueryParams.unicef_focal_points
        ? urlQueryParams.unicef_focal_points.split('|')
        : [],
      'queryParams.report_type': urlQueryParams.report_type ? urlQueryParams.report_type : null,
      'paginator.page': urlQueryParams.page ? Number(urlQueryParams.page) : 1,
      'paginator.page_size': urlQueryParams.page_size ? Number(urlQueryParams.page_size) : CONSTANTS.DEFAULT_LIST_SIZE
    });

    this._updateSelectedFiltersValues();
    this.set('_initComplete', true);
  }

  _updateURL(queryParamsData: any, pageNr: number, pageSize: number, _initComplete: boolean) {
    if (!_initComplete || !this.active) {
      return;
    }
    if (!queryParamsData || !pageNr || !pageSize) {
      return;
    }

    const qs = this._buildQueryString();
    // update URL
    updateAppState('reports/list', qs, true);
  }

  // Outputs the query string for the list
  _buildQueryString() {
    const qStrData: string[] = [];
    if (!isEmptyObject(this.queryParams)) {
      Object.keys(this.queryParams).forEach((k: any) => {
        let qStrVal;
        if (this.queryParams[k] instanceof Array && !isEmptyObject(this.queryParams[k])) {
          qStrVal = this.queryParams[k].join('|');
        } else if (['string', 'number'].indexOf(typeof this.queryParams[k]) > -1) {
          qStrVal = this.queryParams[k];
        }
        if (qStrVal) {
          qStrData.push(k + '=' + qStrVal);
        }
      });
    }
    if (!isEmptyObject(this.paginator)) {
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
   * queryParams.unicef_focal_points is updated, but to a new empty array (by etools-dropdown-multi) and this will
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

export {ReportsList as ReportsListEl};
