import {html, LitElement, property, customElement} from 'lit-element';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import './add-disaggregation-dialog';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../redux/store';
import {patchDisaggregation} from '../../../../redux/actions/common-data';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {userIsPme} from '@unicef-polymer/etools-modules-common/dist/utils/user-permissions';
import {PaperToggleButtonElement} from '@polymer/paper-toggle-button/paper-toggle-button';
import {Disaggregation} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import {translate} from 'lit-translate';
import pmpEdpoints from '../../../endpoints/endpoints';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin FrontendPaginationMixin
 */

@customElement('disaggregation-list')
export class DisaggregationList extends connect(store)(PaginationMixin(CommonMixin(EndpointsLitMixin(LitElement)))) {
  static get styles() {
    return [gridLayoutStylesLit, elevationStyles];
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
        }
      </style>

      <div id="filters" class="paper-material elevation" elevation="1">
        <paper-input
          id="query"
          class="qFilter"
          type="search"
          autocomplete="off"
          .value="${this.q}"
          @value-changed="${({detail}: CustomEvent) => {
            this.q = detail.value;
            this.requestUpdate();
          }}"
          placeholder="${translate('GENERAL.SEARCH')}"
        >
          <iron-icon icon="search" slot="prefix"></iron-icon>
        </paper-input>
      </div>

      <etools-content-panel panel-title="${translate('DISAGGREGATIONS')}">
        <paper-icon-button
          slot="panel-btns"
          ?hidden="${!userIsPme(this.currentUser)}"
          icon="add-box"
          @click="${this._addDisaggregation}"
        >
        </paper-icon-button>
        <div ?hidden="${this._emptyList(this.filteredDisaggregations)}">
          <etools-data-table-header no-collapse no-title>
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
              <etools-data-table-row no-collapse>
                <div slot="row-data">
                  <span class="col-data col-4">${item.name}</span>
                  <span class="col-data col-6">${this._displayGroups(item.disaggregation_values)}</span>
                  <span class="col-data col-2">
                    <paper-toggle-button
                      data-id="${item.id}"
                      data-active="${item.active}"
                      ?disabled="${!userIsPme(this.currentUser)}"
                      ?checked="${item.active}"
                      @checked-changed="${this._disaggregationChange}"
                    >
                    </paper-toggle-button>
                  </span>
                </div>
              </etools-data-table-row>
            `
          )}

          <etools-data-table-footer
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

  stateChanged(state: RootState) {
    if (!state.commonData) {
      return;
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
    const elDisaggregation = e.currentTarget as PaperToggleButtonElement;

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
