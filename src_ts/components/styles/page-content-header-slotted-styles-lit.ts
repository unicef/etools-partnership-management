import {html} from 'lit';

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
</style>`;
