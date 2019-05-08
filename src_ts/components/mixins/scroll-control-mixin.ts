import {logWarn} from 'etools-behaviors/etools-logging.js';
import {Constructor} from '../../typings/globals.types';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 */
function ScrollControl<T extends Constructor<PolymerElement>>(baseClass: T) {
  class ScrollControlClass extends baseClass {

    @property({type: Object})
    contentContainer: PolymerElement | null = window.EtoolsPmpApp.ContentContainer;

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
      if (!this.contentContainer) {
        logWarn('Can not scroll! `contentContainer` object is null or undefined',
          'scroll-control-mixin');
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

  }
  return ScrollControlClass;
}

export default ScrollControl;
