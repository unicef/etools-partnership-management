import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import 'etools-data-table/etools-data-table.js';

import '../../../../../../mixins/repeatable-data-sets-mixin.js';
import '../../../../../../layout/icons-actions.js';

import RepeatableDataSetsMixin from '../../../../../../mixins/repeatable-data-sets-mixin';
import {fireEvent} from '../../../../../../utils/fire-custom-event';
import {DomRepeatEvent} from '../../../../../../../typings/globals.types';
import {gridLayoutStyles} from '../../../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../../../styles/shared-styles';

import './pd-lower-result-name.js';
import './applied-indicators.js';
import {Indicator} from '../../../../../../../typings/intervention.types.js';
import {logError} from 'etools-behaviors/etools-logging';
import {property} from '@polymer/decorators';
import {IconsActionsEl} from '../../../../../../layout/icons-actions.js';
import {PaperIconButtonElement} from '@polymer/paper-icon-button/paper-icon-button.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin RepeatableDataSetsMixin
 */
class ResultLinkLowerResults extends RepeatableDataSetsMixin(PolymerElement) {

  static get template() {
    return html`
      ${gridLayoutStyles} ${SharedStyles}
      <style
          include="data-table-styles">
        [hidden] {
          display: none !important;
        }

        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          --list-bg-color: #eeeeee;
          --icons-actions: {
            background-color: var(--list-second-bg-color);
          };
        }

        .lborder {
          border-left: 1px solid var(--list-divider-color);
        }

        paper-icon-button {
          color: var(--dark-icon-color, #6f6f70);
        }

        .header-container {
          height: 56px;
          padding: 0 24px;
          @apply --layout-horizontal;
          @apply --layout-center;
        }

        .border-b {
          border-bottom: 1px solid var(--list-divider-color);
        }

        icons-actions {
          visibility: hidden;
        }

        .result-statement {
          padding-top: 12px;
          padding-bottom: 12px;
          padding-right: 12px;
        }

        div.result-statement:hover icons-actions {
          visibility: visible;
        }

        div {
          box-sizing: border-box;
        }

        .lower-result-row {
          @apply --layout-center;
          padding: 0 24px;
          min-height: 49px; /* 1px for border */
        }

        .lower-result-row:not(:last-of-type) {
          border-bottom: 1px solid var(--list-divider-color);
        }

        .indicators-container {
          @apply --layout-center;
          @apply --layout-self-stretch;
        }

        .add-btn-row {
          height: 48px;
          padding-left: 16px;
          @apply --layout-horizontal;
          @apply --layout-center;
        }

        .lower-results-list:not([hidden]) + .add-btn-row {
          border-top: 1px solid var(--list-divider-color);
          height: 49px;
        }

      </style>

      <div hidden$="[[!_emptyList(dataItems.length)]]">
        <etools-data-table-header no-title no-collapse>
          <etools-data-table-column class="col-12">PD Output or SSFA Expected Result</etools-data-table-column>
        </etools-data-table-header>
      </div>

      <div class="lower-results-list" hidden$="[[_emptyList(dataItems.length)]]">
        <div class="header-container header-text border-b">
          <div class$="[[getColumnLength('result', thereAreIndicators)]]">PD Output or SSFA Expected Result</div>
          <div class="col flex-c">
            <div class="col col-8">Performance Indicator</div>
            <div class="col col-2 right-align" hidden$="[[!thereAreIndicators]]">Baseline</div>
            <div class="col col-2 right-align" hidden$="[[!thereAreIndicators]]">Target</div>
          </div>
        </div>

        <template is="dom-repeat" items="{{dataItems}}">
          <div class="layout-horizontal lower-result-row"
              hidden$="[[allIndicatorsAreInactive(item.applied_indicators, showInactiveIndicators, forceVisibilityRecalc)]]">
            <div class$="[[getColumnLength('result', thereAreIndicators)]] result-statement p-relative">
              <icons-actions hidden$="[[!editMode]]" data-args$="[[index]]" on-edit="_editLowerResult"
                            on-delete="_openDeleteConfirmation"></icons-actions>
              <span>[[item.name]]</span>
            </div>
            <div class="flex-c lborder indicators-container">
              <div hidden="[[!item.applied_indicators.length]]">
                <applied-indicators data-items="{{item.applied_indicators}}"
                                    intervention-status="[[interventionStatus]]"
                                    result-link-index="[[index]]"
                                    cp-output-id="[[cpOutputId]]"
                                    show-inactive-indicators="[[showInactiveIndicators]]"
                                    edit-mode="[[editMode]]">
                </applied-indicators>
              </div>
              <div class="add-btn-row flex-c" hidden$="[[!editMode]]">
                <paper-icon-button icon="add-box"
                                  title="Add Indicator"
                                  on-tap="_addNewIndicator"
                                  data-ll-result-id$="[[item.id]]"
                                  disabled$="[[!editMode]]">
                </paper-icon-button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <div class="add-btn-row border-t" hidden$="[[!editMode]]">
        <paper-icon-button icon="add-box"
                          on-tap="_addNewLowerResult"
                          title="Add PD or SSFA Expected Result"
                          disabled$="[[!editMode]]">
          Add PD output or SSFA expected result
        </paper-icon-button>
      </div>

    `;
  }

