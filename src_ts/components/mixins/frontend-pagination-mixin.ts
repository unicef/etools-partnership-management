import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin';

const FrontendPaginationMixin = dedupingMixin((baseClass: any) =>
  class extends baseClass {

    public static get properties() {
      return {
        pagination: Object,
        dataItems: Array
      }
    }

    // TODO: polymer3 - use just one paginator mixin
    public pagination = {
      pageSize: 10,
      pageNumber: 1,
      totalResults: null
    };

    public _pageSizeChanged(ev: CustomEvent) {
      this.set('pagination.pageNumber', 1);
      this.set('pagination.pageSize', parseInt(ev.detail.value));
    }

    public _pageNumberChanged(ev: CustomEvent) {
      this.set('pagination.pageNumber', parseInt(ev.detail.value));
    }

    public _paginationChanged(pageNumber: number, pageSize: number, listData: any) {

      if (this._anyUndefined([pageNumber, pageSize, listData])) {
        return;
      }
      pageNumber = parseInt(String(pageNumber));
      pageSize = parseInt(String(pageSize));
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
