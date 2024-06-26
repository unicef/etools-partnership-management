import Dexie from 'dexie';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {GenericObject, ListItemIntervention} from '@unicef-polymer/etools-types';
import {LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import ListDataMixinLit from '../../../common/mixins/list-data-mixin-lit';
import dayjs from 'dayjs';
import dayJsUtc from 'dayjs/plugin/utc';
import dayJisSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(dayJsUtc);
dayjs.extend(dayJisSameOrAfter);
/**
 * @LitElement
 * @customElement
 * @appliesMixin ListDataMixin
 */
@customElement('interventions-list-data')
export class InterventionsListData extends ListDataMixinLit(LitElement) {
  @property({type: String})
  endpointName = 'interventions';

  @property({type: String})
  dataLoadedEventName = 'interventions-loaded';

  @property({type: Array})
  filteredInterventions!: [];

  @property({type: Number})
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

  async query(
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
    budgetOwners: string[],
    offices: string[],
    cpStructures: string[],
    contingency_pd: boolean,
    editable_by: string,
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
      fireEvent(this, 'list-loading', {
        active: true
      });
    }
    // WARN: Fix for .orderBy excluding items with null values in 'field' property
    // if (field) {
    //   await window.EtoolsPmpApp.DexieDb.interventions
    //     .filter(function (i: any) {
    //       if (i[field] == null) {
    //         console.log(`field is null ${field}`, i);
    //       }
    //       return i[field] == null;
    //     })
    //     .modify({[field]: ''});
    // }

    this.waitForListDataRequestToFinish().then(() => {
      const interventionsDexieTable = window.EtoolsPmpApp.DexieDb.interventions;
      // WARN: Fix for .orderBy excluding items with null values in 'field' property
      this._updateNullField(field);

      window.EtoolsPmpApp.DexieDb.transaction('r', interventionsDexieTable, function () {
        self.currentQuery = Dexie.currentTransaction;

        let queryResult = interventionsDexieTable;
        if (field) {
          // BUG: null values don't appear in result set of sort
          queryResult = queryResult.orderBy(field);
        }
        if (order === 'desc') {
          queryResult = queryResult.reverse();
        }

        queryResult = queryResult.filter(function (intervention: ListItemIntervention) {
          if (!intervention) {
            return;
          }

          if (
            !self._filterFound(intervention, 'status', false, statuses) ||
            !self._filterFound(intervention, 'document_type', false, documentTypes) ||
            !self._filterFound(intervention, 'sections', true, sections) ||
            !self._filterFound(intervention, 'offices', true, offices) ||
            !self._filterFound(intervention, 'unicef_focal_points', true, unicefFocalPoints) ||
            !self._filterFound(intervention, 'budget_owner', false, budgetOwners) ||
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

          if (editable_by) {
            if (editable_by === 'unicef' && !intervention.unicef_court) {
              return false;
            }
            if (editable_by === 'partner' && (intervention.unicef_court || !intervention.date_sent_to_partner)) {
              return false;
            }
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
            (intervention.title || '').toLowerCase().indexOf(searchString) < 0 &&
            (intervention.partner_name || '').toLowerCase().indexOf(searchString) < 0 &&
            (intervention.number || '').toLowerCase().indexOf(searchString) < 0 &&
            (intervention.cfei_number || '').toLowerCase().indexOf(searchString) < 0
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
            self.totalResults = count;
            fireEvent(self, 'total-results-changed', count);
          });
        });

        return queryResult
          .offset((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .toArray();
      })
        .then(function (result: any) {
          // @ts-ignore
          self.filteredInterventions = result;
          fireEvent(self, 'filtered-interventions-changed', result);
          fireEvent(self, 'list-loading', {
            active: false
          });
        })
        .catch(function (error: any) {
          if (error.name === 'DatabaseClosedError') {
            window.location.reload();
          }
          EtoolsLogger.error('Error querying interventions: ' + error, 'interventions-list-data');
          fireEvent(self, 'list-loading', {
            active: false
          });
        });
    });
  }

  public waitForListDataRequestToFinish() {
    return new Promise((resolve) => {
      const interv = setInterval(() => {
        if (this.listDataIsLoaded) {
          clearInterval(interv);
          resolve(true);
        }
      }, 50);
    });
  }

  private _updateNullField(field: string) {
    if (field) {
      window.EtoolsPmpApp.DexieDb.interventions
        .filter(function (i: any) {
          return i[field] == null;
        })
        .modify({[field]: ''});
    }
  }
}
