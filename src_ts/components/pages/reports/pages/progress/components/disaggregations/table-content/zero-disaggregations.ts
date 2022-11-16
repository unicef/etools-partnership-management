import {html, LitElement, property, customElement, PropertyValues} from 'lit-element';
import {disaggregationTableStyles} from '../styles/disaggregation-table-styles';
import '../disaggregation-table-row';
import {GenericObject} from '@unicef-polymer/etools-types';
import {get as getTranslation} from 'lit-translate';

/**
 * @polymer
 * @customElement
 */
@customElement('zero-disaggregations')
export class ZeroDisaggregations extends LitElement {
  render() {
    return html`
      ${disaggregationTableStyles}

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

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('mapping') || changedProperties.has('data')) {
      this.totalRow = this._determineTotalRow(this.mapping, this.data);
    }
  }

  _determineTotalRow(_: any, data: GenericObject) {
    if (typeof data === 'undefined') {
      return;
    }
    return {
      title: getTranslation('GENERAL.TOTAL'),
      total: {
        key: '()',
        data: data.disaggregation['()']
      }
    };
  }
}
