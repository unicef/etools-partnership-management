import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';

/**
 * @polymer
 * @mixinFunction
 */
const IndicatorDialogTabsMixin = dedupingMixin(
(superClass: any) => class extends superClass {

  static get properties() {
    return {
      indicatorDataTabs: {
        type: Array,
        value: [
          {
            tab: 'details',
            tabLabel: 'Details'
          },
          {
            tab: 'disaggregations',
            tabLabel: 'Disaggregations',
            showTabCounter: true,
            counter: 0
          }
        ]
      },
      activeTab: {
        type: String,
        value: 'details'
      }
    };
  }

  static get observers() {
    return [
      '_setDisaggregationsCount1(disaggregations, prpDisaggregations, isCluster)',
      '_setDisaggregationsCount2(disaggregations.length, prpDisaggregations.length)'
    ];
  }

  /**
   * Update disaggegations tab counter
   */
  _updateDisaggregationsNrInTabLabel(disaggregationsCount: number) {
    return this.set(['indicatorDataTabs', 1, 'counter'], disaggregationsCount);
  }

  _setDisaggregationsCount1(disaggregs: [], prpDisaggregs: []) {
    if (!this.indicator || !disaggregs || !prpDisaggregs) {
      this._updateDisaggregationsNrInTabLabel(0);
      return;
    }
    this._setDisaggregationsCount2(disaggregs.length, prpDisaggregs.length);
  }

  _setDisaggregationsCount2(disaggregsLength: number, prpDisaggregsLength: number) {
    if (typeof disaggregsLength === 'undefined' || typeof prpDisaggregsLength === 'undefined') {
      return;
    }
    let disaggregationsNr = this.isCluster ? prpDisaggregsLength : disaggregsLength;
    this._updateDisaggregationsNrInTabLabel(disaggregationsNr);
  }

  updateActiveTab(tab: string) {
    this.set('activeTab', tab);
  }

});

export default IndicatorDialogTabsMixin;
