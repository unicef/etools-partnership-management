import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {timeOut} from '@polymer/polymer/lib/utils/async.js';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce.js';

import '@polymer/paper-tabs/paper-tabs';

import {property} from '@polymer/decorators';
import {EtoolsTab} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 */
class EtoolsTabs extends PolymerElement {
  public static get template() {
    // main template
    // language=HTML
    return html`
      <style>
        *[hidden] {
          display: none !important;
        }

        :host {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
        }

        :host([border-bottom]) {
          border-bottom: 1px solid var(--darker-divider-color);
        }

        paper-tabs {
          --paper-tabs-selection-bar-color: var(--primary-color);
        }

        paper-tab[link],
        paper-tab {
          --paper-tab-ink: var(--primary-color);
          padding: 0 24px;
        }

        paper-tab .tab-content {
          color: var(--dark-secondary-text-color);
          text-transform: uppercase;
        }

        paper-tab.iron-selected .tab-content {
          color: var(--primary-color);
        }

        @media print {
          :host {
            display: none;
          }
        }
      </style>

      <paper-tabs
        id="tabs"
        selected="{{activeTab}}"
        attr-for-selected="name"
        noink
        on-iron-select="_handleTabSelection"
      >
        <template is="dom-repeat" items="[[tabs]]">
          <paper-tab name$="[[item.tab]]" link hidden$="[[item.hidden]]">
            <span class="tab-content">
              [[item.tabLabel]]
              <template is="dom-if" if="[[item.showTabCounter]]" restamp>
                ([[item.counter]])
              </template>
            </span>
          </paper-tab>
        </template>
      </paper-tabs>
    `;
  }

  @property({type: String, notify: true})
  activeTab: string | null = null;

  @property({type: Array})
  tabs: EtoolsTab[] = [];

  private _debouncer: Debouncer | null = null;

  static get observers() {
    return ['notifyTabsResize(tabs.*)'];
  }

  _handleTabSelection() {
    this.notifyTabsResize();
  }

  notifyTabsResize(tabsChange?: any) {
    if (!tabsChange) {
      return;
    }

    this._debouncer = Debouncer.debounce(this._debouncer, timeOut.after(50), () => (this.$.tabs as any).notifyResize());
  }
}

window.customElements.define('etools-tabs', EtoolsTabs);
