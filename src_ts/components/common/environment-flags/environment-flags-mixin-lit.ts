import {RootState} from '../../../redux/store';
import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import {copy} from '@unicef-polymer/etools-utils/dist/general.util';
import {EnvFlags, Constructor} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @mixinFunction
 */
function EnvironmentFlagsMixinLit<T extends Constructor<LitElement>>(baseClass: T) {
  class EnvironFlagsClass extends baseClass {
    @property({type: Object})
    environmentFlags: EnvFlags | null = null;

    public envStateChanged(state: RootState) {
      if (!state.commonData) {
        return;
      }
      if (JSON.stringify(this.environmentFlags) !== JSON.stringify(state.commonData.envFlags)) {
        this.environmentFlags = copy(state.commonData.envFlags);
      }
    }

    public envFlagsLoaded() {
      return typeof this.environmentFlags !== 'undefined' && this.environmentFlags !== null;
    }

    public shouldShowPrpReports() {
      return this.environmentFlags && !this.environmentFlags.prp_mode_off;
    }

    public prpServerIsOn() {
      return this.environmentFlags && this.environmentFlags.prp_server_on;
    }

    public waitForEnvFlagsToLoad() {
      return new Promise((resolve) => {
        const envFlagsCheck = setInterval(() => {
          if (this.envFlagsLoaded()) {
            clearInterval(envFlagsCheck);
            resolve(true);
          }
        }, 50);
      });
    }
  }
  return EnvironFlagsClass;
}

export default EnvironmentFlagsMixinLit;
