import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
import { Constructor } from '../../typings/globals.types';
import { PolymerElement } from '@polymer/polymer';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 */
function AppNavigationHelperMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class appNavigationHelperMixin extends (baseClass as Constructor<PolymerElement>) {

      @property({type: Boolean})
      disableLoadingAfterAppStateChanged!: Boolean;

      /**
       * Update app state
       */
      updateAppState(routePath: string, qs: string, dispatchLocationChange: boolean) {
        // Using replace state to change the URL here ensures the browser's
        // back button doesn't take you through every query
        let currentState = window.history.state;
        window.history.replaceState(currentState, '',
            routePath + (qs.length ? '?' + qs : ''));

        if (dispatchLocationChange) {
          // This event lets app-location and app-route know
          // the URL has changed
          window.dispatchEvent(new CustomEvent('location-changed'));
        }
      }

      /**
       * Change app state
       */
      changeAppState(url: string) {
        if (!url) {
          return;
        }
        window.history.pushState(window.history.state, '', url);
        window.dispatchEvent(new CustomEvent('location-changed'));
      }

    };
    return appNavigationHelperMixin;
}

export default AppNavigationHelperMixin;
