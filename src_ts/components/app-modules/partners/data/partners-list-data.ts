declare const moment: any;
import Dexie from "dexie";
import { PolymerElement } from "@polymer/polymer";
import { store } from "../../../../store.js";
import ListDataMixin from "../../../mixins/list-data-mixin";
import { isEmptyObject } from "../../../utils/utils";
import { setPartners } from "../../../../actions/partners.js";
import { fireEvent } from "../../../utils/fire-custom-event.js";
import { logError } from "@unicef-polymer/etools-behaviors/etools-logging.js";
import { property } from "@polymer/decorators";
import { GenericObject } from "../../../../typings/globals.types";

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin ListDataMixin
 */
class PartnersListData extends ListDataMixin(PolymerElement) {
  @property({ type: String })
  endpointName: string = "partners";

  @property({ type: String })
  dataLoadedEventName: string = "partners-loaded";

  @property({ type: Array, readOnly: true, notify: true })
  filteredPartners!: any[];

  @property({ type: Number, readOnly: true, notify: true })
  totalResults!: number;

  @property({ type: Object })
  currentQuery: GenericObject | null = null;

  @property({ type: Array, notify: true })
  partnersDropdownData: any[] = []; // TODO - seems to not be used anymore

  @property({ type: Array, notify: true })
  partnersFilteredDropdownData: any[] = []; // TODO - seems to not be used anymore

  @property({ type: Boolean })
  prepareDropdownData: boolean = false;

  public _handleMyResponse(res: any) {
    this._handleResponse(res);
    if (res && res.length) {
      store.dispatch(setPartners(res));
    }
  }

  public query(
    field: string,
    order: string,
    searchString: string,
    partnerTypes: string[],
    csoTypes: string[],
    riskRatings: string[],
    seaRiskRatings: string[],
    seaDateBefore: string,
    seaDateAfter: string,
    pageNumber: number,
    pageSize: number,
    showHidden: boolean,
    showQueryLoading: boolean
  ) {
    // If an active query transaction exists, abort it and start
    // a new one
    if (this.currentQuery) {
      this.currentQuery.abort();
    }

    const self = this;

    if (showQueryLoading) {
      fireEvent(this, "global-loading", {
        message: "Loading...",
        active: true,
        loadingSource: "partners-list",
      });
    }

    const partnersDexieTable = window.EtoolsPmpApp.DexieDb.partners;
    window.EtoolsPmpApp.DexieDb.transaction(
      "r",
      partnersDexieTable,
      function () {
        self.currentQuery = Dexie.currentTransaction;

        let queryResult = partnersDexieTable;
        if (field) {
          // note: null values don't appear in result set of sort
          queryResult = queryResult.orderBy(field);
        }
        if (order === "desc") {
          queryResult = queryResult.reverse();
        }

        queryResult = queryResult.filter(function (partner: any) {
          if (
            !isEmptyObject(partnerTypes) &&
            partnerTypes.indexOf(partner.partner_type) === -1
          ) {
            return false;
          }

          if (
            !isEmptyObject(csoTypes) &&
            csoTypes.indexOf(partner.cso_type) === -1
          ) {
            return false;
          }

          if (
            !isEmptyObject(riskRatings) &&
            riskRatings.indexOf(partner.rating) === -1
          ) {
            return false;
          }

          if (
            !isEmptyObject(seaRiskRatings) &&
            seaRiskRatings.indexOf(partner.sea_risk_rating_name) === -1
          ) {
            return false;
          }

          if (
            seaDateBefore &&
            seaDateBefore.length &&
            (!partner.psea_assessment_date ||
              !moment
                .utc(partner.psea_assessment_date)
                .isBefore(moment.utc(seaDateBefore)))
          ) {
            return false;
          }

          if (
            seaDateAfter &&
            seaDateAfter.length &&
            (!partner.psea_assessment_date ||
              !moment
                .utc(partner.psea_assessment_date)
                .isAfter(moment.utc(seaDateAfter)))
          ) {
            return false;
          }

          if (searchString && searchString.length) {
            let vnMatch = true;
            if (partner.vendor_number) {
              vnMatch =
                partner.vendor_number
                  .toString()
                  .toLowerCase()
                  .indexOf(searchString) < 0;
            }
            if (
              partner.name.toLowerCase().indexOf(searchString) < 0 &&
              partner.short_name.toLowerCase().indexOf(searchString) < 0 &&
              vnMatch
            ) {
              return false;
            }
          }

          if (!showHidden && partner.hidden) {
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
      }
    )
      .then(function (result: any[]) {
        // @ts-ignore
        self._setFilteredPartners(result);
        fireEvent(self, "global-loading", {
          active: false,
          loadingSource: "partners-list",
        });
      })
      .catch(function (error: any) {
        logError("Error querying partners!", "partners-list-data", error);
        fireEvent(self, "global-loading", {
          active: false,
          loadingSource: "partners-list",
        });
      });
  }
}

window.customElements.define("partners-list-data", PartnersListData);

export { PartnersListData as PartnersListDataEl };
