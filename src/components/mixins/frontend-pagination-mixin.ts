import {dedupingMixin} from "@polymer/polymer/lib/utils/mixin";
import {Pagination} from '../../typings/globals.types.js';

const FrontendPaginationMixin = dedupingMixin((baseClass: any) =>
  class extends baseClass {

    public static get properties() {
      return {
        pagination: Object,
        dataItems: Array
      }
    }

    public pagination: Pagination = {
      pageSize: 10,
      pageNumber: 1,
      totalResults: 0
    }

    public _pageSizeChanged(ev: any) {
      this.set('pagination.pageNumber', 1);
      this.set('pagination.pageSize', parseInt(ev.detail.value));
    }

    public _pageNumberChanged(ev: any) {
      this.set('pagination.pageNumber', parseInt(ev.detail.value));
    }

    public _paginationChanged(pageNumber: any, pageSize: any, listData: any) {

      if (this._anyUndefined([pageNumber, pageSize, listData])) {
        return;
      }
      pageNumber = parseInt(pageNumber);
      pageSize = parseInt(pageSize);
      let startingIndex = (pageNumber - 1) * pageSize;
      this.dataItems = listData.slice(startingIndex, startingIndex + pageSize);
    }

    public _anyUndefined(items: any) {
      return items.some(this._isUndefined);
    }

    public _isUndefined(item: any) {
      return typeof item === 'undefined';
    }




  });

export default FrontendPaginationMixin;
