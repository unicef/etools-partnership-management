import {PolymerElement, html} from '@polymer/polymer';
import 'etools-data-table/etools-data-table.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';

import '../../../../../../../layout/icons-actions.js';
import CommonMixin from '../../../../../../../mixins/common-mixin.js';
import {PolymerElEvent} from '../../../../../../../../typings/globals.types.js';
import {fireEvent} from '../../../../../../../utils/fire-custom-event.js';
import ReportingReqPastDatesCheckMixin from '../mixins/reporting-req-past-dates-check.js';
import {gridLayoutStyles} from '../../../../../../../styles/grid-layout-styles.js';
import {reportingRequirementsListStyles} from '../styles/reporting-requirements-lists-styles.js';
import {isEmptyObject} from '../../../../../../../utils/utils.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin Common
 * @appliesMixin ReportingReqPastDatesCheck
 */
class HruList extends EtoolsMixinFactory.combineMixins([
      CommonMixin,
      ReportingReqPastDatesCheckMixin],
    PolymerElement) {
  [x: string]: any;

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

      <etools-data-table-header no-collapse
                                no-title>
        <etools-data-table-column class="col-1 right-align index-col">ID</etools-data-table-column>
        <etools-data-table-column class="flex-c">Report End Date</etools-data-table-column>
        <etools-data-table-column class="col-1"></etools-data-table-column>
      </etools-data-table-header>
      <template is="dom-repeat" items="[[hruData]]">
        <etools-data-table-row no-collapse
                              secondary-bg-on-hover$="[[_canEdit(editMode, inAmendment, item.due_date, item.id)]]">
          <div slot="row-data" style$="[[_uneditableStyles(inAmendment, item.due_date, item.id)]]">
            <span class="col-data col-1 right-align index-col">[[_getIndex(index, hruData)]]</span>
            <span class="col-data flex-c">[[getDateDisplayValue(item.end_date)]]</span>
            <span class="col-data col-1 actions">
              <icons-actions hidden$="[[!_canEdit(editMode, inAmendment, item.due_date, item.id)]]"
                            data-args$="[[index]]"
                            on-delete="_deleteHruReq"
                            show-edit="[[_listItemEditable]]">
              </icons-actions>
            </span>
          </div>
        </etools-data-table-row>
      </template>
    `;
  }

  static get properties() {
    return {
      hruData: {
        type: Array,
        value: []
      },
      _listItemEditable: {
        type: Boolean,
        value: false
      },
      hruMainEl: Object,
      usePaginationIndex: {
        type: Boolean,
        value: false
      },
      disableSorting: {
        type: Boolean,
        value: false
      }
    };
  }

  static get observers() {
    return [
      '_sortReportingReq(hruData, hruData.length)'
    ];
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

  _deleteHruReq(e: PolymerElEvent) {
    fireEvent(this, 'delete-hru', {index: e.target.getAttribute('data-args')});
  }
}

window.customElements.define('hru-list', HruList);

