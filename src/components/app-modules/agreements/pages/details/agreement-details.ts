import { PolymerElement } from '@polymer/polymer';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import CommonMixin from '../../../../mixins/common-mixin';
import UploadMixin from '../../../../mixins/uploads-mixin';

/**
     * @polymer
     * @mixinFunction
     * @appliesMixin StaffMembersData
     * @appliesMixin CommonMixin
     * @appliesMixin UploadMixin
     */
    const AgreementDetailsRequiredMixins = EtoolsMixinFactory.combineMixins([
      //StaffMembersData,
      CommonMixin,
      UploadMixin
    ], PolymerElement);

    /**
     * @polymer
     * @customElement
     * @appliesMixin AgreementDetailsRequiredMixins
     */
    class AgreementDetails extends AgreementDetailsRequiredMixins {

    }

    window.customElements.define('agreement-details', AgreementDetails);
