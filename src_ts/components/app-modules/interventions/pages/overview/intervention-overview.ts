import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/maps-icons.js';
import '@polymer/iron-label/iron-label.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import 'etools-content-panel/etools-content-panel.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';

import '../../../../layout/monitoring-visits-list.js';
import './components/fund-reservations-display.js';
import CommonMixin from '../../../../mixins/common-mixin.js';
import { gridLayoutStyles } from '../../../../styles/grid-layout-styles.js';
import { pageCommonStyles } from '../../../../styles/page-common-styles.js';
import { SharedStyles } from '../../../../styles/shared-styles.js';
import { fireEvent } from '../../../../utils/fire-custom-event.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../store.js';
import { isJsonStrMatch } from '../../../../utils/utils.js';
import { CpOutput, ExpectedResult, Section } from '../../../../../typings/intervention.types.js';
import { GenericObject } from '../../../../../typings/globals.types.js';


/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 */
class InterventionOverview extends connect(store)(CommonMixin(PolymerElement) as any) {
  [x: string]: any;

  static get template() {
    return html`
     ${pageCommonStyles} ${gridLayoutStyles} ${SharedStyles}
      <style include="paper-material-styles">
        :host {
          @apply --layout-vertical;
          width: 100%;
        }

        .block {
          display: block;
        }

        .content {
          margin-top: 8px;
        }

        iron-label {
          color: var(--dark-secondary-text-color);
        }

        .secondary {
          color: var(--dark-secondary-text-color);
        }

        .blue {
          color: var(--paper-blue-500);
        }

        .sector-label {
          display: inline-block;
          white-space: nowrap;
          height: 19px;
          text-align: center;
          padding: 7px 10px;
          background-color: var(--warning-color);
          text-transform: capitalize;
          font-weight: bold;
          color: var(--light-primary-text-color, #FFFFFF);
        }

        #top-container {
          margin-bottom: 24px;
        }
      </style>

      <div class="paper-material" elevation="1" id="top-container">
        <div class="row-h flex-c">
          <div class="col col-12 block">
            <iron-label for="cp_outputs_list">
              Cp Output(s)
            </iron-label>
            <br/>
            <div class="content" id="cp_outputs_list">
              <template is="dom-repeat" items="[[interventionCpOutputs]]" as="cpOut">
                <strong>[[ cpOut ]]</strong><br/>
              </template>
            </div>
          </div>
        </div>

        <div class="row-h flex-c">
          <div class="col col-12 block">
            <iron-label for="document_title">
              Document Title
            </iron-label>
            <br/>
            <div class="content" id="document_title">
              [[ intervention.title ]]
            </div>

            <div class="secondary">
              Under <strong class="blue">[[interventionAgreement.agreement_type]]</strong> with
              <a href$="/pmp/partners/[[intervention.partner_id]]/details">
                <strong class="blue">[[intervention.partner]]</strong>
              </a>
            </div>
          </div>
        </div>

        <div class="row-h flex-c">
          <div class="col col-6 block">
            <iron-label for="interventions_timeline">
              Timeline
            </iron-label>
            <br/>
            <div class="content" id="interventions_timeline">
              [[getDateDisplayValue(intervention.start)]] - [[getDateDisplayValue(intervention.end)]]
            </div>
          </div>
          <div class="col col-6 block">
            <iron-label for="intervention-sections">
              Sections
            </iron-label>
            <br/>
            <div class="content" id="intervention-sections">
              [[getDisplayValue(inteventionSections)]]
            </div>
          </div>
        </div>
      </div>

      <etools-content-panel id="fund-reservation-display" class="content-section" panel-title="Implementation Status">
        <fund-reservations-display intervention="[[intervention]]"
                                    frs-details="[[intervention.frs_details]]"></fund-reservations-display>
      </etools-content-panel>

      <etools-content-panel id="monitoring-visits-panel" class="content-section" panel-title="Monitoring Visits">
        <monitoring-visits-list intervention-or-partner-id="[[intervention.id]]"
                                endpoint-name="monitoringVisits">
        </monitoring-visits-list>
      </etools-content-panel>

    `;
  }

  static get properties() {
    return {
      intervention: {
        type: Object
      },
      interventionAgreement: {
        type: Object
      },
      monitoringVisit: {
        type: Array
      },
      cpOutputs: {
        type: Array,
        statePath: 'cpOutputs'
      },
      interventionCpOutputs: {
        type: Array,
        value: []
      },
      sections: {
        type: Array,
        statePath: 'sections'
      },
      inteventionSections: {
        type: Array,
        value: []
      }
    };
  }

  static get observers() {
    return [
      '_parseSections(sections.length, intervention.sections.length)',
      '_parseCpOutputs(cpOutputs.length, intervention.result_links.length)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.cpOutputs, state.commonData!.cpOutputs)) {
      this.cpOutputs = [...state.commonData!.cpOutputs];
    }
    if (!isJsonStrMatch(this.sections, state.commonData!.sections)) {
      this.sections = [...state.commonData!.sections];
    }
  }

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for overview tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'interv-page'});
    fireEvent(this, 'tab-content-attached');
  }


  _parseCpOutputs(cpOutputsLength: number, resultsLength: number) {
    if (!cpOutputsLength || !resultsLength) {
      this.set('interventionCpOutputs', []);
      return;
    }
    let resultLinks = this.intervention.result_links;
    let ids: GenericObject = {};
    let uniqueIds: number[] = [];
    let interventionCpOutputs: CpOutput[] = [];

    resultLinks.forEach(function(res: ExpectedResult) {
      ids[res.cp_output] = true;
    });

    let id;
    for (id in ids) {
      if (id) {
        uniqueIds.push(parseInt(id));
      }
    }
    if (Array.isArray(this.cpOutputs) && this.cpOutputs.length > 0) {
      this.cpOutputs.forEach(function(cpo) {
        if (uniqueIds.indexOf(cpo.id) > -1) {
          interventionCpOutputs.push(cpo.name);
        }
      });

      this.set('interventionCpOutputs', interventionCpOutputs);
    }
  }

  _parseSections(sectionsLength: number, intSectionsLength: number) {
    if (!sectionsLength || !intSectionsLength) {
      this.set('inteventionSections', []);
      return;
    }

    this.set('inteventionSections', this._getIntervSectionNames());
  }

  _getIntervSectionNames() {
    let interventionSections = this.intervention.sections.map((sectionId: string) =>  parseInt(sectionId, 10));
    let sectionNames: string[] = [];

    this.sections.forEach(function(section: Section) {
      if (interventionSections.indexOf(parseInt(section.id, 10)) > -1) {
        sectionNames.push(section.name);
      }
    });

    return sectionNames;
  }

}

window.customElements.define('intervention-overview', InterventionOverview);
