import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import EndpointsMixin from '../endpoints/endpoints-mixin';
import pmpEdpoints from '../endpoints/endpoints';
import {connect} from 'pwa-helpers/connect-mixin';
import {store} from '../../store';
import {updateEnvFlags} from '../../actions/common-data';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {EnvFlags} from '../../typings/globals.types';
import {property} from '@polymer/decorators';


/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class EnvironmentFlagsMixin extends connect(store)(EndpointsMixin(PolymerElement)) {

  @property({type: Object})
  envFlagsDefaultValue: EnvFlags = {
    prp_mode_off: true,
    prp_server_on: false
  };

  protected _processAndSetEnvFlags(envFlags: EnvFlags) {
    const activeflags = envFlags.active_flags;

    const flagObject: any = {
      prp_mode_off: false
    };

    if (activeflags) {
      activeflags.forEach((flag) => {
        flagObject[flag] = true;
      });
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
