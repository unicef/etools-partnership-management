import {GenericObject} from "../typings/globals.types";

export class ModelsCommon {

  static isPrimitiveValue(value: any) {
    const valueType: string = typeof value;
    return value === null || ['undefined', 'string', 'number', 'boolean'].indexOf(valueType) > -1;
  }

  static getPropertyDataClone(value: any) {
    if (ModelsCommon.isPrimitiveValue(value)) {
      return value;
    } else {
      return JSON.parse(JSON.stringify(value));
    }
  }

  setObjProperties(data: GenericObject, objProperties: string[]) {
    for (const prop in data) {
      if (objProperties.find((p: string) => p === prop)) {
        (this as any)[prop] = ModelsCommon.getPropertyDataClone(data[prop]);
      }
    }
  }

}