  @property({type: String})
  _deleteEpName: string = 'lowerResultsDelete';

  @property({type: String})
  interventionStatus!: string;

  @property({type: Number})
  cpOutputId!: number;

  @property({type: Boolean})
  editMode: boolean = false;

  @property({type: Number})
  expectedResultId!: number;

  @property({type: Boolean})
  thereAreIndicators: boolean = false;

  @property({type: Boolean})
  showInactiveIndicators!: boolean;

  @property({type: Boolean})
  forceVisibilityRecalc!: boolean


  static get observers() {
    return [
      '_dataItemsChanged(dataItems.*)',
      '_makeSureDataItemsAreValid(dataItems)'
    ];
  }

  ready() {
    super.ready();
    this._updateInterventionLocAndClusters = this._updateInterventionLocAndClusters.bind(this);
    this.addEventListener('delete-confirm', this._updateInterventionLocAndClusters);
  }

  disconnectedCallback() {
    this.removeEventListener('delete-confirm', this._updateInterventionLocAndClusters);
  }

  _dataItemsChanged(dataItemsMutation: any) {
    if (typeof dataItemsMutation === 'undefined') {
      return;
    }

    if (!this.dataItems) {
      this.thereAreIndicators = false;
      return;
    }

    this.forceVisibilityRecalc = true;

    for (const i in this.dataItems) {
      if (this.dataItems[i].applied_indicators && this.dataItems[i].applied_indicators.length) {
        this.thereAreIndicators = true;
        break;
      }
    }
  }

  allIndicatorsAreInactive(indicators: Indicator[]) {
    this.forceVisibilityRecalc = false;
    const allIndicatorsAreDeactivated = indicators instanceof Array && indicators.length > 0 &&
        indicators.every(i => !i.is_active);
    return allIndicatorsAreDeactivated ? !this.showInactiveIndicators : false;
  }

  getColumnLength(column: string, thereAreIndicators: boolean) {
    // * result-link-lower-results class is added for browsers that use shaddy dom
    switch (column) {
      case 'result':
        return (thereAreIndicators ? 'col-4' : 'col-8') + ' result-link-lower-results';
      case 'indicator':
        return (thereAreIndicators ? 'col-8' : 'col-4') + ' result-link-lower-results';
      default:
        return '';
    }
  }

  _updateInterventionLocAndClusters() {
    fireEvent(this, 'indicators-changed');
  }

  _addNewLowerResult() {
    fireEvent(this, 'add-new-lower-result', {expectedResultId: this.expectedResultId});
  }

  _editLowerResult(e: CustomEvent) {
    e.stopPropagation();
    const index = parseInt((e.target as IconsActionsEl).getAttribute('data-args')!, 10);
    if (index < 0) {
      logError('Can not edit, invalid index selected', 'lower-results');
      return;
    }

    const lowerResult = this.dataItems[index];
    if (!lowerResult) {
      logError('Lower result not found in data items by index: ' + index, 'lower-results');
      return;
    }

    fireEvent(this, 'edit-lower-result', {
      expectedResultId: this.expectedResultId,
      lowerResultId: lowerResult.id,
      lowerResultName: lowerResult.name
    });
  }

  _getIndicatorNr(indicatorIndex: string) {
    return parseInt(indicatorIndex, 10) + 1;
  }

  _addNewIndicator(event: DomRepeatEvent) {
    // build a map (actionParams) to know where to put indicator data at add/edit
    const resultMap = {
      cpOutputId: this.cpOutputId,
      llResultIndex: event.model.index,
      llResultId: parseInt((event.target as PaperIconButtonElement).getAttribute('data-ll-result-id')!, 10),
      indicatorData: null,
      appliedIndicatorsIndex: null
    };
    fireEvent(this, 'open-indicator-dialog', resultMap);
  }

}

window.customElements.define('result-link-lower-results', ResultLinkLowerResults);
