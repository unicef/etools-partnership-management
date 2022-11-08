import {html, LitElement, property, customElement, PropertyValues} from 'lit-element';
import '../disaggregation-table-row';
import DisaggregationsMixin from '../mixins/disaggregations';
import {disaggregationTableStyles} from '../styles/disaggregation-table-styles';
import {GenericObject} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';

/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationsMixin
 */
@customElement('one-disaggregation')
export class OneDisaggregation extends DisaggregationsMixin(LitElement) {
  render() {
    return html`
      ${disaggregationTableStyles}
      <style>
        :host {
        }
      </style>

      <tr class="horizontal layout headerRow">
        <th></th>
        <th>${translate('GENERAL.TOTAL')}</th>
      </tr>

      ${(this.rows || []).map(
        (row: any) => html`
          <disaggregation-table-row .data="${row}" .indicatorType="${this.data.display_type}" row-type="middleRow">
          </disaggregation-table-row>
        `
      )}

      <disaggregation-table-row
        .data="${this.totalRow}"
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

  @property({type: Object})
  totalRow!: GenericObject | undefined;

  @property({type: Array})
  columns!: any[];

  @property({type: Array})
  rows!: any[];

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('data')) {
      this.totalRow = this._determineTotalRow(this.data);
    }
    if (changedProperties.has('mapping')) {
      this.columns = this._getColumns(this.mapping);
    }
    if (changedProperties.has('columns') || changedProperties.has('data')) {
      this.rows = this._determineRows(this.columns, this.data);
    }
  }

  _getColumns(mapping: any) {
    if (typeof mapping === 'undefined') {
      return;
    }
    return (mapping[0] || []).choices;
  }

  _determineTotalRow(data: any) {
    if (typeof data === 'undefined') {
      return;
    }
    return {
      title: 'total',
      total: {
        key: '', // unused
        data: data.disaggregation['()']
      }
    };
  }

  _determineRows(columns: any, data: any) {
    if (typeof columns === 'undefined' || typeof data === 'undefined') {
      return;
    }
    return columns.map((z: any) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        title: z.value,
        data: [
          {
            key: formatted,
            data: data.disaggregation[formatted]
          }
        ]
      };
    });
  }
}
