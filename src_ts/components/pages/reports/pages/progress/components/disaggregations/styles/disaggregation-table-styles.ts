import {html} from 'lit-element';

export const disaggregationTableStyles = html` <style>
  :host {
    display: block;
  }

  .container {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }
  .item {
    padding: 10px;
  }

  table {
    text-align: center;
    font-size: 13px;
  }

  /*  Text above the table  */
  h4 {
    font-weight: 400;
    color: var(--paper-grey-600);
    margin: 0 0 15px 0;
  }
  h4 strong {
    color: var(--paper-grey-800);
  }
  span.total {
    float: right;
    padding-inline-start: 15px;
  }

  /*   Table header    */
  .headerRow,
  th {
    font-weight: 400;
    padding: 5px 0;
    background-color: #f0f0f0;
  }

  /*   Rows   */
  tr {
    display: flex;
    flex-direction: row;
    align-items: center;
    border-bottom: 1px solid white;
  }

  .totalsRow,
  .totalsRow td {
    background-color: #f0f0f0;
  }

  .outerRow,
  .outerRow td {
    background-color: var(--theme-table-bg-secondary, #c4e3f7);
  }

  .middleRow {
    background-color: var(--theme-table-bg-primary, #edf8ff);
  }
  /*   Totals table (three disaggregations only)   */
  .bottomRow td:not(:first-child) {
    background-color: #f0f0f0;
  }

  /*   Cells   */
  td,
  th {
    min-width: 40px;
    min-height: 25px;
    word-wrap: break-word;
    hyphens: auto;
    flex: 1;
    align-self: stretch;
    align-items: center;
  }

  .cellValue {
    display: inline-block;
    line-height: 25px;
  }

  td:first-child {
    border-inline-start: 1px solid white;
  }

  td:not(:last-child) {
    border-inline-end: 1px solid white;
  }

  .cellTitle,
  .cellTotal {
    background-color: var(--paper-grey-100);
  }
</style>`;
