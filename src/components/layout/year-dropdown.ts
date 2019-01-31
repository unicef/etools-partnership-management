import { PolymerElement, html } from '@polymer/polymer';
import 'etools-dropdown/etools-dropdown.js'
import {SharedStyles} from '../styles/shared-styles.js';
import {requiredFieldStarredStyles} from '../styles/required-field-styles.js';

/**
 *
 * @polymer
 * @customElement
 */
class YearDropdown extends PolymerElement {

  static get template() {
    return html`
      ${SharedStyles} ${requiredFieldStarredStyles}
      <style>

        :host {
          display: block;
          box-sizing: border-box;
          width: 105px;
        }

        :host(:hover) {
          cursor: pointer;
        }

        etools-dropdown {
          max-width: 100%;
        }

      </style>

      <etools-dropdown id="yearSelector"
                      label="[[label]]"
                      options="[[years]]"
                      selected="{{selectedYear}}"
                      allow-outside-scroll
                      hide-search
                      required auto-validate
                      error-message="Year is required">
      </etools-dropdown>
    `;
  }

  static get properties() {
    return {
      label: {
        type: String,
        value: 'Year'
      },
      selectedYear: {
        type: Number,
        notify: true
      },
      years: {
        type: Array,
        value: []
      }
    };
  }

  ready() {
    super.ready();
    let year = this._getCurrentYear();
    let optYears = [];
    for (let i = year - 5; i <= year + 5; i++) {
      optYears.push({value: i, label: i});
    }

    this.set('years', optYears);
  }

  _getCurrentYear() {
    return new Date().getFullYear();
  }

  validate() {
    return this.$.yearSelector.validate();
  }

}

window.customElements.define('year-dropdown', YearDropdown);
