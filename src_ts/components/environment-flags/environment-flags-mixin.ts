import {RootState} from '../../store';
import { EnvFlags, Constructor } from '../../typings/globals.types';
import { PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 */
function EnvironmentFlagsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class environFlags extends baseClass {

    @property({type: Object})
    environmentFlags: EnvFlags | null = null;

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

    public  waitForEnvFlagsToLoad() {
      return new Promise((resolve) => {
        let envFlagsCheck = setInterval(() => {
          if (this.envFlagsLoaded()) {
            clearInterval(envFlagsCheck);
            resolve(true);
          }
        }, 50);
      });
    }

  };
  return environFlags;
}

export default EnvironmentFlagsMixin;
