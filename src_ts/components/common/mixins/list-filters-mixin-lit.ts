import {ListFilterOption, ListOrSelectedFilterOption} from '../../../typings/filter.types';
import {EtoolsDropdownMultiEl} from '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {PaperToggleButtonElement} from '@polymer/paper-toggle-button';
import DatePickerLite from '@unicef-polymer/etools-date-time/datepicker-lite';
import {Constructor} from '@unicef-polymer/etools-types';
import {LitElement, property} from 'lit-element';
import set from 'lodash-es/set';
declare const dayjs: any;
/**
 * @polymer
 * @mixinFunction
 */
function ListFiltersMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class ListFiltersClass extends baseClass {
    @property({type: Array})
    listFilterOptions!: ListFilterOption[];

    @property({type: Array})
    selectedFilters!: ListFilterOption[];

    @property({type: String})
    q!: string;

    /**
     * Init filter options properties.
     * `filterOptions` object is particular for each list (see partners-list for example)
     */
    initListFiltersData(filterOptions: ListFilterOption[]) {
      // init add filter menu options
      this.listFilterOptions = filterOptions;
      this.selectedFilters = [];
    }

    _isAlreadySelected(filter: any) {
      const selectedOpt = this.selectedFilters.find(function (selectedFilter: ListFilterOption) {
        return selectedFilter.filterName === filter.filterName;
      });
      return !!selectedOpt;
    }

    // select/deselect a filter from ADD FILTER menu
    selectFilter(item: any, index: number) {
      const selectedOption: ListFilterOption = item;
      const idxInFilterOptions: number = index;
      if (!this._isAlreadySelected(selectedOption)) {
        // add
        this.listFilterOptions[idxInFilterOptions].selected = true;
        this.selectedFilters.push(JSON.parse(JSON.stringify(selectedOption)));
      } else {
        // remove
        const idxInSelFilters = this.selectedFilters.findIndex((f: any) => f.filterName === selectedOption.filterName);
        this._clearFilterSelection(selectedOption, idxInFilterOptions, idxInSelFilters);

        this._triggerUrlUpdateAndFiltering(this.listFilterOptions[idxInFilterOptions]);

        /* Once the shown filter will be removed from dom,
         * the filterValueChanged won't execute,
         * so we're triggering manually the url and filtering update above
         */
        this.removeFromShownFilters(idxInSelFilters);
      }

      this.selectedFilters = [...this.selectedFilters];
      this.listFilterOptions = [...this.listFilterOptions];
    }

    _triggerUrlUpdateAndFiltering(optionsFilter: any) {
      set(this, optionsFilter.path, this._getEmptyValueByFilterType(optionsFilter));
    }

    _getEmptyValueByFilterType(filter: any) {
      switch (filter.type) {
        case 'etools-dropdown-multi':
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
      this.selectedFilters.splice(idxInSelFilters, 1);
    }

    untickFilter(idx: number) {
      this.listFilterOptions[idx].selected = false;
    }

    clearAllFilters() {
      // clear search input, not in selectedFilters
      this.q = '';

      for (let i = 0; i < this.selectedFilters.length; i++) {
        if (!this.selectedFilters[i].disabled) {
          this.clearSelectedValueInFilter(this.selectedFilters[i], ['selectedFilters', i]);
        }
      }
      this.listFilterOptions.forEach((o: ListFilterOption, i: number) => {
        if (!o.disabled) {
          this.untickFilter(i);
        }
      });
      this.selectedFilters = [];
    }

    /*
     * filterPath can be ['selectedFilters', idx] or
     * ['listFilterOptions', idx]
     */
    clearSelectedValueInFilter(filter: ListFilterOption, _filterPath: [string, number]) {
      switch (filter.type) {
        case 'etools-dropdown-multi':
        case 'dropdown':
        case 'etools-dropdown':
          set(this, filter.path, filter.singleSelection ? null : []);
          // set(this, [...filterPath, 'selectedValue'], filter.singleSelection ? null : []);
          break;
        case 'datepicker':
          set(this, filter.path, '');
          // set(this, [...filterPath, 'selectedValue'], '');
          break;
        case 'paper-toggle':
          set(this, filter.path, false);
          // set(this, [...filterPath, 'selectedValue'], false);
          break;
        default:
          break;
      }
    }

    updateSelectedValueInFilter(filterType: string, filterPath: [string, number], selectedValue: any) {
      set(this, [...filterPath, 'selectedValue'], selectedValue);
      if (filterType === 'paper-toggle') {
        // this.notifyPath([...filterPath, 'selectedValue'].join('.'));
      }
    }

    // filter value changed, update filter path with the new value
    filterValueChanged(event: CustomEvent) {
      const dropdown = event.target as EtoolsDropdownEl;
      const filterPath = dropdown.getAttribute('data-filter-path')!;
      const filterVal = dropdown.selected;
      set(this, filterPath, filterVal);
    }

    /**
     * Check filter type. Filter type can be:
     *  - 'dropdown'(dropdown created using polymer catalog elements)
     *  - 'etools-dropdown-multi' (etools-dropdown-multi)
     *  - 'etools-dropdown' - etools-dropdown single selection
     *  - 'datepicker' (datepicker-lite)update
     */
    filterTypeIs(expectedType: string, checkedTypeValue: string) {
      return expectedType === checkedTypeValue;
    }

    // 'etools-dropdown-multi' (etools-dropdown-multi) filter value changed
    esmmValueChanged(e: CustomEvent) {
      const dropdownMultiEl = e.target as EtoolsDropdownMultiEl;
      const filterPath = dropdownMultiEl.getAttribute('data-filter-path')!;
      const filterVal = e.detail.selectedItems.map((v: any) => v[dropdownMultiEl.optionValue!]);
      set(this, filterPath, filterVal);
    }

    toggleValueChanged(e: CustomEvent) {
      const toggleEl = e.target as PaperToggleButtonElement;
      const filterPath = toggleEl.getAttribute('data-filter-path')!;
      const filterVal = toggleEl.checked;
      set(this, filterPath, filterVal);
    }

    // change event for a etoold-datepicker filter
    _filterDateHasChanged(event: CustomEvent) {
      const filterPath = (event.target as DatePickerLite).getAttribute('data-filter-path')!;
      if (!event.detail.date) {
        set(this, filterPath, '');
        return;
      }
      const selectedDate = event.detail.date;
      set(this, filterPath, dayjs(selectedDate).format('YYYY-MM-DD'));
    }

    _validFilterSelectedValue(value: any, type: string, allowEmptyEsmm?: boolean) {
      if (type === 'paper-toggle') {
        return ['true', 'false'].indexOf(String(value)) > -1;
      }

      if (Array.isArray(value) && value.length === 0 && allowEmptyEsmm) {
        return true;
      }

      return value && ((typeof value === 'string' && value !== '') || (Array.isArray(value) && value.length > 0));
    }

    _findInListFilterOptions(filterName: string) {
      return this.listFilterOptions instanceof Array
        ? this.listFilterOptions.find((f) => f.filterName === filterName)
        : null;
    }

    // update shown filters
    updateShownFilters(filtersToUpdate: ListOrSelectedFilterOption[]) {
      if (!filtersToUpdate) {
        filtersToUpdate = [];
      }
      if (!Array.isArray(filtersToUpdate) || filtersToUpdate.length === 0) {
        return;
      }

      filtersToUpdate.forEach((filterToUpdate) => {
        // check available filters
        const filterObj = this._findInListFilterOptions(filterToUpdate.filterName as string);

        if (!filterObj) {
          return;
        }
        const idxInFilterOptions = this.listFilterOptions.findIndex(
          (f: ListFilterOption) => f.filterName === filterToUpdate.filterName
        );

        if (
          (filterObj.selected || this.filterHasSelectedValue(filterToUpdate.selectedValue, filterObj.type)) &&
          !this._isAlreadySelected(filterObj)
        ) {
          // filter not selected => select filter
          this.selectedFilters.push(JSON.parse(JSON.stringify(filterObj)));
          this.listFilterOptions[idxInFilterOptions].selected = true;
        }

        if (this._validFilterSelectedValue(filterToUpdate.selectedValue, filterObj.type, filterObj.allowEmpty)) {
          // search it in selected filters lists and update selected value
          if (this.selectedFilters instanceof Array && this.selectedFilters.length > 0) {
            const idxInSelFilters = this.selectedFilters.findIndex((f) => f.filterName === filterToUpdate.filterName);

            if (idxInSelFilters > -1) {
              this.updateSelectedValueInFilter(
                filterObj.type,
                ['selectedFilters', idxInSelFilters],
                filterToUpdate.selectedValue
              );
              this._disableFilterIfNeccessary(filterToUpdate, idxInSelFilters, idxInFilterOptions);
            }
          }
        }
      });
    }

    filterHasSelectedValue(selectedValue: any, filterType: string) {
      switch (filterType) {
        case 'etools-dropdown-multi':
        case 'dropdown':
        case 'etools-dropdown':
          return (
            selectedValue &&
            ((typeof selectedValue === 'string' && selectedValue !== '') ||
              (Array.isArray(selectedValue) && selectedValue.length > 0))
          );
        case 'datepicker':
          return !!selectedValue;
        case 'paper-toggle':
          return ['true', 'false'].indexOf(String(selectedValue)) > -1;
        default:
          return false;
      }
    }
    _disableFilterIfNeccessary(
      filter: ListOrSelectedFilterOption,
      idxInSelFilters: number,
      idxInFilterOptions: number
    ) {
      if (Object.prototype.hasOwnProperty.call(filter, 'disabled')) {
        this.selectedFilters[idxInSelFilters].disabled = filter.disabled;
      }

      if (typeof filter.disableMenuOption !== 'boolean') {
        return;
      }

      this.listFilterOptions[idxInFilterOptions].disabled = filter.disableMenuOption;
      // this.notifyPath('listFilterOptions.' + idxInFilterOptions + '.disabled');
    }

    /**
     * Get filter selected options values by option property and filter selected values
     * @param filterOptions
     * @param prop
     * @param selected
     * @param selectedProp
     * @returns {Array}
     */
    getFilterValuesByProperty(filterOptions: ListFilterOption[], prop: string, selected: any, selectedProp: string) {
      const selectedValues = this._convertToInt(selected);
      selectedProp = selectedProp || 'id';
      return filterOptions && filterOptions.length && selectedValues && selectedValues.length
        ? filterOptions.filter((opt) => selectedValues.indexOf(opt[selectedProp]) > -1).map((opt) => opt[prop])
        : [];
    }

    _convertToInt(data: []) {
      return data instanceof Array ? data.map((d) => parseInt(d, 10)) : [];
    }
  }
  return ListFiltersClass;
}

export default ListFiltersMixin;
