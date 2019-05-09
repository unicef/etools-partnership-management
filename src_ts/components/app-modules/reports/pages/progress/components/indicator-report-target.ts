import '@polymer/iron-flex-layout/iron-flex-layout.js';
import UtilsMixin from '../../../../../mixins/utils-mixin.js';
import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../../../typings/globals.types.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin Utils
 */
class IndicatorReportTarget extends UtilsMixin(PolymerElement) {

  static get is() {
    return 'indicator-report-target';
  }

  static get template() {
    return html`
      <style>
        :host {
          font-size: 12px;
        }

        .target-row {
          @apply --layout-horizontal;
          @apply --layout-end-justified;
          color: var(--secondary-text-color);
          width: 100%;
          text-align: right;
          box-sizing: border-box;
          @apply --indicator-report-target-row;
        }

        .target-row span:last-child {
          display: inline-block;
          width: 70px;
          margin-left: 8px;
          @apply --indicator-report-row-value;
        }

        :host([bold]) .target-row {
          font-weight: 500;
        }

        :host([bold]) .target-row span:last-child {
          font-weight: bold;
        }

        @media print {
          :host(.print-inline) .target-row {
            display: inline;
            width: auto;
            text-align: left;
            padding-right: 0;
            margin-right: 16px;
          }

          :host(.print-inline) .target-row:last-child {
            margin-right: 0;
          }

          :host(.print-inline) .target-row span:last-child {
            display: initial;
            width: auto;
            margin-left: 8px;
            overflow: visible;
            text-overflow: unset;
          }
        }
      </style>

      <div class="target-row">
        <span>Target:</span>
        <span title$="[[_getTargetValue(displayType, target)]]">
          [[_getTargetValue(displayType, target)]]
        </span>
      </div>
      <div class="target-row">
        <span>Total cumulative progress:</span>
        <span title$="[[_getCumulativeProgress(displayType, cumulativeProgress)]]">[[_getCumulativeProgress(displayType, cumulativeProgress)]]</span>
      </div>
      <div class="target-row">
        <span>Achievement in reporting period:</span>
        <span title$="[[_getAchievement(displayType, achievement)]]">[[_getAchievement(displayType, achievement)]]</span>
      </div>
    `;
  }

  @property({type: Object})
  target!: GenericObject;

  @property({type: String})
  cumulativeProgress: string = '-';

  @property({type: String})
  achievement: string = '-';

  @property({type: Boolean, reflectToAttribute: true})
  bold: boolean = false;

  @property({type: String})
  displayType: string = 'number';

  _getTargetValue(displayType: string, target: any) {
    switch (displayType) {
      case 'number':
        return this._formatNumber(target.v, '-', 0, '\,');
      case 'ratio':
        return target.v + '/' + target.d;
      case 'percentage':
        return target.v + '%';
    }
    return '-';
  }

  _getCumulativeProgress(displayType: string, cumulativeVal: string) {
    return this._formatIndicatorValue(displayType, cumulativeVal, false);
  }

  _getAchievement(displayType: string, achievedVal: string) {
    return this._formatIndicatorValue(displayType, achievedVal, false);
  }

}

window.customElements.define(IndicatorReportTarget.is, IndicatorReportTarget);
