import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import EndpointsMixin from '../../../endpoints/endpoints-mixin';

import {gridLayoutStyles} from '../../../styles/grid-layout-styles';
import FrontendPaginationMixin from '../../../mixins/frontend-pagination-mixin';

import './add-disaggregation-dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../store';
import {patchDisaggregation} from '../../../../actions/common-data';
import EnvironmentFlagsPolymerMixin from '../../../environment-flags/environment-flags-mixin';
import {isJsonStrMatch} from '../../../utils/utils';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {userIsPme} from '../../../user/user-permissions';
import {property} from '@polymer/decorators/lib/decorators';
import {PaperToggleButtonElement} from '@polymer/paper-toggle-button/paper-toggle-button';
import {Disaggregation, EnvFlags, User} from '@unicef-polymer/etools-types';
import {openDialog} from '../../../utils/dialog';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin EnvironmentFlagsPolymerMixin
 * @appliesMixin FrontendPaginationMixin
 */
class DisaggregationList extends connect(store)(
  FrontendPaginationMixin(EnvironmentFlagsPolymerMixin(EndpointsMixin(PolymerElement)))
) {
  static get template() {
    // language=HTML
    return html`
      ${gridLayoutStyles}
      <style include="data-table-styles paper-material-styles">
        [hidden] {
          display: none !important;
        }

        #filters {
          background-color: var(--primary-background-color, #ffffff);
          padding: 8px 24px;
          margin-bottom: 24px;
          box-sizing: border-box;
        }

        .qFilter {
          max-width: 200px;
        }
      </style>

      <div id="filters" class="paper-material" elevation="1">
        <paper-input id="query" class="qFilter" type="search" autocomplete="off" value="{{q}}" placeholder="Search">
          <iron-icon icon="search" slot="prefix"></iron-icon>
        </paper-input>
      </div>

      <etools-content-panel panel-title="Disaggregations">
        <template is="dom-if" if="[[userIsPme(currentUser)]]">
          <paper-icon-button slot="panel-btns" icon="add-box" on-tap="_addDisaggregation"> </paper-icon-button>
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
                  <paper-toggle-button
                    id="showActive-[[item.id]]"
                    disabled="[[!userIsPme(currentUser)]]"
                    checked="{{item.active}}"
                    on-tap="_toggleActive"
                  >
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
            on-page-number-changed="_pageNumberChanged"
          >
          </etools-data-table-footer>
        </div>
        <div class="row-padding" hidden$="[[!_emptyList(filteredDisaggregations)]]">
          <p>The are no disaggregations defined.</p>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  disaggregations!: Disaggregation[];

  @property({type: Array, computed: '_filterData(disaggregations, q)'})
  filteredDisaggregations!: Disaggregation[];

  @property({type: String})
  q = '';

  @property({
    type: Number,
    computed: '_computeResults(filteredDisaggregations)'
  })
  totalResults!: number;

  @property({type: Boolean})
  editMode!: boolean;

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
  }

  broadcastPatchDisaggregToOtherTabs(disaggregation: Disaggregation) {
    localStorage.setItem(
      'update-redux',
      JSON.stringify({
        type: 'PATCH_DISAGGREGATION',
        disaggregation: disaggregation
      })
    );
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
    const requestParams = {
      method: 'PATCH',
      endpoint: this.getEndpoint('patchDisaggregations', {
        id: e.model.item.id
      }),
      body: {active: e.model.item.active}
    };

    return sendRequest(requestParams)
      .then((response: any) => {
        store.dispatch(patchDisaggregation(response));
        this.broadcastPatchDisaggregToOtherTabs(response);
      })
      .catch((error: any) => {
        (this.shadowRoot!.querySelector('#showActive-' + e.model.item.id) as PaperToggleButtonElement).checked = !e
          .model.item.active;
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      });
  }

  _computeResults(filteredDis: any) {
    return filteredDis.length;
  }

  _emptyList() {
    return !this.disaggregations || !this.disaggregations.length;
  }

  _disagregationsChanged(disaggregs: Disaggregation[], _environmentFlags: EnvFlags) {
    if (!disaggregs || !disaggregs.length) {
      this.dataItems = [];
      return;
    }
    this.set('pagination.totalResults', disaggregs.length);
  }

  _addDisaggregation() {
    openDialog({
      dialog: 'add-disaggregation-dialog'
    });
  }

  _displayGroups(groups: any) {
    if (!groups || !groups.length) {
      return '-';
    }
    return groups
      .map((g: any) => {
        return g.value;
      })
      .join('; ');
  }

  userIsPme(currentUser: User) {
    return userIsPme(currentUser);
  }
}

window.customElements.define('disaggregation-list', DisaggregationList);
