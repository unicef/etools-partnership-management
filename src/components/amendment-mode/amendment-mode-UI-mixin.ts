import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
import {connect} from "pwa-helpers/connect-mixin";
import {RootState, store} from "../../store";

/**
 * @polymer
 * @mixinFunction
 */
const AmendmentModeUIMixin = dedupingMixin((baseClass: any) =>
    class extends connect(store)(baseClass) {
      static get properties() {
        return {
          amendmentModeActive: {
            type: Boolean,
            statePath: 'pageData.in_amendment'
          }
        };
      }

      public stateChanged(state: RootState) {
        if (state.commonData && state.commonData.pageData && (state.commonData.pageData as any).in_amendment &&
            (state.commonData.pageData as any).in_amendment !== this.amendmentModeActive) {
          this.amendmentModeActive = (state.commonData.pageData as any).in_amendment;
        }
      }

      public amendmentModeActive: boolean = false;

      protected _getPageContainerClass(amendmentModeActive: boolean): string {
        return amendmentModeActive ? 'in-amendment' : '';
      }

      protected _closeAmendment() {
        /**
         * For now amendment mode is PD specific, but if needed can be used on any page with this method code updated
         */
        let intervElem = this.shadowRoot.querySelector('#interventions');
        if (intervElem) {
          intervElem._showFinalizeAmendmentDialog();
        }
      }
    });

export default AmendmentModeUIMixin;
