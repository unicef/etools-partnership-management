import {LitElement, property} from 'lit-element';
import {Constructor} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @mixinFunction
 */
function ScrollControlMixinLit<T extends Constructor<LitElement>>(baseClass: T) {
  class ScrollControlClass extends baseClass {
    @property({type: Object})
    contentContainer: LitElement | null = window.EtoolsPmpApp.ContentContainer;

    public connectedCallback() {
      super.connectedCallback();
      if (!window.EtoolsPmpApp.ContentContainer) {
        this.waitForAppShellRender().then(() => {
          window.EtoolsPmpApp.ContentContainer = this._getContentContainer();
          // we still have to set contentContainer property
          // (undefined at this level, until next elem that uses this mixin is attached)
          this.contentContainer = window.EtoolsPmpApp.ContentContainer;
        });
      }
    }

    protected _getContentContainer() {
      const appShell = document.querySelector('app-shell');
      if (!appShell) {
        return null;
      }
      // @ts-ignore
      const appHeadLayout = appShell.shadowRoot.querySelector('#appHeadLayout');
      if (!appHeadLayout) {
        return null;
      }
      // @ts-ignore
      return appHeadLayout.shadowRoot.querySelector('#contentContainer');
    }

    public scrollToTop() {
      // @ts-ignore
      if (this.contentContainer) {
        this.contentContainer.scrollTop = 0;
      }
    }

    public waitForAppShellRender() {
      return new Promise((resolve) => {
        const check = setInterval(() => {
          if (this.tryGetContentContainer()) {
            clearInterval(check);
            resolve(true);
          }
        }, 50);
      });
    }

    private tryGetContentContainer() {
      try {
        // @ts-ignore
        return document
          .querySelector('app-shell')
          .shadowRoot.querySelector('#appHeadLayout')
          .shadowRoot.querySelector('#contentContainer');
      } catch (error) {
        return null;
      }
    }

    public scrollToTopOnCondition(condition: boolean) {
      if (condition) {
        this.scrollToTop();
      }
    }
  }
  return ScrollControlClass;
}

export default ScrollControlMixinLit;
