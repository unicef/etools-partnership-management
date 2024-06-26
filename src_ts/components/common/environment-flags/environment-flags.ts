import EndpointsMixin from '../../endpoints/endpoints-mixin';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import pmpEdpoints from '../../endpoints/endpoints';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {store} from '../../../redux/store';
import {updateEnvFlags} from '../../../redux/actions/common-data';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {property} from 'lit/decorators.js';
import {EnvFlags} from '@unicef-polymer/etools-types';
import {LitElement} from 'lit';

/**
 * @LitElement
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class EnvironmentFlagsPolymerMixin2 extends connect(store)(EndpointsMixin(LitElement)) {
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
