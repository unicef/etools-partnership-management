import {GenericObject} from '@unicef-polymer/etools-types';
import pick from 'lodash-es/pick';
import {copy} from '@unicef-polymer/etools-utils/dist/general.util';

export class ModelsCommon {
  setObjProperties(data: GenericObject) {
    Object.assign(this, copy(pick(data, Object.keys(this as GenericObject))));
  }
}
