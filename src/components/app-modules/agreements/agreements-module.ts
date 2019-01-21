import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { store, RootState } from '../../../store.js';
import '@polymer/app-route/app-route.js';
import { Agreement } from './agreement.js';


class AgreementsModule extends connect(store)(PolymerElement) {
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
