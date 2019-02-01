import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import moment from 'moment';
import EventHelperMixin from '../../../mixins/event-helper-mixin';
import ListDataMixin from '../../../mixins/list-data-mixin';
import { PolymerElement } from '@polymer/polymer';


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

  _filterFound(intervention, prop, multiple, filterValues) {
    if (!filterValues.length) {
      return true;
    }

    let foundValues;
    if (multiple) {
      // case for intervention properties values like: offices, sections, cp outputs (array of values)
      foundValues = intervention[prop].filter(function(propVal) {
        return filterValues.indexOf(String(propVal)) > -1;
      });
      return foundValues && foundValues.length > 0;
    } else {
      // case for intervention properties values like: status, doc type (primitive types)
      foundValues = filterValues.filter(function(selectedFilter) {
        return String(selectedFilter) === String(intervention[prop]);
      });
      return !!foundValues[0];
    }
  }

  query(field, order, searchString, documentTypes, cpOutputs, donors, grants,
        statuses, sections, unicefFocalPoints, offices, cpStructures, startDate,
        endDate, pageNumber, pageSize, showQueryLoading) {

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

      queryResult = queryResult.filter(function(intervention) {

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

        if (searchString && searchString.length &&
            intervention.title.toLowerCase().indexOf(searchString) < 0 &&
            intervention.partner_name.toLowerCase().indexOf(searchString) < 0 &&
            intervention.number.toLowerCase().indexOf(searchString) < 0) {
          return false;
        }

        return true;
      });

      // This special Dexie function allows the work of counting
      // the number of query results to be done in a parallel process,
      // instead of blocking the main query
      Dexie.ignoreTransaction(function() {
        queryResult.count(function(count) {
          self._setTotalResults(count);
        });
      });

      return queryResult
          .offset((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .toArray();

    }).then(function(result) {
      self._setFilteredInterventions(result);
      self.fireEvent('global-loading', {active: false, loadingSource: 'pd-ssfa-list'});
    }).catch(function(error) {
      self.logError('Error querying interventions: ' + error, 'interventions-list-data');
      self.fireEvent('global-loading', {active: false, loadingSource: 'pd-ssfa-list'});
    });
  }

}

window.customElements.define('interventions-list-data', InterventionsListData);
