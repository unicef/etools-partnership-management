import * as testingUtils from '../utils/utils';
// @ts-ignore
const TestingUtilsMixin = (baseClass) => class extends baseClass {

  tmplUtility(...args: any[]) {
    const functionName: string = args[0];
    const functionArgs: any[] = args.slice(1);

    // TODO: fix testingUtils[functionName] lint error

    if (typeof testingUtils[functionName] !== 'function') {
      throw new Error('tmplUtility first param is not a function!');
    }

    return testingUtils[functionName](...functionArgs);
  }

};
export default TestingUtilsMixin;
