import { PolymerElement, html } from '@polymer/polymer';
import UtilsMixin from '../../../../../../mixins/utils-mixin';

import './table-content/three-disaggregations';
import './table-content/two-disaggregations';
import './table-content/one-disaggregation';
import './table-content/zero-disaggregations';
import { disaggregationTableStyles } from './styles/disaggregation-table-styles';
import {Disaggregation} from '../../../../../../../typings/intervention.types';
import { property } from '@polymer/decorators';
import { GenericObject } from '../../../../../../../typings/globals.types';

/**
 * This element is a modified PRP element to fit PMP functionality regarding disaggregation data display.
 * We do not need `disaggregation-switches` element here (for now) and there is no editable data.
 * Minimal changes were made here so we minimize the issues if we update from PRP.
 *
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTable extends UtilsMixin(PolymerElement) {

  static get is() {
    return 'disaggregation-table';
  }

  static get template() {
    return html`
      ${disaggregationTableStyles}
      <style>
        .data-key {
          font-size: 12px;
          color: var(--secondary-text-color);
        }

        .data-key dt,
        .data-key dd {
          display: inline;
        }

        .data-key dd {
          margin: 0;
        }

      </style>

      <div>
        <template
        is="dom-if"
        if="[[viewLabel]]"
        restamp="true">
          <template
              is="dom-if"
              if="[[labels]]"
              restamp="true">
            <dl class="data-key">
              <dt>Label - </dt>
              <template
                  is="dom-if"
                  if="[[_equals(data.display_type, 'number')]]"
                  restamp="true">
                <dd>[ [[_withDefault(labels.label)]] ]</dd>
              </template>
              <template
                  is="dom-if"
                  if="[[!_equals(data.display_type, 'number')]]"
                  restamp="true">
                <dd>
                  [ [[_withDefault(labels.numerator_label)]] ]
                  /
                  [ [[_withDefault(labels.denominator_label)]] ]
                </dd>
              </template>
            </template>
          </dl>
        </template>

        <table class="vertical layout">
          <template
              is="dom-if"
              if="[[_equals(formattedMapping.length, 0)]]"
              restamp="true">
            <zero-disaggregations
                data="[[viewData]]"
                mapping="[[formattedMapping]]">
            </zero-disaggregations>
          </template>

          <template
              is="dom-if"
              if="[[_equals(formattedMapping.length, 1)]]"
              restamp="true">
            <one-disaggregation
                data="[[viewData]]"
                mapping="[[formattedMapping]]">
            </one-disaggregation>
          </template>

          <template
              is="dom-if"
              if="[[_equals(formattedMapping.length, 2)]]"
              restamp="true">
            <two-disaggregations
                data="[[viewData]]"
                mapping="[[formattedMapping]]">
            </two-disaggregations>
          </template>

          <template
              is="dom-if"
              if="[[_equals(formattedMapping.length, 3)]]"
              restamp="true">
            <three-disaggregations
                data="[[viewData]]"
                mapping="[[formattedMapping]]">
            </three-disaggregations>
          </template>
        </table>
      </div>
    `;
  }

   /**
   * `editable` and `editableBool` is only kept here because disaggregation elements are common with PRP app,
   * it will always be `0` and `false` in PMP.
   */ 
  @property({type: Number})
  editable: number = 0;

  @property({type: Object, observer: '_cloneData'})
  data!: GenericObject;

  @property({type: Object, computed: '_computeViewData(formattedData, totals)'})
  viewData!: GenericObject;

  @property({type: Object})
  formattedData!: GenericObject;

  @property({type: Array, computed: '_computeMapping(editableBool, formattedData, mapping)'})
  formattedMapping!: any[];

  @property({type: Boolean, computed: '_computeEditableBool(editable)'})
  editableBool!: boolean;

  @property({type: String, computed: '_computeIndicatorType(data)'})
  indicatorType!: string;

  @property({type: Array})
  fields!: any[];

  @property({type: Array})
  mapping!: any[];

  @property({type: Object})
  labels!: GenericObject;

  @property({type: Boolean, computed: '_computeLabelVisibility(indicatorType)'})
  viewLabel!: boolean;

  @property({type: Object})
  totals!: GenericObject;

  static get observers() {
    return [
      '_resetFields(formattedData.disaggregation_reported_on)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    if (!this.totals) {
      this.set('totals', {});
    }
  }

  _resetFields(reportedOn: any) {
    if (typeof reportedOn === 'undefined') {
      return;
    }
    this.set('fields', []);
  }

  _computeLabelVisibility(indicatorType: string) {
    if (String(indicatorType) === 'number') {
      return false;
    } else {
      return true;
    }
  }

  _computeEditableBool(editable: number) {
    return editable === 1;
  }

  _computeMapping(editableBool: boolean, formattedData: any, mapping: any) {
    if (typeof editableBool === 'undefined' ||
        typeof formattedData === 'undefined' ||
        typeof mapping === 'undefined') {
      return;
    }
    let reportedOn = formattedData.disaggregation_reported_on;

    return editableBool ? mapping.filter(function(disagg: Disaggregation) {
      return reportedOn.indexOf(disagg.id) !== -1;
    }) : mapping;
  }

  _computeIndicatorType(data: any) {
    if (typeof data === 'undefined') {
      return;
    }
    return data.display_type;
  }

  _cloneData(data: any) {
    if (typeof data === 'undefined') {
      return;
    }
    this.set('formattedData', JSON.parse(JSON.stringify(data)));
    this.set('totals', JSON.parse(JSON.stringify(this.formattedData.disaggregation)));
  }

  _computeViewData(data: any, totals: number) {
    return Object.assign({}, data, {
      disaggregation: Object.assign({}, data.disaggregation, totals)
    });
  }

}

window.customElements.define(DisaggregationTable.is, DisaggregationTable);
