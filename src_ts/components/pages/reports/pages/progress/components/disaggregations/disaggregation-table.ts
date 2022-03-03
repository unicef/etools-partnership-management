import {html, LitElement, property, customElement, PropertyValues} from 'lit-element';
import UtilsMixin from '../../../../../../common/mixins/utils-mixin';

import './table-content/three-disaggregations';
import './table-content/two-disaggregations';
import './table-content/one-disaggregation';
import './table-content/zero-disaggregations';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {disaggregationTableStyles} from './styles/disaggregation-table-styles';
import {Disaggregation, GenericObject} from '@unicef-polymer/etools-types';

/**
 * This element is a modified PRP element to fit PMP functionality regarding disaggregation data display.
 * We do not need `disaggregation-switches` element here (for now) and there is no editable data.
 * Minimal changes were made here so we minimize the issues if we update from PRP.
 *
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
@customElement('disaggregation-table')
export class DisaggregationTable extends UtilsMixin(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
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
        ${this.viewLabel
          ? html`
           ${
             this.labels
               ? html`
                   <dl class="data-key">
                     <dt>Label -</dt>
                     ${this._equals(this.data.display_type, 'number')
                       ? html`<dd>[ ${this._withDefault(this.labels.label)} ]</dd>`
                       : html` <dd>
                           [ ${this._withDefault(this.labels.numerator_label)} ] / [
                           ${this._withDefault(this.labels.denominator_label)} ]
                         </dd>`}
                   </dl>
                 `
               : ''
           }
            </dl>
        `
          : ''}

        <table class="layout-vertical">
          ${this._equals(this.formattedMapping?.length, 0)
            ? html`
                <zero-disaggregations .data="${this.viewData}" .mapping="${this.formattedMapping}">
                </zero-disaggregations>
              `
            : ''}
          ${this._equals(this.formattedMapping?.length, 1)
            ? html`
                <one-disaggregation .data="${this.viewData}" .mapping="${this.formattedMapping}"> </one-disaggregation>
              `
            : ''}
          ${this._equals(this.formattedMapping?.length, 2)
            ? html`
                <two-disaggregations .data="${this.viewData}" .mapping="${this.formattedMapping}">
                </two-disaggregations>
              `
            : ''}
          ${this._equals(this.formattedMapping?.length, 3)
            ? html`
                <three-disaggregations .data="${this.viewData}" .mapping="${this.formattedMapping}">
                </three-disaggregations>
              `
            : ''}
        </table>
      </div>
    `;
  }

  /**
   * `editable` and `editableBool` is only kept here because disaggregation elements are common with PRP app,
   * it will always be `0` and `false` in PMP.
   */
  @property({type: Number})
  editable = 0;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  viewData!: GenericObject;

  @property({type: Object})
  formattedData!: GenericObject;

  @property({type: Array})
  formattedMapping!: any[];

  @property({type: Boolean})
  editableBool!: boolean;

  @property({type: String})
  indicatorType!: string;

  @property({type: Array})
  fields!: any[];

  @property({type: Array})
  mapping!: any[];

  @property({type: Object})
  labels!: GenericObject;

  @property({type: Boolean})
  viewLabel!: boolean;

  @property({type: Object})
  totals!: any;

  connectedCallback() {
    super.connectedCallback();
    if (!this.totals) {
      this.totals = {};
    }
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('data')) {
      this._cloneData(this.data);
      this.indicatorType = this._computeIndicatorType(this.data);
    }
    if (changedProperties.has('formattedData') || changedProperties.has('totals')) {
      this.viewData = this._computeViewData(this.formattedData, this.totals);
      if (changedProperties.has('formattedData')) {
        this._resetFields(this.formattedData.disaggregation_reported_on);
      }
    }
    if (
      changedProperties.has('editableBool') ||
      changedProperties.has('formattedData') ||
      changedProperties.has('mapping')
    ) {
      this.formattedMapping = this._computeMapping(this.editableBool, this.formattedData, this.mapping);
    }
    if (changedProperties.has('editable')) {
      this.editableBool = this._computeEditableBool(this.editable);
    }
    if (changedProperties.has('indicatorType')) {
      this.viewLabel = this._computeLabelVisibility(this.indicatorType);
    }
  }

  _resetFields(reportedOn: any) {
    if (typeof reportedOn === 'undefined') {
      return;
    }
    this.fields = [];
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
    if (typeof editableBool === 'undefined' || typeof formattedData === 'undefined' || typeof mapping === 'undefined') {
      return;
    }
    const reportedOn = formattedData.disaggregation_reported_on;

    return editableBool
      ? mapping.filter(function (disagg: Disaggregation) {
          return reportedOn.indexOf(disagg.id) !== -1;
        })
      : mapping;
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
    this.formattedData = JSON.parse(JSON.stringify(data));
    this.totals = JSON.parse(JSON.stringify(this.formattedData.disaggregation));
  }

  _computeViewData(data: any, totals: number) {
    return Object.assign({}, data, {
      disaggregation: Object.assign({}, data.disaggregation, totals)
    });
  }
}
