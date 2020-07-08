import {html} from '@polymer/polymer/polymer-element.js';

export const SharedStyles = html`
  <style>
    *[hidden] {
      display: none !important;
    }

    h1 {
      font-size: 25px;
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
        font-size: 14px;
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
      @apply --layout-horizontal;
      @apply --layout-center-center;
    }

    paper-item {
      font-size: 15px;
      white-space: nowrap;
    }

    div[elevation] {
      padding: 15px 20px;
      background-color: var(--primary-background-color);
    }

    iron-icon.dark {
      --iron-icon-fill-color: var(--dark-icon-color);
    }

    iron-icon.light {
      --iron-icon-fill-color: var(--light-icon-color);
    }

    paper-icon-button.dark {
      color: var(--dark-icon-color);
      --paper-icon-button-ink-color: var(--dark-ink-color);
    }

    paper-icon-button.light {
      color: var(--light-icon-color);
      --paper-icon-button-ink-color: var(--light-ink-color);
    }

    .dropdown-with-clear-btn paper-icon-button.clear,
    .dropdown-with-clear-btn paper-icon-button.remove,
    paper-icon-button.remove-field.remove {
      width: 35px;
      height: 35px;
      top: 10px;
    }

    .dropdown-with-clear-btn paper-icon-button.remove,
    paper-icon-button.remove-field.remove {
      color: var(--icon-delete-color);
    }

    .dropdown-with-clear-btn {
      @apply --layout-horizontal;
      @apply --layout-center;
    }

    paper-input {
      --paper-input-prefix: {
        margin-top: -5px;
        margin-right: 10px;
        color: var(--dark-secondary-text-color);
      }
      --paper-input-suffix: {
        margin-top: -5px;
        margin-left: 10px;
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
    etools-currency-amount-input[readonly],
    .form-field-wrapper {
      --paper-input-container-underline: {
        display: none;
      }
      --paper-input-container-underline-focus: {
        display: none;
      }
      --paper-input-container-underline-disabled: {
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

    paper-checkbox {
      --paper-checkbox-ink-size: 0;
    }

    paper-radio-button {
      --paper-radio-button-ink-size: 0;
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
      font-size: 12px;
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
      font-size: 16px;
    }

    /* responsive css rules */
    @media (min-width: 850px) {
    }
    .w100 {
      width: 100%;
    }
    .header-text {
      font-size: 12px;
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
  </style>
`;
