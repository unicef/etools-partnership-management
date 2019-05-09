// import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
import {RootState} from '../../store';
import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../../typings/globals.types';
import {InterventionsModule} from '../app-modules/interventions/interventions-module';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 */
function AmendmentModeUIMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class amendmentModeUI extends baseClass {
    @property({type: Boolean})
    amendmentModeActive: boolean = false;

    public amdStateChanged(state: RootState) {
      if (state.pageData!.in_amendment !== this.amendmentModeActive) {
        this.amendmentModeActive = state.pageData!.in_amendment;
      }
    }

    protected _getPageContainerClass(amendmentModeActive: boolean): string {
      return amendmentModeActive ? 'in-amendment' : '';
    }

    protected _closeAmendment() {
      /**
       * For now amendment mode is PD specific, but if needed can be used on any page with this method code updated
       */
      const intervElem = this.shadowRoot!.querySelector('#interventions') as unknown as InterventionsModule;
      if (intervElem) {
        intervElem._showFinalizeAmendmentDialog();
      }
    }
  }
  return amendmentModeUI;
}

export default AmendmentModeUIMixin;
