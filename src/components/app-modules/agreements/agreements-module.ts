import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import "@polymer/paper-button/paper-button.js"
import { connect } from 'pwa-helpers/connect-mixin.js';
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import { store, RootState } from '../../../store.js';
import '@polymer/app-route/app-route.js';
import { Agreement } from './agreement.js';
import AjaxErrorsParserMixin from '../../mixins/ajax-errors-parser-mixin.js';
import ScrollControl from '../../mixins/scroll-control-mixin.js';

import ModuleMainElCommonFunctionalityMixin from '../mixins/module-common-mixin.js';
import EndpointsMixin from '../../endpoints/endpoints-mixin.js';
import Constants from '../../config/app-constants.js';
import ModuleRoutingMixin from '../mixins/module-routing-mixin.js';
import '../../layout/etools-error-messages-box.js'


class AgreementsModule extends connect(store)(EtoolsLogsMixin
  (ScrollControl
  (ModuleRoutingMixin
  (ModuleMainElCommonFunctionalityMixin
  (Constants
  (EndpointsMixin
  (AjaxErrorsParserMixin
  (PolymerElement)))))))) {
  public static get template() {
    return html`
      <style include="page-layout-styles shared-styles buttons-styles page-content-header-slotted-styles">
        :host {
          display: block;
        }
      </style>
      <app-route
          route="{{route}}"
          pattern="/list"
          query-params="{{listPageQueryParams}}"
          active="{{listActive}}"></app-route>

      <app-route
          route="{{route}}"
          pattern="/:id/details"
          active="{{tabsActive}}"
          data="{{routeData}}"></app-route>

      <page-content-header with-tabs-visible="[[_showPageTabs(activePage)]]">
        <div slot="page-title">
          <template is="dom-if" if="[[listActive]]">
            <span>Agreements</span>
          </template>
          <template is="dom-if" if="[[tabsActive]]">
            <span>[[_getAgreementDetailsTitle(agreement, newAgreementActive)]]</span>
          </template>
        </div>

        <div slot="title-row-actions" class="content-header-actions">
          <div class="action" hidden$="[[!listActive]]">
            <a target="_blank" href$="[[csvDownloadUrl]]">
              <paper-button>
                <iron-icon icon="file-download"></iron-icon>
                Export
              </paper-button>
            </a>
          </div>
          <div class="action" hidden$="[[!_showNewAgreementAddButton(listActive, permissions)]]">
            <paper-button class="primary-btn with-prefix" on-tap="_goToNewAgreementPage">
              <iron-icon icon="add"></iron-icon>
              Add New Agreement
            </paper-button>
          </div>
        </div>

        <template is="dom-if" if="[[_showPageTabs(activePage)]]">
          <etools-tabs slot="tabs"
                      tabs="[[agreementsTabs]]"
                      active-tab="details"
                      on-iron-select="_handleTabSelectAction">
          </etools-tabs>
        </template>
      </page-content-header>
    `;
  }

  static get properties() {
    return {
      agreementsTabs: {
        type: Array,
        value: [{
          tab: 'details',
          tabLabel: 'Agreement Details',
          hidden: false
        }]
      },
      permissions: {
        type: Object
      },
      selectedAgreementId: {
        type: Number
      },
      newAgreementModel: {
        type: Object,
        value: () => new Agreement()
      },
      csvDownloadUrl: {
        type: String
      },
      newAgreementActive: {
        type: Boolean,
        computed: '_updateNewItemPageFlag(routeData, listActive)'
      },
      agreement: {
        type: Object,
        observer: '_agreementChanged'
      },
      moduleName: {
        type: String,
        value: 'agreements'
      },
      authorizedOfficers: Array
    };
  }

}

window.customElements.define('agreements-module', AgreementsModule);
