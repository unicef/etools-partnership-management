import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import EndpointsMixin from '../../endpoints/endpoints-mixin';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import pmpEdpoints from '../../endpoints/endpoints';
import {connect} from 'pwa-helpers/connect-mixin';
import {store} from '../../../redux/store';
import {updateEnvFlags} from '../../../redux/actions/common-data';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {property} from '@polymer/decorators';
import {EnvFlags} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class EnvironmentFlagsPolymerMixin2 extends connect(store)(EndpointsMixin(PolymerElement)) {
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

    sendRequest(requestConfig)
      .then((response: any) => {
        if (response) {
          store.dispatch(updateEnvFlags(this._processAndSetEnvFlags(response)));
        } else {
          store.dispatch(updateEnvFlags(this.envFlagsDefaultValue));
        }
      })
      .catch((error: any) => {
        EtoolsLogger.error('Env flags request failed', null, error);
        store.dispatch(updateEnvFlags(this.envFlagsDefaultValue));
      });
  }

  connectedCallback() {
    super.connectedCallback();
    this._loadEnvFlagsData();
  }
}

window.customElements.define('environment-flags', EnvironmentFlagsPolymerMixin2);
