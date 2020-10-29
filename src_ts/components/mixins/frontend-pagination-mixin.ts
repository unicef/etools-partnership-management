import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {Constructor} from '@unicef-polymer/etools-types';

function FrontendPaginationMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class FrontendPaginationClass extends baseClass {
    @property({type: Object})
    pagination = {
      pageSize: 10,
      pageNumber: 1,
      totalResults: null
    };

    @property({type: Array})
    dataItems!: [];

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
      const startingIndex = (pageNumber - 1) * pageSize;
      this.dataItems = listData.slice(startingIndex, startingIndex + pageSize);
    }

    public _anyUndefined(items: any) {
      return items.some(this._isUndefined);
    }

    public _isUndefined(item: any) {
      return typeof item === 'undefined';
    }
  }
  return FrontendPaginationClass;
}

export default FrontendPaginationMixin;
