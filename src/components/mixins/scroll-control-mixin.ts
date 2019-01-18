import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';

/**
 * @polymer
 * @mixinFunction
 */
const ScrollControl = dedupingMixin((baseClass: any) =>
    class extends EtoolsLogsMixin(baseClass) {
      public static get properties() {
        return {
          contentContainer: {
            type: Object,
            readOnly: true
          }
        };
      }

      public contentContainer: object | null = window.EtoolsPmpApp.ContentContainer;

      public connectedCallback() {
        super.connectedCallback();
        if (!window.EtoolsPmpApp.ContentContainer) {
          window.EtoolsPmpApp.ContentContainer = this._getContentContainer();

          // we still have to set contentContainer property
          // (undefined at this level, until next elem that uses this mixin is attached)
          this.contentContainer = window.EtoolsPmpApp.ContentContainer;
        }
      }

      protected _getContentContainer() {
        let appShell = document.querySelector('app-shell');
        if (!appShell) {
          return null;
        }
        // @ts-ignore
        let appHeadLayout = appShell.shadowRoot.querySelector('#appHeadLayout');
        if (!appHeadLayout) {
          return null;
        }
        // @ts-ignore
        return appHeadLayout.shadowRoot.querySelector('#contentContainer');
      }

      public scrollToTop() {
        if (!this.contentContainer) {
          // @ts-ignore
          this.logWarn('Cannot scroll! `contentContainer` object is null or undefined', 'scroll-control-mixin');
          return;
        }
        // @ts-ignore
        this.contentContainer.scrollTop = 0;
      }

      public scrollToTopOnCondition(condition: boolean) {
        if (condition) {
          this.scrollToTop();
        }
      }

    });

export default ScrollControl;
