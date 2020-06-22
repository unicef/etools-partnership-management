import {PolymerElement, html} from '@polymer/polymer';
import '@unicef-polymer/etools-data-table/etools-data-table.js';

import '../../../../../../../layout/icons-actions.js';
import CommonMixin from '../../../../../../../mixins/common-mixin.js';
import {GenericObject} from '../../../../../../../../typings/globals.types.js';
import {fireEvent} from '../../../../../../../utils/fire-custom-event.js';
import ReportingReqPastDatesCheckMixin from '../mixins/reporting-req-past-dates-check.js';
import {gridLayoutStyles} from '../../../../../../../styles/grid-layout-styles.js';
import {reportingRequirementsListStyles} from '../styles/reporting-requirements-lists-styles.js';
import {isEmptyObject} from '../../../../../../../utils/utils.js';
import {property} from '@polymer/decorators';
import {IconsActionsEl} from '../../../../../../../layout/icons-actions.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin ReportingReqPastDatesCheckMixin
 */
class HruList extends CommonMixin(ReportingReqPastDatesCheckMixin(PolymerElement)) {
  static get template() {
    // language=HTML
    return html`
      ${gridLayoutStyles} ${reportingRequirementsListStyles}
      <style include="data-table-styles">
        :host([with-scroll]) {
          max-height: 400px;
          overflow-y: auto;
        }
      </style>

      <etools-data-table-header no-collapse no-title>
        <etools-data-table-column class="col-1 right-align index-col">ID</etools-data-table-column>
        <etools-data-table-column class="flex-c">Report End Date</etools-data-table-column>
        <etools-data-table-column class="col-1"></etools-data-table-column>
      </etools-data-table-header>
      <template is="dom-repeat" items="[[hruData]]">
        <etools-data-table-row
          no-collapse
          secondary-bg-on-hover$="[[_canEdit(editMode, inAmendment, item.due_date, item.id)]]"
        >
          <div slot="row-data" style$="[[_uneditableStyles(inAmendment, item.due_date, item.id)]]">
            <span class="col-data col-1 right-align index-col">[[_getIndex(index, hruData)]]</span>
            <span class="col-data flex-c">[[getDateDisplayValue(item.end_date)]]</span>
            <span class="col-data col-1 actions">
              <icons-actions
                hidden$="[[!_canEdit(editMode, inAmendment, item.due_date, item.id)]]"
                data-args$="[[index]]"
                on-delete="_deleteHruReq"
                show-edit="[[_listItemEditable]]"
              >
              </icons-actions>
            </span>
          </div>
        </etools-data-table-row>
      </template>
    `;
  }

  @property({type: Array})
  hruData: GenericObject[] = [];

  @property({type: Boolean})
  _listItemEditable = false;

  @property({type: Object})
  hruMainEl!: PolymerElement & {_getIndex(idx: any): number | string};

  @property({type: Boolean})
  usePaginationIndex = false;

  @property({type: Boolean})
  disableSorting = false;

  static get observers() {
    return ['_sortReportingReq(hruData, hruData.length)'];
  }

  _sortReportingReq(data: any) {
    if (this.disableSorting) {
      return;
    }
    if (isEmptyObject(data)) {
      return;
    }
    this._sortRequirementsAsc();
  }

  _sortRequirementsAsc() {
    this.hruData.sort((a: any, b: any) => {
      // @ts-ignore
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }

  _getIndex(index: any) {
    if (this.usePaginationIndex) {
      return this.hruMainEl._getIndex(index);
    }
    return parseInt(index, 10) + 1;
  }

  _deleteHruReq(e: CustomEvent) {
    fireEvent(this, 'delete-hru', {
      index: (e.target as IconsActionsEl).getAttribute('data-args')
    });
  }
}

window.customElements.define('hru-list', HruList);

export {HruList as HruListEl};
