import { ListFilterOption, SelectedFilterOption, ListOrSelectedFilterOption } from '../../typings/filter.types';
import { DomRepeatEvent, PolymerElEvent, _ } from '../../typings/globals.types';
declare const moment: any;
/**
  * @polymer
  * @mixinFunction
  */
 const ListFiltersMixin = (baseClass: any) => class extends baseClass {

  static get properties() {
    return {
      listFilterOptions: {
        type: Array
      },
      selectedFilters: {
        type: Array
      }
    };
  }

  /**
   * Init filter options properties.
   * `filterOptions` object is particular for each list (see partners-list for example)
   */
  initListFiltersData(filterOptions: []) {
    // init add filter menu options
    this.setProperties({
      listFilterOptions: filterOptions,
      selectedFilters: []
    });
  }

  _isAlreadySelected(filter: any) {
    let selectedOpt = this.selectedFilters.find(function(selectedFilter: SelectedFilterOption) {
      return selectedFilter.filterName === filter.filterName;
    });
    return !!selectedOpt;
  }

  // select/deselect a filter from ADD FILTER menu
  selectFilter(e: DomRepeatEvent) {
    const selectedOption: ListFilterOption = e.model.item;
    const idxInFilterOptions: number = e.model.index;
    if (!this._isAlreadySelected(selectedOption)) {
      // add
      this.push('selectedFilters', JSON.parse(JSON.stringify(selectedOption)));
      this.set(['listFilterOptions', idxInFilterOptions, 'selected'], true);
    } else {
      // remove
      const idxInSelFilters = this.selectedFilters.findIndex((f: any)=> f.filterName === selectedOption.filterName);
      this._clearFilterSelection(selectedOption, idxInFilterOptions, idxInSelFilters);

      this._triggerUrlUpdateAndFiltering(this.listFilterOptions[idxInFilterOptions]);

      /* Once the shown filter will be removed from dom,
       * the filterValueChanged won't execute,
       * so we're triggering manually the url and filtering update above
       */
      this.removeFromShownFilters(idxInSelFilters);
    }
  }

  _triggerUrlUpdateAndFiltering(optionsFilter: any) {
    this.set(optionsFilter.path, this._getEmptyValueByFilterType(optionsFilter));
  }

  _getEmptyValueByFilterType(filter: any) {
    switch (filter.type) {
      case 'esmm':
      case 'dropdown':
      case 'etools-dropdown':
        return filter.singleSelection ? null : [];
      case 'datepicker':
        return '';
      case 'paper-toggle':
        return false;
      default:
        return null;
    }
  }

  _clearFilterSelection(filter: ListFilterOption, idxInFilterOptions: number, idxInSelFilters: number) {
    if (!filter) {
      return;
    }

    this.clearSelectedValueInFilter(filter, ['listFilterOptions', idxInFilterOptions]);
    this.clearSelectedValueInFilter(filter, ['selectedFilters', idxInSelFilters]);

    this.untickFilter(idxInFilterOptions);
  }

  removeFromShownFilters(idxInSelFilters: number) {
    this.splice('selectedFilters', idxInSelFilters, 1);
  }

  untickFilter(idx: number) {
    this.set(['listFilterOptions', idx, 'selected'], false);
  }

  clearAllFilterValues() {
    for (let i = 0; i < this.selectedFilters.length; i++) {
      if (!this.selectedFilters[i].disabled) {
        this.clearSelectedValueInFilter(this.selectedFilters[i], ['selectedFilters', i]);
      }
    }
  }

  /*
   * filterPath can be ['selectedFilters', idx] or
   * ['listFilterOptions', idx]
   */
  clearSelectedValueInFilter(filter: ListFilterOption, filterPath: [string, number]) {
    switch (filter.type) {
      case 'esmm':
      case 'dropdown':
      case 'etools-dropdown':
        this.set([...filterPath, 'alreadySelected'], filter.singleSelection ? null : []);
        break;
      case 'datepicker':
        this.set([...filterPath, 'dateSelected'], '');
        break;
      case 'paper-toggle':
        this.set([...filterPath, 'selectedValue'], false);
        this.notifyPath([...filterPath, 'selectedValue'].join('.'));
        break;
      default:
        break;
    }
  }

  updateSelectedValueInFilter(filterType: string, filterPath: [string, number], selectedValue: any) {
    switch (filterType) {
      case 'esmm':
      case 'dropdown':
      case 'etools-dropdown':
        this.set([...filterPath, 'alreadySelected'], selectedValue);
        break;
      case 'datepicker':
        this.set([...filterPath, 'dateSelected'], selectedValue);
        break;
      case 'paper-toggle':
        this.set([...filterPath, 'selectedValue'], selectedValue);
        this.notifyPath([...filterPath, 'selectedValue'].join('.'));
        break;
      default:
        break;
    }
  }


  // filter value changed, update filter path with the new value
  filterValueChanged(event: PolymerElEvent) {
    let filterPath = event.target.getAttribute('data-filter-path');
    let filterVal = event.target.selected;
    this.set(filterPath, filterVal);
  }

  /**
   * Check filter type. Filter type can be:
   *  - 'dropdown'(dropdown created using polymer catalog elements)
   *  - 'esmm' (etools-dropdown-multi)
   *  - 'etools-dropdown' - etools-dropdown single selection
   *  - 'datepicker' (etools-datepicker)update
   */
  filterTypeIs(expectedType: string, checkedTypeValue: string) {
    return expectedType === checkedTypeValue;
  }

  // 'esmm' (etools-dropdown-multi) filter value changed
  esmmValueChanged(e: PolymerElEvent) {
    let filterPath = e.target.getAttribute('data-filter-path');
    let filterVal = e.detail.selectedItems.map((v: any) => v[e.target.optionValue]);
    this.set(filterPath, filterVal);
  }

  toggleValueChanged(e: PolymerElEvent) {
    let filterPath = e.target.getAttribute('data-filter-path');
    let filterVal = e.target.checked;
    this.set(filterPath, filterVal);
  }

  // change event for a etoold-datepicker filter
  _filterDateHasChanged(event: PolymerElEvent) {
    let filterPath = event.target.getAttribute('data-filter-path');
    if (!event.detail.date) {
      this.set(filterPath, '');
      return;
    }
    let selectedDate = event.detail.date;
    this.set(filterPath, moment(selectedDate).format('YYYY-MM-DD'));
  }

  _validFilterSelectedValue(value: any, type: string, allowEmptyEsmm: boolean) {
    if (type === 'paper-toggle') {
      return ['true', 'false'].indexOf(String(value)) > -1;
    }

    if ((Array.isArray(value) && value.length === 0) && allowEmptyEsmm) {
      return true;
    }

    return value && ((typeof value === 'string' && value !== '')
        || (Array.isArray(value) && value.length > 0));
  }

  _findInListFilterOptions(filterName: string) {
    return this.listFilterOptions instanceof Array
        ? this.listFilterOptions.find(f => f.filterName === filterName)
        : null;
  }

  // update shown filters
  updateShownFilters(filtersToUpdate: Array<ListOrSelectedFilterOption>) {
    if (!filtersToUpdate) {
      filtersToUpdate = [];
    }
    if (!Array.isArray(filtersToUpdate) || filtersToUpdate.length === 0) {
      return;
    }

    filtersToUpdate.forEach((filterToUpdate) => {
      // check available filters
      const filterObj = this._findInListFilterOptions(filterToUpdate.filterName);

      if (!filterObj) {
        return;
      }
      const idxInFilterOptions = this.listFilterOptions.findIndex((f:ListFilterOption)=> f.filterName === filterToUpdate.filterName);

      if ((filterObj.selected || this.filterHasSelectedValue(filterToUpdate.selectedValue, filterObj.type)) &&
           !this._isAlreadySelected(filterObj)) {
        // filter not selected => select filter
        this.push('selectedFilters', JSON.parse(JSON.stringify(filterObj)));
        this.set(['listFilterOptions', idxInFilterOptions, 'selected'], true);
      }

     if (this._validFilterSelectedValue(filterToUpdate.selectedValue, filterObj.type, filterObj.allowEmpty)) {

        // search it in selected filters lists and update selected value
        if (this.selectedFilters instanceof Array && this.selectedFilters.length > 0) {
          let idxInSelFilters = this.selectedFilters.findIndex(f => f.filterName === filterToUpdate.filterName);

          if (idxInSelFilters > -1) {
            this.updateSelectedValueInFilter(filterObj.type, ['selectedFilters', idxInSelFilters],
                                             filterToUpdate.selectedValue);
            this._disableFilterIfNeccessary(filterToUpdate, idxInSelFilters, idxInFilterOptions);
          }
        }
      }
    });
  }

  filterHasSelectedValue(selectedValue: any, filterType: string) {
    switch (filterType) {
      case 'esmm':
      case 'dropdown':
      case 'etools-dropdown':
        return selectedValue && ((typeof selectedValue === 'string' && selectedValue !== '')
          || (Array.isArray(selectedValue) && selectedValue.length > 0));
      case 'datepicker':
        return !!selectedValue;
      case 'paper-toggle':
        return ['true', 'false'].indexOf(String(selectedValue)) > -1;
      default:
        return false;
    }
  }
  _disableFilterIfNeccessary(filter: ListOrSelectedFilterOption, idxInSelFilters: number, idxInFilterOptions: number) {
    if (filter.hasOwnProperty('disabled')) {
      this.set(['selectedFilters', idxInSelFilters, 'disabled'], filter.disabled);
    }

    if (typeof filter.disableMenuOption !== 'boolean') {
      return;
    }

    this.set(['listFilterOptions', idxInFilterOptions, 'disabled'], filter.disableMenuOption);
    this.notifyPath('listFilterOptions.' + idxInFilterOptions + '.disabled');
  }

  /**
   * Get filter selected options values by option property and filter selected values
   * @param filterOptions
   * @param prop
   * @param selected
   * @param selectedProp
   * @returns {Array}
   */
  getFilterValuesByProperty(filterOptions: Array<ListFilterOption>, prop: string, selected: any, selectedProp: string) {
    let selectedValues = this._convertToInt(selected);
    selectedProp = selectedProp || 'id';
    return ((!filterOptions || ! filterOptions.length) && !selectedValues)
        ? filterOptions.filter(opt => selectedValues.indexOf(opt[selectedProp]) > -1).map(opt => opt[prop])
        : [];
  }

  _convertToInt(data: []) {
    return (data instanceof Array)
        ? data.map(d => parseInt(d, 10))
        : [];
  }

};

export default ListFiltersMixin;
