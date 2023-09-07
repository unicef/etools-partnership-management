import {html} from 'lit';

// language=HTML
export const listFilterStyles = html` <style>
  #filters {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 8px 24px;
    margin-bottom: 24px;
    box-sizing: border-box;
    min-height: 62px;
    height: auto;
  }

  #filters.paper-material[elevation='1'] {
    background-color: var(--list-secondary-color, #ffffff);
  }

  #filters-fields {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    flex: 1;
    margin-inline-end: auto;
  }

  #filters-fields .filter {
    min-width: 160px;
    width: auto;
    min-height: 62px;
    height: auto;
  }

  #filters-fields etools-dropdown.filter {
    /* TODO: 160px as requested makes etools-dropdown a little bit too small, no resize here...
      we might need to change this in the future (used only on reports filters) */
    width: 160px;
  }

  #filters-fields #query {
    --paper-input-container: {
      width: 280px;
    }
    min-width: 280px;
  }

  #filters-fields .filter.date {
    --paper-input-container: {
      width: 182px;
    }
    min-width: 180px;
  }

  #filters-fields > *:not(:last-child) {
    margin-inline-end: 16px;
  }

  #hiddenToggle {
    display: flex;
    flex-direction: row;
    align-items: center;
    cursor: pointer;
    font-weight: normal;
    font-size: 16px;
  }

  .fixed-controls {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-self: stretch;
    padding-inline-start: 8px;
    margin-top: 8px;
    margin-bottom: 8px;
    margin-inline-start: 24px;
    border-inline-start: 2px solid var(--list-divider-color, #9d9d9d);
  }

  #filterMenu {
    max-width: 126px;
    padding: 0;
    --paper-menu-button-content: {
      overflow-x: hidden !important;
    }
  }

  #filterMenu .button {
    color: var(--list-primary-color, #40c4ff);
    font-weight: 500;
    margin: 0;
  }

  #filterMenu .button iron-icon {
    margin-inline-end: 5px;
  }

  #filterMenu paper-listbox {
    min-width: 250px;
  }

  #filterMenu paper-icon-item {
    --paper-item-icon-width: auto;

    --paper-item-selected: {
      font-weight: normal !important;
    }
  }

  #filterMenu paper-icon-item[selected] {
    font-weight: normal !important;
    background: var(--esmm-list-item-selected-color, #dcdcdc);
    --paper-item-icon: {
      margin-inline-end: 16px;
    }
  }

  paper-icon-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: wrap;
    min-height: 48px;
    box-sizing: border-box;
    width: 100%;
  }

  .clear-all-filters {
    min-height: 48px;
    display: flex;
    flex-direction: row;
    align-items: center;
    color: var(--primary-color);
    padding-inline-end: 16px;
    border-bottom: 1px solid var(--list-divider-color, #9d9d9d);
  }

  @media (max-width: 576px) {
    #filters {
      -ms-flex-direction: column;
      -webkit-flex-direction: column;
      flex-direction: column;
    }
    #filters-fields #query {
      --paper-input-container_-_width: 100%;
    }
    #filters-fields .filter,
    #filters-fields etools-dropdown.filter,
    #filters-fields .filter.date {
      width: 100%;
    }
    .fixed-controls {
      border-inline-start: none;
      padding-inline-start: 8px;
      margin-top: 0;
      margin-bottom: 0;
      margin-inline-start: 0;
      margin: 0 auto;
      padding: 0px;
    }
  }
</style>`;
