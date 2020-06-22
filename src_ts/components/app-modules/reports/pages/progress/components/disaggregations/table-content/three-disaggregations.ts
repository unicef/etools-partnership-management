import "../disaggregation-table-row.js";
import { PolymerElement, html } from "@polymer/polymer";
import UtilsMixin from "../../../../../../../mixins/utils-mixin";
import DisaggregationsMixin from "../mixins/disaggregations";
import { disaggregationTableStyles } from "../styles/disaggregation-table-styles";
import { property } from "@polymer/decorators";
import { GenericObject } from "../../../../../../../../typings/globals.types.js";

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin DisaggregationsMixin
 */
class ThreeDisaggregations extends UtilsMixin(
  DisaggregationsMixin(PolymerElement)
) {
  static get is() {
    return "three-disaggregations";
  }

  static get template() {
    return html`
      ${disaggregationTableStyles}
      <!-- Column names -->
      <tr class="horizontal layout headerRow">
        <th></th>
        <template is="dom-repeat" items="[[columns]]" as="column">
          <th>[[_capitalizeFirstLetter(column.value)]]</th>
        </template>
        <th>Total</th>
      </tr>

      <!-- Data rows: outer and middle. -->
      <template is="dom-repeat" items="[[outerRowsForDisplay]]" as="outerRow">
        <disaggregation-table-row
          data="[[outerRow]]"
          indicator-type="[[data.display_type]]"
          row-type="outerRow"
        >
        </disaggregation-table-row>

        <template
          is="dom-repeat"
          items="[[_determineMiddleRows(outerRow.id, columns, middleRows, data)]]"
          as="middleRow"
        >
          <disaggregation-table-row
            data="[[middleRow]]"
            indicator-type="[[data.display_type]]"
            row-type="middleRow"
          >
          </disaggregation-table-row>
        </template>
      </template>

      <!-- Totals row -->
      <disaggregation-table-row
        data="[[columnTotalRow]]"
        indicator-type="[[data.display_type]]"
        row-type="totalsRow"
      >
      </disaggregation-table-row>

      <!-- Bottom table -->
      <template is="dom-repeat" items="[[bottomRows]]" as="bottomRow">
        <disaggregation-table-row
          data="[[bottomRow]]"
          indicator-type="[[data.display_type]]"
          row-type="bottomRow"
        >
        </disaggregation-table-row>
      </template>
    `;
  }

  @property({ type: Object })
  data!: GenericObject;

  @property({ type: Array })
  mapping!: any[];

  @property({ type: Object })
  columnTotalRow!: GenericObject;

  @property({ type: Array, computed: "_getColumns(mapping)" })
  columns!: any[];

  @property({ type: Array, computed: "_getRows(mapping)" })
  rows!: any[];

  @property({ type: Array })
  bottomRows!: any[];

  @property({ type: Array, computed: "_getMiddleRows(mapping)" })
  middleRows!: any[];

  @property({
    type: Array,
    computed: "_determineOuterRows(columns, rows, data)",
  })
  outerRowsForDisplay!: any[];

  static get observers() {
    return ["_determineTotals(columns, middleRows, data)"];
  }

  _getColumns(mapping: any) {
    if (typeof mapping === "undefined") {
      return;
    }
    return (mapping[0] || []).choices;
  }

  _getRows(mapping: any) {
    if (typeof mapping === "undefined") {
      return;
    }
    return (mapping[1] || []).choices;
  }

  _getMiddleRows(mapping: any) {
    if (!mapping) {
      return;
    }
    return (mapping[2] || []).choices;
  }

  _determineOuterRows(columns: any[], rows: any[]) {
    if (typeof columns === "undefined" || typeof rows === "undefined") {
      return;
    }
    return this._determineRows(this, rows, columns);
  }

  _determineMiddleRows(
    outerRowID: any,
    columns: any[],
    middleRows: any[],
    data: any
  ) {
    if (!columns || !middleRows) {
      return [];
    }

    return middleRows.map((y: any) => {
      let formatted;

      const columnData = columns.map((z: any) => {
        formatted = this._formatDisaggregationIds([outerRowID, y.id, z.id]);

        return {
          key: formatted,
          data: data.disaggregation[formatted],
        };
      });

      formatted = this._formatDisaggregationIds([outerRowID, y.id]);

      return {
        title: y.value,
        data: columnData,
        id: y.id,
        total: {
          key: formatted,
          data: data.disaggregation[formatted],
        },
      };
    });
  }

  _determineTotals(columns: any[], middleRows: any[], data: any) {
    if (
      typeof columns === "undefined" ||
      typeof middleRows === "undefined" ||
      typeof data === "undefined"
    ) {
      return;
    }
    const columnData = columns.map((z: any) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        key: formatted,
        data: data.disaggregation[formatted],
      };
    });

    const columnTotalRow = {
      title: "total",
      data: columnData,
      total: {
        key: "", // unused
        data: data.disaggregation["()"],
      },
    };

    this.set("columnTotalRow", columnTotalRow);
    this.set("bottomRows", this._determineRows(this, middleRows, columns));
  }
}

window.customElements.define(ThreeDisaggregations.is, ThreeDisaggregations);
