import {html, LitElement} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import './add-disaggregation-dialog';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../../redux/store';
import {patchDisaggregation} from '../../../../redux/actions/common-data';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {userIsPme} from '@unicef-polymer/etools-modules-common/dist/utils/user-permissions';
import {Disaggregation} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import PaginationMixin from '@unicef-polymer/etools-unicef/src/mixins/pagination-mixin';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import pmpEdpoints from '../../../endpoints/endpoints';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin FrontendPaginationMixin
 */

@customElement('disaggregation-list')
export class DisaggregationList extends connect(store)(PaginationMixin(CommonMixin(EndpointsLitMixin(LitElement)))) {
  static get styles() {
    return [layoutStyles, elevationStyles];
  }
  render() {
    // language=HTML
    return html`
      <style>
        ${sharedStyles} ${dataTableStylesLit} [hidden] {
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
          display: flex;
        }
      </style>
      <etools-media-query
        query="(max-width: 1025px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <div id="filters" class="paper-material elevation" elevation="1">
        <etools-input
          id="query"
          class="qFilter"
          type="search"
          clearable
          autocomplete="off"
          .value="${this.q}"
          @value-changed="${({detail}: CustomEvent) => {
            this.q = detail.value;
            this.requestUpdate();
          }}"
          placeholder="${translate('GENERAL.SEARCH')}"
        >
          <etools-icon name="search" slot="prefix"></etools-icon>
        </etools-input>
      </div>

      <etools-content-panel panel-title="${translate('DISAGGREGATIONS')}">
        <etools-icon-button
          slot="panel-btns"
          ?hidden="${!userIsPme(this.currentUser)}"
          name="add-box"
          @click="${this._addDisaggregation}"
        >
        </etools-icon-button>
        <div ?hidden="${this._emptyList(this.filteredDisaggregations)}">
          <etools-data-table-header no-collapse no-title .lowResolutionLayout="${this.lowResolutionLayout}">
            <etools-data-table-column class="col-4" field="name">${translate('NAME')}</etools-data-table-column>
            <etools-data-table-column class="col-6" field="disaggregation_values">
              ${translate('DISAGGREGATION_GROUP')}
            </etools-data-table-column>
            <etools-data-table-column class="col-2" field="disaggregation_active"
              >${translate('ACTIVE')}</etools-data-table-column
            >
          </etools-data-table-header>
          ${(this.paginatedDisaggregations || []).map(
            (item: any) => html`
              <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
                <div slot="row-data">
                  <span class="col-data col-4" data-col-header-label="${translate('NAME')}">${item.name}</span>
                  <span class="col-data col-6" data-col-header-label="${translate('DISAGGREGATION_GROUP')}"
                    >${this._displayGroups(item.disaggregation_values)}</span
                  >
                  <span class="col-data col-2" data-col-header-label="${translate('ACTIVE')}">
                    <sl-switch
                      data-id="${item.id}"
                      data-active="${item.active}"
                      ?disabled="${!userIsPme(this.currentUser)}"
                      ?checked="${item.active}"
                      @sl-change="${this._disaggregationChange}"
                    >
                    </sl-switch>
                  </span>
                </div>
              </etools-data-table-row>
            `
          )}

          <etools-data-table-footer
            .lowResolutionLayout="${this.lowResolutionLayout}"
            .pageSize="${this.paginator.page_size}"
            .pageNumber="${this.paginator.page}"
            .totalResults="${this.paginator.count}"
            .visibleRange="${this.paginator.visible_range}"
            @page-size-changed="${this.pageSizeChanged}"
            @page-number-changed="${this.pageNumberChanged}"
          >
          </etools-data-table-footer>
        </div>
        <div class="row-padding" ?hidden="${!this._emptyList(this.filteredDisaggregations)}">
          <p>${translate('NO_DISAGGREGATIONS')}</p>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  disaggregations!: Disaggregation[];

  @property({type: Array})
  filteredDisaggregations!: Disaggregation[];

  @property({type: Array})
  paginatedDisaggregations!: Disaggregation[];

  @property({type: Boolean})
  lowResolutionLayout = false;

  _q!: string;

  set q(q: string) {
    this._q = q;
    this.paginator.page = 1;
    this._filterData(this.disaggregations, this.q);
  }

  @property({type: String})
  get q() {
    return this._q;
  }

  @property({type: Boolean})
  editMode!: boolean;

  @state() isInitialLoading = true;

  stateChanged(state: RootState) {
    if (!state.commonData) {
      return;
    }

    if (state.app?.routeDetails?.routeName === 'settings' && this.isInitialLoading) {
      this.isInitialLoading = false;
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: 'main-page'
      });
    }

    if (!isJsonStrMatch(state.commonData.disaggregations, this.disaggregations)) {
      this.disaggregations = [...state.commonData.disaggregations];
      this._filterData(this.disaggregations, this.q);
    }

    this.endStateChanged(state);
  }

  connectedCallback(): void {
    super.connectedCallback();
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
      return;
    }
    const filteredDisaggregations = JSON.parse(JSON.stringify(disaggregations));
    this.filteredDisaggregations = filteredDisaggregations.filter((d: Disaggregation) => this._applyQFilter(d, q));
    this.initializePaginator(this.filteredDisaggregations.length);
  }

  _applyQFilter(d: Disaggregation, q: any) {
    if (!q || q === '') {
      return true;
    }
    q = q.toLowerCase();
    return String(d.name).toLowerCase().search(q) > -1;
  }

  _disaggregationChange(e: any) {
    const elDisaggregation = e.currentTarget as SlSwitch;

    // to avoid making calls when table is rendered, make sure property binded to checked and checked are different
    if (elDisaggregation.dataset.active === String(elDisaggregation.checked)) {
      return;
    }
    const requestParams = {
      method: 'PATCH',
      endpoint: this.getEndpoint(pmpEdpoints, 'patchDisaggregations', {
        id: elDisaggregation.dataset.id
      }),
      body: {active: elDisaggregation.checked}
    };

    return sendRequest(requestParams)
      .then((response: any) => {
        store.dispatch(patchDisaggregation(response));
        this.broadcastPatchDisaggregToOtherTabs(response);
      })
      .catch((error: any) => {
        elDisaggregation.checked = !elDisaggregation.checked;
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      });
  }

  _emptyList(arr: any[]) {
    return !arr || !arr.length;
  }

  initializePaginator(datalength: number) {
    this.paginator = {...this.paginator, count: datalength};
  }

  _paginate(pageNumber: number, pageSize: number) {
    if (!this.filteredDisaggregations) {
      return;
    }
    this.paginatedDisaggregations = (this.filteredDisaggregations || []).slice(
      (pageNumber - 1) * pageSize,
      pageNumber * pageSize
    );
  }

  paginatorChanged() {
    this._paginate(this.paginator.page, this.paginator.page_size);
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
}
