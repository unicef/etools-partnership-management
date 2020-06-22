import { RootState } from "../../store";
import { EnvFlags, Constructor } from "../../typings/globals.types";
import { PolymerElement } from "@polymer/polymer";
import { property } from "@polymer/decorators";
import { copy } from "../utils/utils";

/**
 * @polymer
 * @mixinFunction
 */
function EnvironmentFlagsMixin<T extends Constructor<PolymerElement>>(
  baseClass: T
) {
  class EnvironFlagsClass extends baseClass {
    @property({ type: Object })
    environmentFlags: EnvFlags | null = null;

    public envStateChanged(state: RootState) {
      if (!state.commonData) {
        return;
      }
      if (
        JSON.stringify(this.environmentFlags) !==
        JSON.stringify(state.commonData.envFlags)
      ) {
        this.environmentFlags = copy(state.commonData.envFlags);
      }
    }

    public envFlagsLoaded() {
      return (
        typeof this.environmentFlags !== "undefined" &&
        this.environmentFlags !== null
      );
    }

    public showPrpReports() {
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

export default EnvironmentFlagsMixin;
