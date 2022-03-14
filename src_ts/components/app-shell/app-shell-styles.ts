import {appDrawerStyles} from './menu/styles/app-drawer-styles';
import {html} from 'lit-element';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {buttonsStyles} from '../styles/buttons-styles-lit';
import {pageLayoutStyles} from '../styles/page-layout-styles-lit';

// language=HTML
export const AppShellStyles = html`
  ${pageLayoutStyles} ${sharedStyles} ${buttonsStyles} ${appDrawerStyles}
  <style>
    :host {
      display: block;
    }

    app-header-layout {
      position: relative;
    }

    .page {
      display: none;
    }

    .page[active] {
      display: block;
    }

    #floating-footer {
      background-color: var(--amendment-mode-color);
      color: var(--light-primary-text-color);
      box-sizing: border-box;
      padding: 12px 12px 12px 65px;
      position: fixed;
      bottom: 0;
      width: calc(100% - var(--app-drawer-width, 0px)); /* 0px instead of 0 is an IE requirement */
      z-index: 52; /* paper-buttons have a z-index of 51 */
    }

    /* TODO: polymer2 - make amendment mode as a new module with mixin file and style file */
    #page-container.in-amendment {
      border-top: 12px solid var(--amendment-mode-color);
      border-left: 12px solid var(--amendment-mode-color);
      border-right: 12px solid var(--amendment-mode-color);
    }

    #page-container.in-amendment {
      padding-bottom: 48px;
    }

    @media print {
      #drawer,
      app-header,
      #floating-footer {
        display: none;
      }

      app-drawer-layout {
        --app-drawer-width: 0 !important;
        margin-top: -60px; /* eliminate 60px top margin set by header */
      }

      #appHeadLayout {
        width: 100%;
      }

      #page-container.in-amendment {
        border: none;
      }
    }
  </style>
`;
