import EnvironmentFlags from '../../../environment-flags/environment-flags-mixin';
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';

/**
 * Interventions details tabs functionality
 * @polymer
 * @mixinFunction
 * @appliesMixin EnvironmentFlags
 */
const InterventionPageTabsMixin = dedupingMixin(
(superClass: any) => class extends EnvironmentFlags(superClass) {
  static get properties() {
    return {
      /**
       * Hidden tabs rules:
       *  - overview - on new intervention page
       *  - reports & progress - if prp sections are disabled and on new intervention page
       */
      interventionTabs: {
        type: Array,
        value: [
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
            tab: 'progress',
            tabLabel: 'Progress',
            hidden: false
          }
        ]
      }
    };
  }

  static get observers() {
    return ['_computeInterventionTabs(newInterventionActive, environmentFlags)'];
  }

  _computeInterventionTabs(newInterventionActive: boolean, environmentFlags: any) {
    if (typeof newInterventionActive === 'undefined' && typeof environmentFlags === 'undefined') {
      return;
    }
    let showPrpTabs = this.showPrpReports();
    let tabs = JSON.parse(JSON.stringify(this.interventionTabs));
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

});

export default InterventionPageTabsMixin;
