import {html} from 'lit';

// language=HTML
export const headerDropdownStyles = html`
  <style>
    *[hidden] {
      display: none !important;
    }

    :host {
      display: block;
      --sl-spacing-small: 0;
    }

    :host(:hover) {
      cursor: pointer;
    }

    :host([dir='rtl']) etools-dropdown {
      --paper-input-container-shared-input-style_-_max-width: 75px;
    }

    etools-dropdown::part(display-input) {
      text-align: end;
    }

    countries-dropdown[dir='rtl'] {
      margin-inline: 30px 20px;
    }

    organizations-dropdown {
      width: 180px;
    }

    countries-dropdown {
      width: 160px;
    }

    #languageSelector {
      width: 120px;
      margin-inline-start: auto;
    }

    .w100 {
      width: 100%;
    }

    etools-dropdown.warning::part(combobox) {
      outline: 1.5px solid red !important;
      padding: 4px;
    }

    etools-dropdown::part(display-input)::placeholder {
      color: var(--sl-input-color);
      opacity: 1;
    }

    etools-dropdown::part(display-input)::-ms-input-placeholder {
      /* Edge 12-18 */
      color: var(--sl-input-color);
    }

    @media (max-width: 768px) {
      etools-dropdown {
        min-width: 110px;
        width: 130px;
      }
      organizations-dropdown {
        width: 110px;
      }

      countries-dropdown {
        width: 110px;
      }
    }
    @media (max-width: 1024px) {
      .envWarning {
        display: none;
      }
      .envLong {
        display: none;
      }
      etools-profile-dropdown {
        width: 40px;
      }
    }

    @media (max-width: 820px) {
      .dropdowns {
        order: 1;
        margin-top: 0;
      }
      app-toolbar {
        height: auto;
        padding-inline-end: 0px;
        margin: 0 !important;
      }
    }
  </style>
`;
