declare const dayjs: any;
import Dexie from 'dexie';
import ListDataMixin from '../../../mixins/list-data-mixin';
import {PolymerElement} from '@polymer/polymer';
import {fireEvent} from '../../../utils/fire-custom-event';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {property, customElement} from '@polymer/decorators';
import {GenericObject, ListItemIntervention} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin ListDataMixin
 */
@customElement('interventions-list-data')
class InterventionsListData extends ListDataMixin(PolymerElement) {
  @property({type: String})
  endpointName = 'interventions';

  @property({type: String})
  dataLoadedEventName = 'interventions-loaded';

  @property({type: Array, readOnly: true, notify: true})
  filteredInterventions!: [];

  @property({type: Number, readOnly: true, notify: true})
  totalResults!: number;

  @property({type: Object})
  currentQuery: GenericObject | null = null;

  _filterFound(intervention: ListItemIntervention, prop: string, multiple: boolean, filterValues: any) {
    if (!filterValues.length) {
      return true;
    }

    let foundValues;
    if (multiple) {
      filterValues = filterValues.map((f: any) => String(f));

      // case for intervention properties values like: offices, sections, cp outputs (array of values)
      foundValues = intervention[prop].filter(function (propVal: any) {
        return filterValues.indexOf(String(propVal)) > -1;
      });
      return foundValues && foundValues.length > 0;
    } else {
      // case for intervention properties values like: status, doc type (primitive types)
      foundValues = filterValues.filter(function (selectedFilter: any) {
        return String(selectedFilter) === String(intervention[prop]);
      });
      return !!foundValues[0];
    }
  }

  query(
    field: string,
    order: string,
    searchString: string,
    documentTypes: string[],
    cpOutputs: string[],
    donors: string[],
    partners: string[],
    grants: string[],
    statuses: string[],
    sections: string[],
    unicefFocalPoints: string[],
    offices: string[],
    cpStructures: string[],
    contingency_pd: boolean,
    startDate: string,
    endDate: string,
    endAfter: string,
    pageNumber: number,
    pageSize: number,
    showQueryLoading: boolean
  ) {
    // If an active query transaction exists, abort it and start
    // a new one
    if (this.currentQuery) {
      this.currentQuery.abort();
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;

    if (showQueryLoading) {
      fireEvent(this, 'global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: 'pd-ssfa-list'
      });
    }

    const interventionsDexieTable = window.EtoolsPmpApp.DexieDb.interventions;
    window.EtoolsPmpApp.DexieDb.transaction('r', interventionsDexieTable, function () {
      self.currentQuery = Dexie.currentTransaction;

      let queryResult = interventionsDexieTable;
      if (field) {
        // note: null values don't appear in result set of sort
        queryResult = queryResult.orderBy(field);
      }
      if (order === 'desc') {
        queryResult = queryResult.reverse();
      }

      queryResult = queryResult.filter(function (intervention: ListItemIntervention) {
        if (
          !self._filterFound(intervention, 'status', false, statuses) ||
          !self._filterFound(intervention, 'document_type', false, documentTypes) ||
          !self._filterFound(intervention, 'sections', true, sections) ||
          !self._filterFound(intervention, 'offices', true, offices) ||
          !self._filterFound(intervention, 'unicef_focal_points', true, unicefFocalPoints) ||
          !self._filterFound(intervention, 'cp_outputs', true, cpOutputs) ||
          !self._filterFound(intervention, 'donors', true, donors) ||
          !self._filterFound(intervention, 'partner_name', false, partners) ||
          !self._filterFound(intervention, 'grants', true, grants) ||
          !self._filterFound(intervention, 'country_programmes', true, cpStructures)
        ) {
          return false;
        }

        if (contingency_pd && !intervention.contingency_pd) {
          return false;
        }

        if (
          startDate &&
          startDate.length &&
          (!intervention.start || !dayjs.utc(intervention.start).isAfter(dayjs.utc(startDate)))
        ) {
          return false;
        }

        if (
          endDate &&
          endDate.length &&
          (!intervention.end || !dayjs.utc(intervention.end).isBefore(dayjs.utc(endDate)))
        ) {
          return false;
        }

        if (
          endAfter &&
          endAfter.length &&
          (!intervention.end || !dayjs.utc(intervention.end).isSameOrAfter(dayjs.utc(endAfter)))
        ) {
          return false;
        }

        if (
          searchString &&
          searchString.length &&
          intervention.title!.toLowerCase().indexOf(searchString) < 0 &&
          intervention.partner_name!.toLowerCase().indexOf(searchString) < 0 &&
          intervention.number!.toLowerCase().indexOf(searchString) < 0 &&
          intervention.cfei_number!.toLowerCase().indexOf(searchString) < 0
        ) {
          return false;
        }

        return true;
      });

      // This special Dexie function allows the work of counting
      // the number of query results to be done in a parallel process,
      // instead of blocking the main query
      Dexie.ignoreTransaction(function () {
        queryResult.count(function (count: number) {
          // @ts-ignore
          self._setTotalResults(count);
        });
      });

      return queryResult
        .offset((pageNumber - 1) * pageSize)
        .limit(pageSize)
        .toArray();
    })
      .then(function (result: any) {
        // @ts-ignore
        self._setFilteredInterventions(result);
        fireEvent(self, 'global-loading', {
          active: false,
          loadingSource: 'pd-ssfa-list'
        });
      })
      .catch(function (error: any) {
        logError('Error querying interventions: ' + error, 'interventions-list-data');
        fireEvent(self, 'global-loading', {
          active: false,
          loadingSource: 'pd-ssfa-list'
        });
      });
  }
}

export {InterventionsListData};
