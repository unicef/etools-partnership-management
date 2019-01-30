import {connect} from "pwa-helpers/connect-mixin";
import {store} from "../../../store";

import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EtoolsCurrency from 'etools-currency-amount-input/mixins/etools-currency-mixin.js';
import pmpEdpoints from '../../../../endpoints/endpoints.js';
import EventHelperMixin from '../../../../mixins/event-helper-mixin.js';
import PaginationMixin from '../../../../mixins/pagination-mixin.js';
import CommonMixin from '../../../../mixins/common-mixin.js';



/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin pmpEdpoints
 * @appliesMixin EtoolsPmpApp.Mixins.ListFilters
 * @appliesMixin CommonMixin
 * @appliesMixin EtoolsPmpApp.Mixins.ListsCommon
 * @appliesMixin PaginationMixin
 * @appliesMixin EventHelperMixin
 */
const PartnersListRequiredMixins = EtoolsMixinFactory.combineMixins([
  EtoolsCurrency, pmpEdpoints, EventHelperMixin, PaginationMixin, CommonMixin
]);

