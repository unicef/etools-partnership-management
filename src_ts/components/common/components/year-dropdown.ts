import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {html, LitElement, property} from 'lit-element';

/**
 *
 * @polymer
 * @customElement
 */
class YearDropdown extends LitElement {
  render() {
    return html`
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

      <etools-dropdown
        id="yearSelector"
        .label="${this.label}"
        .options="${this.years}"
        .selected="${this.selectedYear}"
        allow-outside-scroll
        hide-search
        required
        auto-validate
        error-message="Year is required"
      >
      </etools-dropdown>
    `;
  }

  @property({type: String})
  label = 'Year';

  @property({type: Number})
  selectedYear!: number;

  @property({type: Array})
  years: any[] = [];

  connectedCallback() {
    super.connectedCallback();
    const year = this._getCurrentYear();
    const optYears = [];
    for (let i = year - 5; i <= year + 5; i++) {
      optYears.push({value: i, label: i});
    }

    this.years = optYears;
  }

  _getCurrentYear() {
    return new Date().getFullYear();
  }

  validate() {
    return (this.shadowRoot?.querySelector('#yearSelector') as EtoolsDropdownEl).validate();
  }
}

window.customElements.define('year-dropdown', YearDropdown);
