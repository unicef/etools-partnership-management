import {connect} from 'pwa-helpers/connect-mixin.js';
import {store} from '../../../../../store.js';
import CommonMixin from '../../../../mixins/common-mixin';
import EndpointsMixin from '../../../../endpoints/endpoints-mixin';
import ListFiltersMixin from '../../../../mixins/list-filters-mixin';
import EventHelperMixin from '../../../../mixins/event-helper-mixin';
import { PolymerElement } from '@polymer/polymer';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import ListsCommonMixin from '../../../../mixins/lists-common-mixin.js';
import PaginationMixin from '../../../../mixins/pagination-mixin.js';

/**
     * @polymer
     * @mixinFunction
     * @appliesMixin CommonMixin
     * @appliesMixin EndpointsMixin
     * @appliesMixin ListFiltersMixin
     * @appliesMixin ListsCommonMixin
     * @appliesMixin PaginationMixin
     * @appliesMixin EventHelperMixin
     */
    const AgreementsListRequiredMixins = EtoolsMixinFactory.combineMixins([
      CommonMixin,
      EndpointsMixin,
      ListFiltersMixin,
      ListsCommonMixin,
      PaginationMixin,
      EventHelperMixin,
    ], PolymerElement);

class AgreementsList extends connect(store)(AgreementsListRequiredMixins) {

}

window.customElements.define('agreements-list', AgreementsList);
