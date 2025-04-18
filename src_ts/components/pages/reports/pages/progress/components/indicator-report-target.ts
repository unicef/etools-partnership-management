import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import UtilsMixin from '../../../../../common/mixins/utils-mixin.js';
import {GenericObject} from '@unicef-polymer/etools-types';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';

/**
 * @LitElement
 * @customElement
 * @appliesMixin UtilsMixin
 */
@customElement('indicator-report-target2')
export class IndicatorReportTarget extends UtilsMixin(LitElement) {
  render() {
    return html`
      <style>
        :host {
          font-size: var(--etools-font-size-12, 12px);
        }

        .target-row {
          display: flex;
          flex-direction: row;
          justify-content: flex-end;
          color: var(--secondary-text-color);
          width: 100%;
          text-align: right;
          box-sizing: border-box;
        }

        .target-row span:last-child {
          display: inline-block;
          width: 70px;
          margin-inline-start: 8px;
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
            padding-inline-end: 0;
            margin-inline-end: 16px;
          }

          :host(.print-inline) .target-row:last-child {
            margin-inline-end: 0;
          }

          :host(.print-inline) .target-row span:last-child {
            display: initial;
            width: auto;
            margin-inline-start: 8px;
            overflow: visible;
            text-overflow: unset;
          }
        }
      </style>

      <div class="target-row">
        <span>${translate('TARGET')}:</span>
        <span title="${this._getTargetValue(this.displayType, this.target)}">
          ${this._getTargetValue(this.displayType, this.target)}
        </span>
      </div>
      <div class="target-row">
        <span>${translate('TOTAL_CUMULATIVE_PROGRESS')}:</span>
        <span title="${this._getCumulativeProgress(this.displayType, this.cumulativeProgress)}">
          ${this._getCumulativeProgress(this.displayType, this.cumulativeProgress)}
        </span>
      </div>
      <div class="target-row">
        <span>${translate('ACHIEVEMENT_IN_REPORTING_PERIOD')}:</span>
        <span title="${this._getAchievement(this.displayType, this.achievement)}"
          >${this._getAchievement(this.displayType, this.achievement)}</span
        >
      </div>
    `;
  }

  @property({type: Object})
  target!: GenericObject;

  @property({type: String})
  cumulativeProgress = '-';

  @property({type: String})
  achievement = '-';

  @property({type: Boolean, reflect: true})
  bold = false;

  @property({type: String})
  displayType = 'number';

  _getTargetValue(displayType: string, target: any) {
    switch (displayType) {
      case 'number':
        return this._formatNumber(target.v, '-', 0, ',');
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
