import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import 'etools-content-panel/etools-content-panel';
import 'etools-data-table/etools-data-table';
import EtoolsAjaxRequestMixin from 'etools-ajax/etools-ajax-request-mixin';
import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';
import UserPermissionsMixin from '../../../user/user-permissions-mixin';

import { gridLayoutStyles } from '../../../styles/grid-layout-styles';
import FrontendPaginationMixin from '../../../mixins/frontend-pagination-mixin';

import './add-disaggregation-dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../store';
import {patchDisaggregation} from '../../../../actions/common-data';
import EnvironmentFlagsMixin from '../../../environment-flags/environment-flags-mixin';
import {isJsonStrMatch} from '../../../utils/utils';
import {Disaggregation} from '../../../../typings/intervention.types';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../utils/ajax-errors-parser.js';
import { EnvFlags } from '../../../../typings/globals.types';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin UserPermissionsMixin
 * @appliesMixin EtoolsAjaxRequestMixin
 * @appliesMixin EnvironmentFlagsMixin
 * @appliesMixin FrontendPaginationMixin
 */
const DisagregationListRequiredMixins = EtoolsMixinFactory.combineMixins([
  EndpointsMixin,
  UserPermissionsMixin,
  EtoolsAjaxRequestMixin,
  EnvironmentFlagsMixin,
  FrontendPaginationMixin,
  EndpointsMixin,
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin DisagregationListRequiredMixins
 */
class DisaggregationList extends connect(store)(DisagregationListRequiredMixins) {

  static get template() {
    // language=HTML
    return html`
        ${gridLayoutStyles}
      <style include="data-table-styles paper-material-styles">
        [hidden] {
          display: none !important;
        }

        #filters {
          background-color: var(--primary-background-color, #FFFFFF);
          padding: 8px 24px;
          margin-bottom: 24px;
          box-sizing: border-box;
        }

        .qFilter {
          max-width: 200px;
        }

      </style>

      <div id="filters" class="paper-material" elevation="1">
        <paper-input id="query"
                     class="qFilter"
                     type="search"
                     autocomplete="off"
                     value="{{q}}"
                     placeholder="Search">
          <iron-icon icon="search" slot="prefix"></iron-icon>
        </paper-input>
      </div>

      <etools-content-panel panel-title="Disaggregations">
        <template is="dom-if" if="[[userIsPme(currentUser)]]">
          <paper-icon-button slot="panel-btns"
                             icon="add-box"
                             on-tap="_addDisaggregation">
          </paper-icon-button>
        </template>
        <div hidden$="[[_emptyList(filteredDisaggregations)]]">
          <etools-data-table-header no-collapse no-title>
            <etools-data-table-column class="col-4" field="name">
              Name
            </etools-data-table-column>
            <etools-data-table-column class="col-6" field="disaggregation_values">
              Disaggregation Groups
            </etools-data-table-column>
            <etools-data-table-column class="col-2" field="disaggregation_active">
              Active
            </etools-data-table-column>
          </etools-data-table-header>
          <template is="dom-repeat" items="[[dataItems]]">
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <span class="col-data col-4">
                  [[item.name]]
                </span>
                <span class="col-data col-6">
                  [[_displayGroups(item.disaggregation_values)]]
                </span>
                <span class="col-data col-2">
                  <paper-toggle-button id="showActive-[[item.id]]"
                                       disabled="[[!userIsPme(currentUser)]]"
                                       checked="{{item.active}}"
                                       on-tap="_toggleActive">

                  </paper-toggle-button>
                </span>
              </div>
            </etools-data-table-row>
          </template>

          <etools-data-table-footer
              page-size="[[pagination.pageSize]]"
              page-number="[[pagination.pageNumber]]"
              total-results="[[pagination.totalResults]]"
              on-page-size-changed="_pageSizeChanged"
              on-page-number-changed="_pageNumberChanged">
          </etools-data-table-footer>
        </div>
        <div class="row-padding" hidden$="[[!_emptyList(filteredDisaggregations)]]">
          <p>The are no disaggregations defined.</p>
        </div>
      </etools-content-panel>
    `;
  }

  static get properties() {
    return {
      disaggregations: {
        type: Array,
        statePath: 'disaggregations'
      },
      disaggregationModal: {
        type: Object
      },
      filteredDisaggregations: {
        type: Array,
        computed: '_filterData(disaggregations, q)'
      },
      q: {
        type: String,
        value: ''
      },
      totalResults: {
        type: Number,
        computed: '_computeResults(filteredDisaggregations)'
      }
    };
  }

  static get observers() {
    return [
      '_paginationChanged(pagination.pageNumber, pagination.pageSize, filteredDisaggregations)',
      '_disagregationsChanged(filteredDisaggregations, environmentFlags)'
    ];
  }

  public stateChanged(state: RootState) {
    if (!state.commonData) {
      return;
    }

    if (!isJsonStrMatch(state.commonData.disaggregations, this.disaggregations)) {
      this.disaggregations = [...state.commonData.disaggregations];
    }

    this.endStateChanged(state);
  }

  ready() {
    super.ready();
    this.editMode = true;
    this.disaggregationModal = document.createElement('add-disaggregation-dialog');
    this.disaggregationModal.setAttribute('id', 'disaggregationModal');
    document.querySelector('body')!.appendChild(this.disaggregationModal);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    if (this.disaggregationModal) {
      document.querySelector('body')!.removeChild(this.disaggregationModal);
    }
  }

  broadcastPatchDisaggregToOtherTabs(disaggregation: Disaggregation) {
    localStorage.setItem('update-redux', JSON.stringify({
      type: 'PATCH_DISAGGREGATION',
      disaggregation: disaggregation
    }));
    localStorage.removeItem('update-redux');
  }

  _filterData(disaggregations: Disaggregation[], q: any) {
    if (!(disaggregations instanceof Array && disaggregations.length > 0)) {
      return [];
    }
    let filteredDisaggregations = JSON.parse(JSON.stringify(disaggregations));
    filteredDisaggregations = filteredDisaggregations.filter((d: Disaggregation) => this._applyQFilter(d, q));
    return filteredDisaggregations;
  }

  _applyQFilter(d: Disaggregation, q: any) {
    if (!q || q === '') {
      return true;
    }
    q = q.toLowerCase();
    return String(d.name).toLowerCase().search(q) > -1;
  }

  _toggleActive(e: any) {
    let self = this;

    let requestParams = {
      method: 'PATCH',
      endpoint: this.getEndpoint('patchDisaggregations', {id: e.model.item.id}),
      body: {active: e.model.item.active}
    };

    this.sendRequest(requestParams).then(function(response: any) {
      store.dispatch(patchDisaggregation(response));
      self.broadcastPatchDisaggregToOtherTabs(response);
    }).catch(function(error: any) {
      self.shadowRoot.querySelector('#showActive-' + e.model.item.id).checked = !e.model.item.active;
      parseRequestErrorsAndShowAsToastMsgs(error, self.toastEventSource ? self.toastEventSource : self);
    });
  }

  _computeResults(filteredDis: any) {
    return filteredDis.length;
  }

  _emptyList() {
    return !this.disaggregations || !this.disaggregations.length;
  }

  // @ts-ignore
  _disagregationsChanged(disaggregs: Disaggregation[], environmentFlags: EnvFlags) {
    if (!disaggregs || !disaggregs.length) {
      this.dataItems = [];
      return;
    }
    this.set('pagination.totalResults', disaggregs.length);
  }

  _openModal() {
    this.disaggregationModal.toastEventSource = this;
    this.disaggregationModal.resetValidations();
    this.disaggregationModal.open();
  }

  _displayGroups(groups: any) {
    if (!groups || !groups.length) {
      return '-';
    }
    return groups.map((g: any) => {
      return g.value;
    }).join('; ');
  }

  _addDisaggregation() {
    this.disaggregationModal.initializeDisaggregation();
    this._openModal();
  }

}

window.customElements.define('disaggregation-list', DisaggregationList);
