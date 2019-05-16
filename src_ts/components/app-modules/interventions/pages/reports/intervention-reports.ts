
import {PolymerElement, html} from '@polymer/polymer';
import '../../../reports/components/reports-display-list.js';
import {isEmptyObject} from '../../../../utils/utils.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {fireEvent} from '../../../../utils/fire-custom-event.js';
import {updateAppState} from '../../../../utils/navigation-helper.js';


/**
  * @polymer
  * @customElement
  */
class InterventionReports extends PolymerElement {
  [x: string]: any;

  static get template() {
    return html`
      <style>
        :host {
          @apply --layout-flex;
          width: 100%;
        }
      </style>

      <reports-display-list intervention-id="[[interventionId]]"
                            paginator="{{paginator}}"
                            no-pd-ssfa-ref></reports-display-list>
    `;
  }

  static get properties() {
    return {
      interventionId: Number,
      paginator: Object,
      prevParams: Object,
      active: Boolean,
      initComplete: Boolean
    };
  }

  private _debounceUrlUpdate!: Debouncer;

  static get observers() {
    return [
      '_init(active)',
      '_updateURL(paginator.page, paginator.page_size, interventionId, initComplete)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    /**
      * Disable loading message for reports tab elements load,
      * triggered by parent element on stamp or by tap event on tabs
      */
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'interv-page'});
    fireEvent(this, 'tab-content-attached');
  }

  _init(active: boolean) {
    this.set('initComplete', false);
    if (!active) {
      return;
    }

    const page = (this.prevParams && this.prevParams.page) ? Number(this.prevParams.page) : 1;
    const pageSize = (this.prevParams && this.prevParams.page_size) ? Number(this.prevParams.page_size) : 10;
    this.set('paginator.page', page);
    this.set('paginator.page_size', pageSize);

    this.set('initComplete', true);
  }

  _updateURL(page: string, pageSize: number, interventionId: string, initComplete: boolean) {
    if (typeof page === 'undefined' || typeof pageSize === 'undefined') {
      return;
    }
    if (!initComplete || !interventionId) {
      return;
    }
    if (!isEmptyObject(this.prevParams) && page === this.prevParams.page &&
        pageSize === this.prevParams.page_size) {
      // avoid multiple url updates with the same params
      return;
    }

    this._debounceUrlUpdate = Debouncer.debounce(this._debounceUrlUpdate,
      timeOut.after(20),
      () => {
        // prevent url change if active is changed to false before debounce func is executed
        if (!this.active) {
          return;
        }
        const qs = 'page=' + page + '&' + 'page_size=' + pageSize;
        updateAppState('interventions/' + interventionId + '/reports', qs, true);
        this.set('prevParams', Object.assign({}, {page: page, page_size: pageSize}));
      });
  }
}

window.customElements.define('intervention-reports', InterventionReports);
