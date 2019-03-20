import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../store';
import {EnvFlags} from './environment-flags';
/**
 * @polymer
 * @mixinFunction
 */
const EnvironmentFlags = dedupingMixin((baseClass: any) =>
    class extends connect(store)(baseClass) {

      public static get properties() {
        return {
          environmentFlags: Object
        };
      }

      public environmentFlags: EnvFlags | null = null;

      public envStateChanged(state: RootState) {
        if (!state.commonData) {
            return;
        }
        if (JSON.stringify(this.environmentFlags) !== JSON.stringify(state.commonData.envFlags)) {
          this.environmentFlags = {...state.commonData.envFlags} as EnvFlags;
        }
      }

      public envFlagsLoaded() {
        return typeof this.environmentFlags !== 'undefined' && this.environmentFlags !== null;
      }

      public  showPrpReports() {
        return this.environmentFlags && !this.environmentFlags.prp_mode_off;
      }

      public  prpServerIsOn() {
        return this.environmentFlags && this.environmentFlags.prp_server_on;
      }

      public  _waitForEnvFlagsToLoad() {
        return new Promise((resolve) => {
          let envFlagsCheck = setInterval(() => {
            if (this.envFlagsLoaded()) {
              clearInterval(envFlagsCheck);
              resolve(true);
            }
          }, 50);
        });
      }

    });

export default EnvironmentFlags;
