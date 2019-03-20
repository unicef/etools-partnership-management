import { PolymerElement} from '@polymer/polymer/polymer-element.js';
import EndpointsMixin from '../endpoints/endpoints-mixin';
import pmpEdpoints from '../endpoints/endpoints';
import {connect} from 'pwa-helpers/connect-mixin';
import {store} from '../../store';
import {updateEnvFlags} from '../../actions/common-data';

// import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';

export interface EnvFlags extends Object {
  prp_mode_off: boolean, prp_server_on: boolean, active_flags?: object[]
}

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class EnvironmentFlags extends connect(store)(EndpointsMixin(PolymerElement) as any) {

  public static get properties() {
    return {
      envFlagsDefaultValue: Object
    };
  }

  public envFlagsDefaultValue: EnvFlags = {
    prp_mode_off: true,
    prp_server_on: false
  };

  protected _processAndSetEnvFlags(envFlags: EnvFlags) {
    let flags = envFlags.active_flags;
    let flagObject = {
      prp_mode_off: false
    };

    // @ts-ignore
    for (let key in flags) {
      let flag: string | undefined = (flags as any)[key];
      if (flag) {
        (flagObject as any)[flag] = true;
      }
    }
    return flagObject;
  }

  private _loadEnvFlagsData() {
    let requestConfig = {
      endpoint: pmpEdpoints.environmentFlags
    };

    this.sendRequest(requestConfig).then((response: any) => {
      if (response) {
        store.dispatch(updateEnvFlags(this._processAndSetEnvFlags(response)));
      } else {
        store.dispatch(updateEnvFlags(this.envFlagsDefaultValue));
      }
    }).catch((error: any) => {
      this.logError('Env flags request failed', null, error);
      store.dispatch(updateEnvFlags(this.envFlagsDefaultValue));
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadEnvFlagsData();
  }

}

window.customElements.define('environment-flags', EnvironmentFlags);
