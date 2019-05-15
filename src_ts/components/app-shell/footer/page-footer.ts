import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import { property } from '@polymer/decorators';

/**
 * page footer element
 * @polymer
 * @customElement
 */
class PageFooter extends PolymerElement {

  public static get template() {
    // main template
    // language=HTML
    return html`
      <style>
        :host {
          @apply --layout-vertical;
          @apply --layout-flex;
          @apply --layout-end-justified;
          padding: 18px 24px;
          width: 100%;
          min-height: 90px;
          box-sizing: border-box;
        }

        #footer-content {
          @apply --layout-horizontal;
        }

        #unicef-logo {
          @apply --layout-horizontal;
          @apply --layout-inline;
          padding-right: 30px;
        }

        #unicef-logo img {
          height: 28px;
          width: 118px;
        }

        .footer-link {
          margin: auto 16px;
          color: var(--secondary-text-color);
          text-decoration: none;
        }

        .footer-link:first-of-type {
          margin-left: 30px;
        }

        @media print {
          :host {
            display: none;
          }
        }

      </style>
      <footer>
        <div id="footer-content">
        <span id="unicef-logo">
          <img src$="[[rootPath]]images/UNICEF_logo.png" alt="UNICEF logo">
        </span>
          <!-- TODO: modify span to a with proper href values after footer pages are ready -->
          <!--   <span class="footer-link">Contact</span>
            <span class="footer-link">Disclaimers</span>
            <span class="footer-link">Privacy Policy</span> -->
        </div>
      </footer>
    `;
  }

  @property({type: String})
  rootPath!: string;

}

window.customElements.define('page-footer', PageFooter);
