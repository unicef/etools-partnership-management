import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/polymer-element.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-item/paper-item.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import 'etools-content-panel/etools-content-panel.js';

import './qpr/quarterly-reporting-requirements.js';
import './hr/humanitarian-reporting-req-unicef.js';
import './hr/humanitarian-reporting-req-cluster.js';
import './srr/special-reporting-requirements.js';
import { gridLayoutStyles } from '../../../../../../styles/grid-layout-styles.js';


/**
 * @polymer
 * @customElement
 */
class PartnerReportingRequirements extends PolymerElement {
  static get template() {
    return html`
    ${gridLayoutStyles}
      <style>
        :host {
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;

        }

        /* ------------------------------- */

        .nav-menu {
          @apply --layout-vertical;
          background: var(--primary-background-color);
          padding: 8px 0 8px 0;
          min-width: 290px;
        }

        .nav-menu-item {
          padding-left: 24px;
          padding-right: 24px;
          font-size: 14px;
          font-weight: bold;
          text-transform: capitalize;

          --paper-item-focused-before: {
            opacity: 0;
          };
        }

        .nav-menu-item.iron-selected {
          color: var(--primary-color);
        }

        .nav-menu-item {
          color: var(--secondary-text-color);
        }

        .nav-menu-item.iron-selected {
          background-color: var(--medium-theme-background-color);
        }

        /* ------------------------------- */

        .reporting-req-data {
          border-left: 1px solid var(--darker-divider-color);
        }

        .edit-rep-req {
          color: var(--medium-icon-color);
          margin-left: 16px;
        }

        .nav-menu-item.qpr {
          @apply --layout-horizontal;
          @apply --layout-justified;
        }
      </style>

      <etools-content-panel class="content-section" panel-title="Partner Reporting Requirements">
        <div class="flex-c layout-horizontal">
          <div class="reports-menu nav-menu">
            <iron-selector selected="{{selectedReportType}}"
                          attr-for-selected="name"
                          selectable="paper-item">
              <paper-item name="qtyProgress"
                          class="nav-menu-item qpr">
                <span>Quarterly Progress Reports ([[qprRequirementsCount]])</span>
                <paper-icon-button class="edit-rep-req"
                                  icon="create"
                                  on-click="_openQprEditDialog"
                                  hidden$="[[_hideRepReqEditBtn(editMode, qprRequirementsCount)]]"></paper-icon-button>
              </paper-item>
              <paper-item name="humanitarianUnicef"
                          class="nav-menu-item">
                <span>Humanitarian Reports - UNICEF ([[hrUnicefRequirementsCount]])</span>
                <paper-icon-button class="edit-rep-req"
                                  icon="create"
                                  on-click="_openHruEditDialog"
                                  hidden$="[[_hideRepReqEditBtn(editMode, hrUnicefRequirementsCount)]]"></paper-icon-button>
              </paper-item>
              <paper-item name="humanitarianCluster"
                          class="nav-menu-item">
                Humanitarian Reports - Cluster ([[hrClusterRequirementsCount]])
              </paper-item>
              <paper-item name="special"
                          class="nav-menu-item">
                Special Report ([[specialRequirementsCount]])
              </paper-item>
            </iron-selector>
          </div>
          <div class="flex-c reporting-req-data">
            <iron-pages id="reportingPages"
                        selected="[[selectedReportType]]"
                        attr-for-selected="name"
                        fallback-selection="qtyProgress">

              <quarterly-reporting-requirements id="qpr"
                                                name="qtyProgress"
                                                intervention-id="[[interventionId]]"
                                                intervention-start="[[interventionStart]]"
                                                intervention-end="[[interventionEnd]]"
                                                requirements-count="{{qprRequirementsCount}}"
                                                edit-mode="[[editMode]]">
              </quarterly-reporting-requirements>

              <humanitarian-reporting-req-unicef id="hru"
                                                name="humanitarianUnicef"
                                                intervention-id="[[interventionId]]"
                                                intervention-start="[[interventionStart]]"
                                                requirements-count="{{hrUnicefRequirementsCount}}"
                                                expected-results="[[expectedResults]]"
                                                edit-mode="[[editMode]]">
              </humanitarian-reporting-req-unicef>

              <humanitarian-reporting-req-cluster name="humanitarianCluster"
                                                  intervention-id="[[interventionId]]"
                                                  requirements-count="{{hrClusterRequirementsCount}}"
                                                  expected-results="[[expectedResults]]">
              </humanitarian-reporting-req-cluster>

              <special-reporting-requirements name="special"
                                              intervention-id="[[interventionId]]"
                                              requirements-count="{{specialRequirementsCount}}">
              </special-reporting-requirements>

            </iron-pages>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  static get properties() {
    return {
      selectedReportType: {
        type: String,
        value: 'qtyProgress'
      },
      interventionId: Number,
      interventionStart: Date,
      interventionEnd: String,
      expectedResults: Array,

      // count properties
      qprRequirementsCount: {
        type: Number,
        value: 0
      },
      hrUnicefRequirementsCount: {
        type: Number,
        value: 0
      },
      hrClusterRequirementsCount: {
        type: Number,
        value: 0
      },
      specialRequirementsCount: {
        type: Number,
        value: 0
      },
      editMode: {
        type: Boolean,
        statePath: 'pageData.permissions.edit.reporting_requirements'
      }
    };
  }

  _openQprEditDialog() {
    this.$.qpr.openQuarterlyRepRequirementsDialog();
  }

  _openHruEditDialog() {
    this.$.hru.openUnicefHumanitarianRepReqDialog();
  }

  _hideRepReqEditBtn(editMode, qprCount) {
    return qprCount === 0 || !editMode;
  }

}

window.customElements.define('partner-reporting-requirements', PartnerReportingRequirements);

