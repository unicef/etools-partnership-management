import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/maps-icons.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-ripple/paper-ripple.js';

import './styles/nav-menu-styles.js';
import {fireEvent} from '../../utils/fire-custom-event.js';

/**
 * PMP main menu
 * @polymer
 * @customElement
 * @appliesMixin GestureEventListeners
 */
class AppMenu extends GestureEventListeners(PolymerElement) {

  public static get template() {
    // main template
    // language=HTML
    return html`
      <style include="nav-menu-styles"></style>

      <div class="menu-header">
      <span id="app-name">
        Frontend <br>
        Template
      </span>

        <span class="ripple-wrapper main">
        <iron-icon id="menu-header-top-icon"
                   icon="assignment-ind"
                   on-tap="_toggleSmallMenu"></iron-icon>
        <paper-ripple class="circle" center></paper-ripple>
      </span>

        <paper-tooltip for="menu-header-top-icon" position="right">
          Frontend Template
        </paper-tooltip>

        <span class="ripple-wrapper">
        <iron-icon id="minimize-menu"
                   icon="chevron-left"
                   on-tap="_toggleSmallMenu"></iron-icon>
        <paper-ripple class="circle" center></paper-ripple>
      </span>
      </div>

      <div class="nav-menu">
        <iron-selector selected="[[selectedOption]]"
                       attr-for-selected="menu-name"
                       selectable="a"
                       role="navigation">

          <a class="nav-menu-item" menu-name="page-one" href$="[[rootPath]]page-one">
            <iron-icon id="page1-icon" icon="accessibility"></iron-icon>
            <paper-tooltip for="page1-icon" position="right">
              Page One
            </paper-tooltip>
            <div class="name">Page One</div>
          </a>

          <a class="nav-menu-item" menu-name="page-two" href$="[[rootPath]]page-two">
            <iron-icon id="page2-icon" icon="extension"></iron-icon>
            <paper-tooltip for="page2-icon" position="right">
              Page Two
            </paper-tooltip>
            <div class="name">Page Two</div>
          </a>
          
        </iron-selector>

        <div class="nav-menu-item section-title">
          <span>eTools Community Channels</span>
        </div>

        <a class="nav-menu-item lighter-item" href="http://etools.zendesk.com" target="_blank">
          <iron-icon id="knoledge-icon" icon="maps:local-library"></iron-icon>
          <paper-tooltip for="knoledge-icon" position="right">
            Knowledge base
          </paper-tooltip>
          <div class="name">Knowledge base</div>
        </a>

        <a class="nav-menu-item lighter-item"
           href="https://www.yammer.com/unicef.org/#/threads/inGroup?type=in_group&feedId=5782560"
           target="_blank">
          <iron-icon id="discussion-icon" icon="icons:question-answer"></iron-icon>
          <paper-tooltip for="discussion-icon" position="right">
            Discussion
          </paper-tooltip>
          <div class="name">Discussion</div>
        </a>

        <a class="nav-menu-item lighter-item last-one" href="http://etoolsinfo.unicef.org" target="_blank">
          <iron-icon id="information-icon" icon="icons:info"></iron-icon>
          <paper-tooltip for="information-icon" position="right">
            Information
          </paper-tooltip>
          <div class="name">Information</div>
        </a>

      </div>
    `;
  }

  public static get properties() {
    return {
      selectedOption: String,
      rootPath: String,
      smallMenu: {
        type: Boolean,
        reflectToAttribute: true,
        observer: '_menuSizeChange'
      }
    };
  }

  public selectedOption: string = '';
  public rootPath: string = '';
  public smallMenu: boolean = false;

  // @ts-ignore
  private _menuSizeChange(newVal: boolean, oldVal: boolean): void {
    if (newVal !== oldVal) {
      setTimeout(() => fireEvent(this, 'resize-main-layout'));
    }
  }

  // @ts-ignore
  private _toggleSmallMenu(e: Event): void {
    e.stopImmediatePropagation();
    fireEvent(this, 'toggle-small-menu');
  }
}

window.customElements.define('app-menu', AppMenu);
