import {html} from '@polymer/polymer/polymer-element.js';

// language=HTML
export const pageContentHeaderSlottedStyles = html` <style>
  .content-header-actions {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    place-content: flex-end;
    flex-wrap: wrap;
  }

  @media (max-width: 576px) {
    .content-header-actions {
      --layout-horizontal_-_display: block;
    }
  }

  .content-header-actions .action {
    display: flex;
    flex-direction: row;
    align-items: flex-end;
  }

  .content-header-actions paper-menu-button {
    --paper-menu-button: {
      padding: 0;
    }
  }

  .content-header-actions paper-button:not(.primary-btn) {
    padding: var(--primary-button-default_-_padding);
    font-size: 16px;
    font-weight: bold;
    color: var(--dark-secondary-text-color);
  }

  paper-button.focus-as-link {
    --paper-button-flat-keyboard-focus: {
      outline: 0;
      box-shadow: 0 0 10px 10px rgb(170 165 165 / 20%) !important;
      background-color: rgba(170, 165, 165, 0.2);
    }
  }

  .content-header-actions paper-button iron-icon {
    margin-right: 10px;
  }
</style>`;
