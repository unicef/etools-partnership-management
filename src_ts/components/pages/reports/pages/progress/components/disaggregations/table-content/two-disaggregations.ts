import {html, LitElement, property, customElement, PropertyValues} from 'lit-element';
import '../mixins/disaggregations';
import '../disaggregation-table-row';
import DisaggregationsMixin from '../mixins/disaggregations';
import UtilsMixin from '../../../../../../../common/mixins/utils-mixin';
import {disaggregationTableStyles} from '../styles/disaggregation-table-styles';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin DisaggregationsMixin
 */
@customElement('two-disaggregations')
export class TwoDisaggregations extends UtilsMixin(DisaggregationsMixin(LitElement)) {
  render() {
    return html`
      ${disaggregationTableStyles}

      <tr class="horizontal layout headerRow">
        <th></th>

        ${(this.columns || []).map((column: any) => html` <th>${this._capitalizeFirstLetter(column.value)}</th> `)}

        <th>Total</th>
      </tr>

      ${(this.rowsForDisplay || []).map(
        (row: any) => html`
          <disaggregation-table-row .data="${row}" .indicatorType="${this.data.display_type}" row-type="middleRow">
          </disaggregation-table-row>
        `
      )}

      <disaggregation-table-row
        .data="${this.totalsForDisplay}"
        .indicatorType="${this.data.display_type}"
        row-type="totalsRow"
      >
      </disaggregation-table-row>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Array})
  mapping!: any[];

  @property({type: Array})
  columns!: any[];

  @property({type: Array})
  rows!: any[];

  @property({type: Object})
  totalsForDisplay!: GenericObject | undefined;

  @property({type: Object})
  rowsForDisplay!: GenericObject | undefined;

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('mapping')) {
      this.columns = this._getColumns(this.mapping);
      this.rows = this._getRows(this.mapping);
    }
    if (changedProperties.has('columns') || changedProperties.has('data')) {
      this.totalsForDisplay = this._determineTotals(this.columns, this.data);
    }
    if (changedProperties.has('columns') || changedProperties.has('rows') || changedProperties.has('data')) {
      this.rowsForDisplay = this._determineRowsForDisplay(this.columns, this.rows);
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

  _determineRowsForDisplay(columns: any[], rows: any[]) {
    if (typeof columns === 'undefined' || typeof rows === 'undefined') {
      return;
    }
    return this._determineRows(this, rows, columns);
  }

  _determineTotals(columns: any[], data: any) {
    if (typeof columns === 'undefined' || typeof data === 'undefined') {
      return;
    }
    const columnData = columns.map((z) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        key: formatted,
        data: data.disaggregation[formatted]
      };
    });

    return {
      title: 'total',
      data: columnData,
      total: {
        key: '', // unused,
        data: data.disaggregation['()']
      }
    };
  }
}
