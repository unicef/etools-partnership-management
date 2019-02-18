// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import moment from 'moment';
import EventHelperMixin from '../../../mixins/event-helper-mixin';
import ListDataMixin from '../../../mixins/list-data-mixin';
import { PolymerElement } from '@polymer/polymer';
import { ListItemIntervention } from '../../../../typings/intervention.types';
import Dexie from 'dexie';


/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin EventHelperMixin
 * @appliesMixin ListDataMixin
 */
class InterventionsListData extends EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  EventHelperMixin,
  ListDataMixin
], PolymerElement) {

  static get properties() {
    return {
      endpointName: {
        type: String,
        value: 'interventions'
      },

      dataLoadedEventName: {
        type: String,
        value: 'interventions-loaded'
      },

      filteredInterventions: {
        type: Array,
        readOnly: true,
        notify: true
      },

      totalResults: {
        type: Number,
        readOnly: true,
        notify: true
      },

      currentQuery: {
        type: Object,
        value: null
      }
    };
  }

  public endpointName: string = 'interventions';

  _filterFound(intervention: ListItemIntervention, prop: string,
     multiple: boolean, filterValues: any) {
    if (!filterValues.length) {
      return true;
    }

    let foundValues;
    if (multiple) {
      // case for intervention properties values like: offices, sections, cp outputs (array of values)
      foundValues = intervention[prop].filter(function(propVal: any) {
        return filterValues.indexOf(String(propVal)) > -1;
      });
      return foundValues && foundValues.length > 0;
    } else {
      // case for intervention properties values like: status, doc type (primitive types)
      foundValues = filterValues.filter(function(selectedFilter: any) {
        return String(selectedFilter) === String(intervention[prop]);
      });
      return !!foundValues[0];
    }
  }

  query(field: string, order: string, searchString: string, documentTypes: string[],
        cpOutputs: string[], donors: string[], grants: string[],
        statuses: string[], sections: string[], unicefFocalPoints: string[],
        offices: string[], cpStructures: string[], startDate: string,
        endDate: string, endAfter: string, pageNumber: number, pageSize: number, showQueryLoading: boolean) {

    // If an active query transaction exists, abort it and start
    // a new one
    if (this.currentQuery) {
      this.currentQuery.abort();
    }

    let self = this;

    if (showQueryLoading) {
      this.fireEvent('global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: 'pd-ssfa-list'
      });
    }

    let interventionsDexieTable = window.EtoolsPmpApp.DexieDb.interventions;
    window.EtoolsPmpApp.DexieDb.transaction('r', interventionsDexieTable, function() {
      self.currentQuery = Dexie.currentTransaction;

      let queryResult = interventionsDexieTable;
      if (field) {
        // note: null values don't appear in result set of sort
        queryResult = queryResult.orderBy(field);
      }
      if (order === 'desc') {
        queryResult = queryResult.reverse();
      }

      queryResult = queryResult.filter(function(intervention: ListItemIntervention) {

        if (!self._filterFound(intervention, 'status', false, statuses) ||
            !self._filterFound(intervention, 'document_type', false, documentTypes) ||
            !self._filterFound(intervention, 'sections', true, sections) ||
            !self._filterFound(intervention, 'offices', true, offices) ||
            !self._filterFound(intervention, 'unicef_focal_points', true, unicefFocalPoints) ||
            !self._filterFound(intervention, 'cp_outputs', true, cpOutputs) ||
            !self._filterFound(intervention, 'donors', true, donors) ||
            !self._filterFound(intervention, 'grants', true, grants) ||
            !self._filterFound(intervention, 'country_programme', false, cpStructures)) {
          return false;
        }

        if (startDate && startDate.length &&
            (!intervention.start || !moment.utc(intervention.start).isAfter(moment.utc(startDate)))) {
          return false;
        }

        if (endDate && endDate.length &&
            (!intervention.end || !moment.utc(intervention.end).isBefore(moment.utc(endDate)))) {
          return false;
        }

        if (endAfter && endAfter.length &&
            (!intervention.end || !moment.utc(intervention.end).isSameOrAfter(moment.utc(endAfter)))) {
          return false;
        }

        if (searchString && searchString.length &&
            intervention.title!.toLowerCase().indexOf(searchString) < 0 &&
            intervention.partner_name!.toLowerCase().indexOf(searchString) < 0 &&
            intervention.number!.toLowerCase().indexOf(searchString) < 0) {
          return false;
        }

        return true;
      });

      // This special Dexie function allows the work of counting
      // the number of query results to be done in a parallel process,
      // instead of blocking the main query
      Dexie.ignoreTransaction(function() {
        queryResult.count(function(count: number) {
          self._setTotalResults(count);
        });
      });

      return queryResult
          .offset((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .toArray();

    }).then(function(result: any) {
      self._setFilteredInterventions(result);
      self.fireEvent('global-loading', {active: false, loadingSource: 'pd-ssfa-list'});
    }).catch(function(error: any) {
      self.logError('Error querying interventions: ' + error, 'interventions-list-data');
      self.fireEvent('global-loading', {active: false, loadingSource: 'pd-ssfa-list'});
    });
  }

}

window.customElements.define('interventions-list-data', InterventionsListData);
