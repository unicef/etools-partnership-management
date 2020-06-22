import {html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

// language=HTML
export const buttonsStyles = html` <style>
  :host > * {
    --primary-button-default: {
      color: var(--light-primary-text-color, #fff);
      font-weight: bold;
      padding: 5px 10px;
    }

    --primary-button-with-prefix: {
      padding: 5px 10px 5px 16px;
    }
  }

  .buttons-section {
    border-top: 1px solid var(--dark-divider-color);
    padding: 24px;
  }
  .buttons-section.horizontal {
    @apply --layout-horizontal;
  }
  .buttons-section.vertical {
    @apply --layout-vertical;
  }

  .buttons-section.vertical .primary-btn:not(:first-of-type) {
    margin-top: 16px;
  }

  .primary-btn {
    background-color: var(--primary-color);
    --paper-button: {
      @apply --primary-button-default;
    }
  }

  .danger-btn {
    background-color: var(--error-color);
  }

  .warning-btn {
    background-color: var(--warning-color);
  }

  .success-btn {
    background-color: var(--success-color);
  }

  .primary-btn.with-prefix {
    --paper-button: {
      @apply --primary-button-default;
      @apply --primary-button-with-prefix;
    }
  }
  paper-button .btn-label {
    @apply --layout-horizontal;
    @apply --layout-flex;
    @apply --layout-center-justified;
  }

  paper-button.w100 {
    width: 100%;
    margin-right: 0;
    margin-left: 0;
  }

  .secondary-btn-wrapper {
    width: 100%;
    --paper-input-container-input: {
      @apply --basic-btn-style;
    }
  }

  .secondary-btn {
    --paper-button: {
      @apply --basic-btn-style;
    }
  }

  .secondary-btn iron-icon {
    margin-right: 5px;
  }

  .white-btn {
    background-color: white;
    --paper-button: {
      color: var(--primary-color);
    }
    font-weight: bold;
  }

  /* responsive css rules */
  @media (min-width: 850px) {
  }
</style>`;
