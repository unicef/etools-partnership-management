// import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';
import {Constructor, EtoolsTab} from '../../../../../../../../typings/globals.types';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 */
function IndicatorDialogTabsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class IndicatorDialogTabsClass extends baseClass {
    @property({type: Array})
    indicatorDataTabs: EtoolsTab[] = [
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
    ];

    @property({type: String})
    activeTab = 'details';

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
      // @ts-ignore
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
      // @ts-ignore
      const disaggregationsNr = this.isCluster ? prpDisaggregsLength : disaggregsLength;
      this._updateDisaggregationsNrInTabLabel(disaggregationsNr);
    }

    updateActiveTab(tab: string) {
      this.set('activeTab', tab);
    }
  }
  return IndicatorDialogTabsClass;
}

export default IndicatorDialogTabsMixin;
