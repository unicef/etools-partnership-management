// import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
import {RootState} from '../../store';
import {PolymerElement} from '@polymer/polymer';
import {InterventionsModule} from '../app-modules/interventions/interventions-module';
import {property} from '@polymer/decorators';
import {Constructor} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @mixinFunction
 */
function AmendmentModeUIMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class AmendmentModeUIClass extends baseClass {
    @property({type: Boolean})
    amendmentModeActive = false;

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
      const intervElem = (this.shadowRoot!.querySelector('#interventions') as unknown) as InterventionsModule & {
        _showFinalizeAmendmentDialog: () => void;
      };
      // TODO: Check if method is valid! Can not find it using search!
      if (intervElem && intervElem._showFinalizeAmendmentDialog) {
        intervElem._showFinalizeAmendmentDialog();
      }
    }
  }
  return AmendmentModeUIClass;
}

export default AmendmentModeUIMixin;
