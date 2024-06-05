import {html} from 'lit';

// language=HTML
export const pageLayoutStyles = html` <style>
  /* HD res: 1360/1366 x 768*/
  /* Styles for etools-status transition between vetical/horizontal*/
  @media only screen and (max-width: 1359px) {
    #sidebar {
      width: 100% !important;
      padding-inline-start: 0 !important;
      margin-bottom: 24px !important;
    }

    #main {
      flex-direction: column-reverse !important;
    }
  }

  @media only screen and (min-width: 1360px) {
    #pageContent {
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
    display: flex;
    flex-wrap: nowrap;
    -ms-flex-wrap: none;
    -webkit-flex-wrap: nowrap;
    padding: 24px;
  }

  #pageContent {
    width: 100%;
    z-index: 2;
  }

  #sidebar {
    display: flex;
    width: 224px;
    flex: 0 0 224px;
    -ms-flex: 0 0 224px;
    -webkit-flex: 0 0 224px;
    min-width: 0px;
    padding-inline-start: 24px;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    z-index: 2;
  }

  @media print {
    #main {
      padding: 0;
    }
  }
  @media (max-width: 576px) {
    #main {
      padding: 5px;
    }
  }
</style>`;
