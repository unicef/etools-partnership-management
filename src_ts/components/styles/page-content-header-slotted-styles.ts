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

  .content-header-actions paper-button:not(.primary-btn) {
    padding-top: 0;
    padding-bottom: 0;
    font-size: 16px;
    font-weight: bold;
    color: var(--dark-secondary-text-color);
  }

  .content-header-actions paper-button iron-icon {
    margin-right: 10px;
  }
</style>`;
