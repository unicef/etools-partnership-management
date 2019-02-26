import { IronMeta } from '@polymer/iron-meta';
import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';

/**
 * `EtoolsIronValidatorMixin` can be used for complex validations for different fields where
 * the error message can be different for the same field.
 * For example: "Date field is required" or "Date can not be in the future"
 * Elements instances implementing this behavior will be registered for use in elements that implement
 * `IronValidatableBehavior`.
 *
 * @polymer
 * @mixinFunction
 */
const EtoolsIronValidatorMixin = dedupingMixin(
(superClass: any) => class extends superClass {
  static get properties() {
    return {
      validatorName: {
        type: String,
        value: ''
      }
    };
  }

  ready() {
    super.ready();

    if (!this.validatorName) {
      throw new Error('[EtoolsIronValidatorMixin] Validator name property can not be empty!');
    }
    new IronMeta({
      type: 'validator',
      key: this.validatorName,
      value: this});
  }

  /**
   * Implement custom validation logic in this function.
   * @param {Object} values The value to validate. May be any type depending on the validation logic.
   */
  validate(_values: any) {
  }

});

export default EtoolsIronValidatorMixin
