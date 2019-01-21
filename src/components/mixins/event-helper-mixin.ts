import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';

/**
 * @polymer
 * @mixinFunction
 */
const EventHelperMixin = dedupingMixin((baseClass: any) =>
    class extends baseClass {
      public fireEvent(eventName: any, eventDetail?: any) {
        this.dispatchEvent(new CustomEvent(eventName, {
          detail: eventDetail,
          bubbles: true,
          composed: true
        }));
      }

    });

export default EventHelperMixin;

