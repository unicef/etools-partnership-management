import { Paginator, Constructor } from '../../typings/globals.types';
import CONSTANTS from '../../config/app-constants';
import { PolymerElement } from '@polymer/polymer';
import { property } from '@polymer/decorators';

function PaginationMixin<T extends Constructor<PolymerElement>>(baseClass: T) {

  class paginationClass extends baseClass {

     @property({type: Object, notify: true})
     paginator = new Paginator();

    static get observers() {
      return [
        '_pageInsidePaginationRange(paginator.page, paginator.count)',
        'resetPageNumber(paginator.page_size)'
      ];
    }

    pageSizeChanged(e: CustomEvent) {
      this.resetPageNumber();
      this.setPageSize(parseInt(e.detail.value, 10));
    }

    pageNumberChanged(e: CustomEvent) {
      this.setPageNumber(parseInt(e.detail.value, 10));
    }

    getRequestPaginationParams() {
      return {
        page: this.paginator.page,
        page_size: this.paginator.page_size
      };
    }

    updatePaginatorTotalResults(reqResponse: any) {
      if (reqResponse && reqResponse.count) {
        let count = parseInt(reqResponse.count, 10);
        if (!isNaN(count)) {
          this.set('paginator.count', count);
          return;
        }
      }
      this.set('paginator.count', 0);
    }

    setPageSize(size: number) {
      this.set('paginator.page_size', size);
    }

    setPageNumber(page: number) {
      this.set('paginator.page', page);
    }

    resetPageNumber() {
      this.setPageNumber(1);
    }

    setPaginationDataFromUrlParams(urlParams: any) {
      this.setPageNumber(urlParams.page ? parseInt(urlParams.page) : 1);
      this.setPageSize(urlParams.size ? parseInt(urlParams.size) : CONSTANTS.DEFAULT_LIST_SIZE);
    }

   
    _pageInsidePaginationRange(page: number, totalResults: string) {
      if (page < 1) {
        this.resetPageNumber();
      }
      let total = parseInt(totalResults, 10);
      if (isNaN(total)) {
        return;
      }

      let lastPageNr = this._getLastPageNr(this.paginator.page_size, total);
      if (page > lastPageNr) {
        // page is bigger than last page number (possible by modifying url page param)
        // set page to last available page
        this.setPageNumber(lastPageNr);
      }
    }

    _getLastPageNr(pageSize: number, total: number) {
      return pageSize < total ? (Math.ceil(total / pageSize)) : 1;
    }
  };

  return paginationClass;
}

export default PaginationMixin;
