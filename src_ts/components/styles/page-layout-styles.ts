import {html} from '@polymer/polymer/polymer-element.js';

// language=HTML
export const pageLayoutStyles = html`
  <style>
    /* HD res: 1360/1366 x 768*/
    /* Styles for etools-status transition between vetical/horizontal*/
    @media only screen and (max-width: 1359px) {
      #sidebar {
        width: 100% !important;
        padding-left: 0 !important;
        margin-bottom: 24px !important;
      }

      #main {
        flex-direction: column-reverse !important;
      }
    }

    @media only screen and (min-width: 1360px) {
      #pageContent {
        @apply --layout-flex;
        flex: 1 1 auto;
        -ms-flex: 1 1 auto;
        -webkit-flex: 1 1 auto;
        min-width: 0px;
      }
    }

    /* -------------------*/

    [hidden] {
      display: none;
    }

    #main {
      @apply --layout-horizontal;
      flex-wrap: nowrap;
      -ms-flex-wrap: none;
      -webkit-flex-wrap: nowrap;
      padding: 24px;
    }

    #pageContent {
      width: 100%;
    }

    #sidebar {
      @apply --layout;
      width: 224px;
      flex: 0 0 224px;
      -ms-flex: 0 0 224px;
      -webkit-flex: 0 0 224px;
      min-width: 0px;
      padding-left: 24px;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
    }

    @media print {
      #main {
        padding: 0;
      }
    }
  </style>`;
