import EnvironmentFlagsPolymerMixin from '../../../environment-flags/environment-flags-mixin';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {Constructor, EtoolsTab} from '@unicef-polymer/etools-types';

/**
 * Interventions details tabs functionality
 * @polymer
 * @mixinFunction
 * @appliesMixin EnvironmentFlagsPolymerMixin
 */
function InterventionPageTabsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class InterventionPageTabsClass extends EnvironmentFlagsPolymerMixin(baseClass as Constructor<PolymerElement>) {
    /**
     * Hidden tabs rules:
     *  - overview - on new intervention page
     *  - reports & progress - if prp sections are disabled and on new intervention page
     */
    @property({type: Array})
    interventionTabs: EtoolsTab[] = [
      {
        tab: 'overview',
        tabLabel: 'Overview',
        hidden: false
      },
      {
        tab: 'details',
        tabLabel: 'Details',
        hidden: false
      },
      {
        tab: 'review-and-sign',
        tabLabel: 'Review & Sign',
        hidden: false
      },
      {
        tab: 'attachments',
        tabLabel: 'Attachments',
        hidden: false
      },
      {
        tab: 'reports',
        tabLabel: 'Reports',
        hidden: false
      },
      {
        tab: 'info',
        tabLabel: 'Info',
        hidden: false
      }
    ];

    static get observers() {
      return ['_computeInterventionTabs(newInterventionActive, environmentFlags)'];
    }

    _computeInterventionTabs(newInterventionActive: boolean, environmentFlags: any) {
      if (typeof newInterventionActive === 'undefined' && typeof environmentFlags === 'undefined') {
        return;
      }
      const showPrpTabs = this.showPrpReports();
      const tabs = JSON.parse(JSON.stringify(this.interventionTabs));
      tabs.forEach((t: any) => {
        if (t.tab === 'overview') {
          t.hidden = newInterventionActive;
        }
        if (['reports', 'progress'].indexOf(t.tab) > -1) {
          t.hidden = !showPrpTabs || newInterventionActive;
        }
      });
      this.set('interventionTabs', tabs);
    }
  }
  return InterventionPageTabsClass;
}

export default InterventionPageTabsMixin;
