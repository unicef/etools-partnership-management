import {html, LitElement} from 'lit';
import {property} from 'lit/decorators.js';

/**
 * @LitElement
 * @customElement
 */
class PageContentHeader extends LitElement {
  static get is() {
    return '';
  }

  render() {
    // language=HTML
    return html`
      <style>
        *[hidden] {
          display: none !important;
        }

        :host {
          position: sticky;
          top: 0;
          z-index: 121;
          width: 100%;
          box-sizing: border-box;
          display: block;
          background-color: var(--primary-background-color);
          min-height: 65px;
          border-bottom: 1px solid var(--darker-divider-color);
          padding-top: 24px;
        }

        :host([with-tabs-visible]) {
          min-height: 114px;
        }

        .content-header-row {
          display: flex;
          flex-direction: row;
          justify-content: center;
          flex-wrap: wrap;
          flex: 1;
          align-items: center;
          padding-top: 5px;
          padding-bottom: 5px;
          padding-inline: 24px 12px;
        }

        .content-header-row h1 {
          margin: 0;
          font-weight: normal;
          text-transform: capitalize;
          font-size: var(--etools-font-size-24, 24px);
          line-height: var(--etools-font-size-24, 24px);
          min-height: 31px;
        }

        .title {
          padding-inline-end: 20px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: normal;
        }

        .flex-block {
          max-width: 100%;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          flex: 1;
        }

        .flex-block > * {
          margin: 7px 0 !important;
        }
        .content-header-row.tabs {
          padding-bottom: 0;
          display: block;
        }
        @media print {
          :host {
            padding: 0;
          }

          .content-header-row h1 {
            font-size: var(--etools-font-size-18, 18px);
            line-height: var(--etools-font-size-18, 18px);
          }
        }

        @media (max-width: 770px) {
          .title {
            flex: 100%;
            max-width: 100%;
          }
          .content-header-row h1 {
            display: block;
          }
        }

        @media (max-width: 576px) {
          :host {
            padding: 0 5px;
          }
        }

        @media (max-width: 450px) {
          :host {
            position: relative;
          }
        }
      </style>

      <div class="content-header-row">
        <div class="flex-block">
          <h1 class="title">
            <slot name="page-title"></slot>
          </h1>
        </div>
        <div class="row-actions">
          <slot name="title-row-actions"></slot>
        </div>
      </div>

      <div class="content-header-row tabs" ?hidden="${!this.withTabsVisible}">
        <slot name="tabs"></slot>
      </div>
    `;
  }

  @property({type: Boolean})
  withTabsVisible = false;
}

window.customElements.define('page-content-header', PageContentHeader);
