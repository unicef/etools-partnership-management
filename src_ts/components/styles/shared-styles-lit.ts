import {html} from 'lit';

export const sharedStyles = html`
  <style>
    *[hidden] {
      display: none !important;
    }
    .layout-vertical,
    .layout-horizontal {
      padding: 16px 24px;
    }

    h1 {
      font-size: var(--etools-font-size-24, 24px);
      margin: 16px 0;
      color: var(--primary-text-color);
    }

    a {
      text-decoration: inherit;
      color: inherit;
    }

    a.primary {
      color: var(--primary-color);
    }

    a:focus {
      outline: inherit;
    }

    app-toolbar {
      height: var(--toolbar-height);
    }

    #tabs {
      height: 48px;
    }

    paper-tabs {
      color: var(--light-primary-text-color);
      --paper-tabs: {
        font-size: var(--etools-font-size-14, 14px);
        font-weight: 500;
        text-transform: uppercase;
      }
    }

    paper-tabs > * {
      --paper-tab-ink: var(--primary-color);
      --paper-tab-content-unselected: {
        color: var(--light-secondary-text-color);
      }
    }

    .tab-link {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    paper-item {
      font-size: var(--etools-font-size-15, 15px);
      white-space: nowrap;
    }

    div[elevation] {
      padding: 15px 20px;
      background-color: var(--primary-background-color);
    }

    etools-icon.dark {
      --etools-icon-fill-color: var(--dark-icon-color);
    }

    etools-icon.light {
      --etools-icon-fill-color: var(--light-icon-color);
    }

    etools-icon-button.dark {
      color: var(--dark-icon-color);
      --etools-icon-button-ink-color: var(--dark-ink-color);
    }

    etools-icon-button.light {
      color: var(--light-icon-color);
      --etools-icon-button-ink-color: var(--light-ink-color);
    }

    .dropdown-with-clear-btn etools-icon-button.clear,
    .dropdown-with-clear-btn etools-icon-button.remove,
    etools-icon-button.remove-field.remove {
      --etools-icon-font-size: var(--etools-font-size-35, 35px);
      top: 10px;
    }

    .dropdown-with-clear-btn etools-icon-button.remove,
    etools-icon-button.remove-field.remove {
      color: var(--icon-delete-color);
    }

    .dropdown-with-clear-btn {
      display: flex;
      align-items: center;
    }

    paper-input {
      --paper-input-prefix: {
        margin-top: -5px;
        margin-inline-end: 10px;
        color: var(--dark-secondary-text-color);
      }
      --paper-input-suffix: {
        margin-top: -5px;
        margin-inline-start: 10px;
        color: var(--dark-secondary-text-color);
      }
    }
    paper-dropdown-menu paper-item {
      cursor: pointer;
    }

    /* paper input readonly state */
    paper-input[readonly],
    paper-textarea[readonly],
    datepicker-lite[readonly],
    etools-dropdown[readonly],
    etools-dropdown-multi[readonly],
    etools-currency[readonly],
    .form-field-wrapper {
      --paper-input-container-underline: {
        display: none;
      }
      --paper-input-container-underline-focus: {
        display: none;
      }
      --paper-input-char-counter: {
        display: none;
      }

      width: 100%;
    }

    paper-input,
    paper-input-container {
      --paper-input-container-input: {
        min-height: 23px; /* IE11 fix - letter 'g' is cut off */
      }
    }

    etools-dropdown,
    etools-dropdown-multi {
      --paper-input-container-input: {
        text-overflow: ellipsis;
      }
    }

    paper-input.right-to-left {
      text-align: right;
      --paper-input-container-input: {
        direction: rtl;
        unicode-bidi: bidi-override;
      }
    }

    .custom-field-wrapper {
      padding: 8px 0;
    }

    datepicker-lite {
      --paper-input-prefix: {
        color: var(--dark-secondary-text-color);
      }
    }

    .capitalize {
      text-transform: capitalize;
    }

    .paper-label {
      font-size: var(--etools-font-size-12, 12px);
      color: var(--secondary-text-color);
      padding-top: 8px;
    }

    .input-label {
      min-height: 24px;
      padding-top: 4px;
      min-width: 0;
    }

    .input-label[empty]::after {
      content: '—';
      color: var(--secondary-text-color);
    }
    .placeholder-style {
      color: var(--secondary-text-color);
      font-size: var(--etools-font-size-16, 16px);
    }

    /* responsive css rules */
    @media (min-width: 850px) {
    }
    .w100 {
      width: 100%;
    }
    .header-text {
      font-size: var(--etools-font-size-12, 12px);
      color: var(--list-secondary-text-color, #757575);
      font-weight: bold;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    .p-relative {
      position: relative;
    }

    .break-word {
      word-break: break-word;
      word-wrap: break-word; /* for IE */
      width: 100%;
    }

    etools-content-panel::part(ecp-header) {
      background-color: var(--primary-background-color);
      border-bottom: 1px groove var(--dark-divider-color);
    }

    etools-content-panel::part(ecp-header-title) {
      font-size: var(--etools-font-size-18, 18px);
      font-weight: 500;
      text-align: left;
    }

    etools-content-panel::part(ecp-content) {
      padding: 0;
      overflow: hidden;
    }
  </style>
`;
