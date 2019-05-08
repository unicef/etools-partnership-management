import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import EndpointsMixin from '../endpoints/endpoints-mixin';
import pmpEdpoints from '../endpoints/endpoints';
import {connect} from 'pwa-helpers/connect-mixin';
import {store} from '../../store';
import {updateEnvFlags} from '../../actions/common-data';
import {logError} from 'etools-behaviors/etools-logging.js';
import {EnvFlags} from '../../typings/globals.types';


/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class EnvironmentFlagsMixin extends connect(store)(EndpointsMixin(PolymerElement) as any) {

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
    const flags = envFlags.active_flags;
    const flagObject = {
      prp_mode_off: false
    };

    // @ts-ignore
    for (const key in flags) {
      const flag: string | undefined = (flags as any)[key];
      if (flag) {
        (flagObject as any)[flag] = true;
      }
    }
    return flagObject;
  }

  private _loadEnvFlagsData() {
    const requestConfig = {
      endpoint: pmpEdpoints.environmentFlags
    };

    this.sendRequest(requestConfig).then((response: any) => {
      if (response) {
        store.dispatch(updateEnvFlags(this._processAndSetEnvFlags(response)));
      } else {
        store.dispatch(updateEnvFlags(this.envFlagsDefaultValue));
      }
    }).catch((error: any) => {
      logError('Env flags request failed', null, error);
      store.dispatch(updateEnvFlags(this.envFlagsDefaultValue));
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadEnvFlagsData();
  }

}

window.customElements.define('environment-flags', EnvironmentFlagsMixin);
