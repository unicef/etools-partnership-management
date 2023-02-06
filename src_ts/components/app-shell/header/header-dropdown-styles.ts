import {html} from 'lit-element';

// language=HTML
export const headerDropdownStyles = html`
  <style>
    *[hidden] {
      display: none !important;
    }

    :host {
      display: block;
    }

    :host(:hover) {
      cursor: pointer;
    }

    :host([dir='rtl']) etools-dropdown {
      --paper-input-container-shared-input-style_-_max-width: 75px;
    }

    etools-dropdown {
      --paper-listbox: {
        max-height: 600px;
      }

      --esmm-icons: {
        color: var(--light-secondary-text-color);
        cursor: pointer;
      }

      --paper-input-container-underline: {
        display: none;
      }

      --paper-input-container-underline-focus: {
        display: none;
      }

      --paper-input-container-shared-input-style: {
        color: var(--light-secondary-text-color);
        cursor: pointer;
        font-size: 16px;
        text-align: right;
        width: 100%;
      }
    }

    countries-dropdown[dir='rtl'] {
      margin-inline: 30px 20px;
    }

    etools-dropdown::placeholder {
      color: red;
      opacity: 1;
    }

    countries-dropdown,
    organizations-dropdown {
      width: 180px;
      margin-inline-start: 5px;
    }

    #languageSelector {
      width: 120px;
    }

    .w100 {
      width: 100%;
    }

    etools-dropdown.warning {
      --paper-input-container: {
        padding-left: 3px;
        box-sizing: border-box;
        box-shadow: inset 0px 0px 0px 1.5px red;
      }
    }

    @media (max-width: 768px) {
      etools-dropdown {
        min-width: 130px;
        width: 130px;
      }
    }
  </style>
`;
