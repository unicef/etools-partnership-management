import {GenericObject} from '@unicef-polymer/etools-types';
import pick from 'lodash-es/pick';
import {copy} from '../components/utils/utils';

export class ModelsCommon {
  setObjProperties(data: GenericObject) {
    Object.assign(this, copy(pick(data, Object.keys(this as GenericObject))));
  }
}
