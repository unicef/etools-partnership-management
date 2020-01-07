import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @customElement
 */
class PageContentHeader extends PolymerElement {
  static get is() {
    return 'page-content-header';
  }

  static get template() {
    // language=HTML
    return html`
      <style>
        *[hidden] {
          display: none !important;
        }

        :host {
          @apply --layout-vertical;
          @apply --layout-start-justified;
          @apply --layout-flex;

          background-color: var(--primary-background-color);
          padding: 0 24px;
          min-height: 85px;
          border-bottom: 1px solid var(--darker-divider-color);
        }

        :host([with-tabs-visible]) {
          min-height: 114px;
        }

        .content-header-row {
          @apply --layout-horizontal;
          @apply --layout-start-justified;
        }

        .title-row {
          @apply --layout-center;
          margin: 30px 0 0;
          padding: 0 24px;
        }

        .title-row h1 {
          @apply --layout-flex;
          @apply --page-title;
        }

        .tabs {
          margin-top: 5px;
        }

        @media print {
          :host {
            padding: 0;
            border-bottom: none;
            min-height: 0 !important;
            margin-bottom: 16px;
          }

          .title-row h1 {
            font-size: 18px;
          }
        }

        @media (max-width: 576px) {
          :host {
            padding: 0 5px;
          }
          .title-row {
            padding: 0 5px 5px 5px;
          }
        }

      </style>

      <div class="content-header-row title-row">
        <h1>
          <slot name="page-title"></slot>
        </h1>
        <slot name="title-row-actions"></slot>
      </div>

      <div class="content-header-row tabs" hidden$="[[!withTabsVisible]]">
        <slot name="tabs"></slot>
      </div>
    `;
  }

  @property({type: Boolean, reflectToAttribute: true})
  withTabsVisible: boolean = false;

}

window.customElements.define(PageContentHeader.is, PageContentHeader);
