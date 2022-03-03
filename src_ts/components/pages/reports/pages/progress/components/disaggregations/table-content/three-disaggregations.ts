import {html, LitElement, property, customElement, PropertyValues} from 'lit-element';
import '../disaggregation-table-row.js';
import UtilsMixin from '../../../../../../../common/mixins/utils-mixin';
import DisaggregationsMixin from '../mixins/disaggregations';
import {disaggregationTableStyles} from '../styles/disaggregation-table-styles';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin DisaggregationsMixin
 */
@customElement('three-disaggregations')
export class ThreeDisaggregations extends UtilsMixin(DisaggregationsMixin(LitElement)) {
  render() {
    return html`
      ${disaggregationTableStyles}
      <!-- Column names -->
      <tr class="horizontal layout headerRow">
        <th></th>
        ${(this.columns || []).map((column: any) => html`<th>${this._capitalizeFirstLetter(column.value)}</th> `)}
        <th>Total</th>
      </tr>

      <!-- Data rows: outer and middle. -->
      ${(this.outerRowsForDisplay || []).map(
        (outerRow: any) => html`
          <disaggregation-table-row .data="${outerRow}" .indicatorType="${this.data.display_type}" row-type="outerRow">
          </disaggregation-table-row>

          ${(this._determineMiddleRows(outerRow.id, this.columns, this.middleRows, this.data) || []).map(
            (middleRow: any) => html`
              <disaggregation-table-row
                .data="${middleRow}"
                .indicatorType="${this.data.display_type}"
                row-type="middleRow"
              >
              </disaggregation-table-row>
            `
          )}
        `
      )}

      <!-- Totals row -->
      <disaggregation-table-row
        .data="${this.columnTotalRow}"
        .indicatorType="${this.data.display_type}"
        row-type="totalsRow"
      >
      </disaggregation-table-row>

      <!-- Bottom table -->
      ${(this.bottomRows || []).map(
        (bottomRow: any) => html`
          <disaggregation-table-row
            .data="${bottomRow}"
            .indicatorType="${this.data.display_type}"
            row-type="bottomRow"
          >
          </disaggregation-table-row>
        `
      )}
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Array})
  mapping!: any[];

  @property({type: Object})
  columnTotalRow!: GenericObject;

  @property({type: Array})
  columns!: any[];

  @property({type: Array})
  rows!: any[];

  @property({type: Array})
  bottomRows!: any[];

  @property({type: Array})
  middleRows!: any[];

  @property({type: Array})
  outerRowsForDisplay!: any[] | undefined;

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('mapping')) {
      this.columns = this._getColumns(this.mapping);
      this.rows = this._getRows(this.mapping);
      this.middleRows = this._getMiddleRows(this.mapping);
    }

    if (changedProperties.has('columns') || changedProperties.has('rows') || changedProperties.has('data')) {
      this.outerRowsForDisplay = this._determineOuterRows(this.columns, this.rows);
    }

    if (changedProperties.has('columns') || changedProperties.has('middleRows') || changedProperties.has('data')) {
      this._determineTotals(this.columns, this.middleRows, this.data);
    }
  }

  _getColumns(mapping: any) {
    if (typeof mapping === 'undefined') {
      return;
    }
    return (mapping[0] || []).choices;
  }

  _getRows(mapping: any) {
    if (typeof mapping === 'undefined') {
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
    if (typeof columns === 'undefined' || typeof rows === 'undefined') {
      return;
    }
    return this._determineRows(this, rows, columns);
  }

  _determineMiddleRows(outerRowID: any, columns: any[], middleRows: any[], data: any) {
    if (!columns || !middleRows) {
      return [];
    }

    return middleRows.map((y: any) => {
      let formatted;

      const columnData = columns.map((z: any) => {
        formatted = this._formatDisaggregationIds([outerRowID, y.id, z.id]);

        return {
          key: formatted,
          data: data.disaggregation[formatted]
        };
      });

      formatted = this._formatDisaggregationIds([outerRowID, y.id]);

      return {
        title: y.value,
        data: columnData,
        id: y.id,
        total: {
          key: formatted,
          data: data.disaggregation[formatted]
        }
      };
    });
  }

  _determineTotals(columns: any[], middleRows: any[], data: any) {
    if (typeof columns === 'undefined' || typeof middleRows === 'undefined' || typeof data === 'undefined') {
      return;
    }
    const columnData = columns.map((z: any) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        key: formatted,
        data: data.disaggregation[formatted]
      };
    });

    const columnTotalRow = {
      title: 'total',
      data: columnData,
      total: {
        key: '', // unused
        data: data.disaggregation['()']
      }
    };

    this.columnTotalRow = columnTotalRow;
    this.bottomRows = this._determineRows(this, middleRows, columns);
  }
}
