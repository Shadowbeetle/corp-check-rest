import 'jest';
jest.mock('request-promise-native');
const request = require('request-promise-native');

import { container } from 'functionly';
import { Qualification } from 'corp-check-core';
import { StateType } from '../src/types';

import { Badge } from '../src/services/badge';
import { IsExpiredResult, StartPackageValidation } from '../src/services/checker';
import { Evaluate } from '../src/services/evaluate';
import { GetNpmInfo } from '../src/services/npm';
import { ValidationStart } from '../src/services/validationStart';

describe('services', () => {
  describe('Badge', () => {
    let badge: Badge = null;
    beforeAll(() => {
      badge = container.resolve(Badge);
    });

    it('no params', async () => {
      const res = await badge.handle(undefined, undefined, undefined);
      expect(res).toEqual(null);
    });

    it('pending', async () => {
      const files: any = {
        async getObject({ Key }) {
          expect(Key).toEqual('/images/status/corp-check-inprogress.svg');

          return {
            Body: 'resultContent'
          };
        }
      };
      const packageInfo: any = { state: { type: StateType.PENDING } };

      const res = await badge.handle(packageInfo, undefined, files);
      expect(res).toEqual('resultContent');
    });

    it('failed', async () => {
      const files: any = {
        async getObject({ Key }) {
          expect(Key).toEqual('/images/status/corp-check-failed.svg');

          return {
            Body: 'resultContent'
          };
        }
      };
      const packageInfo: any = { state: { type: StateType.FAILED } };

      const res = await badge.handle(packageInfo, undefined, files);
      expect(res).toEqual('resultContent');
    });

    it('succeeded - no result', async () => {
      const files: any = {
        async getObject({ Key }) {
          expect(Key).toEqual('/images/status/corp-check-failed.svg');

          return {
            Body: 'resultContent'
          };
        }
      };
      const packageInfo: any = { state: { type: StateType.SUCCEEDED } };
      const evaluationInfo: any = { result: null };

      const res = await badge.handle(packageInfo, evaluationInfo, files);
      expect(res).toEqual('resultContent');
    });

    it('succeeded - accepted', async () => {
      const files: any = {
        async getObject({ Key }) {
          expect(Key).toEqual('/images/status/corp-check-accepted.svg');

          return {
            Body: 'resultContent'
          };
        }
      };
      const packageInfo: any = { state: { type: StateType.SUCCEEDED } };
      const evaluationInfo: any = { result: { qualification: Qualification.ACCEPTED } };

      const res = await badge.handle(packageInfo, evaluationInfo, files);
      expect(res).toEqual('resultContent');
    });

    it('succeeded - recommended', async () => {
      const files: any = {
        async getObject({ Key }) {
          expect(Key).toEqual('/images/status/corp-check-recommended.svg');

          return {
            Body: 'resultContent'
          };
        }
      };
      const packageInfo: any = { state: { type: StateType.SUCCEEDED } };
      const evaluationInfo: any = { result: { qualification: Qualification.RECOMMENDED } };

      const res = await badge.handle(packageInfo, evaluationInfo, files);
      expect(res).toEqual('resultContent');
    });

    it('succeeded - rejected', async () => {
      const files: any = {
        async getObject({ Key }) {
          expect(Key).toEqual('/images/status/corp-check-rejected.svg');

          return {
            Body: 'resultContent'
          };
        }
      };
      const packageInfo: any = { state: { type: StateType.SUCCEEDED } };
      const evaluationInfo: any = { result: { qualification: Qualification.REJECTED } };

      const res = await badge.handle(packageInfo, evaluationInfo, files);
      expect(res).toEqual('resultContent');
    });

    it('succeeded - default', async () => {
      const files: any = {
        async getObject({ Key }) {
          expect(Key).toEqual('/images/status/corp-check-failed.svg');

          return {
            Body: 'resultContent'
          };
        }
      };
      const packageInfo: any = { state: { type: StateType.SUCCEEDED } };
      const evaluationInfo: any = { result: {} };

      const res = await badge.handle(packageInfo, evaluationInfo, files);
      expect(res).toEqual('resultContent');
    });
  });

  describe('IsExpiredResult', () => {
    let isExpiredResult: IsExpiredResult = null;
    beforeAll(() => {
      isExpiredResult = container.resolve(IsExpiredResult);
    });

    it('no params', async () => {
      try {
        const res = await isExpiredResult.handle(undefined, undefined, undefined, undefined);
        expect(false).toEqual(true);
      } catch (e) {
        expect(true).toEqual(true);
      }
    });

    it('pending', async () => {
      const packageInfo: any = { hash: '1', date: Date.now(), state: { type: StateType.PENDING } };

      const res = await isExpiredResult.handle(packageInfo, false, false, undefined);
      expect(res).toEqual(false);
    });

    it('failed', async () => {
      const packageInfo: any = { hash: '1', date: Date.now(), state: { type: StateType.FAILED } };

      const res = await isExpiredResult.handle(packageInfo, false, false, undefined);
      expect(res).toEqual(true);
    });

    it('succeeded', async () => {
      const packageInfo: any = { hash: '1', date: Date.now(), state: { type: StateType.SUCCEEDED } };

      const res = await isExpiredResult.handle(packageInfo, false, false, undefined);
      expect(res).toEqual(false);
    });

    it('pending force', async () => {
      let counter = 0;
      const packageInfoApi: any = {
        async updateMany(filter, update) {
          expect(filter).toEqual({ hash: '1' });
          expect(update).toEqual({ latest: false });
          counter++;
        }
      };
      const packageInfo: any = { hash: '1', date: Date.now(), state: { type: StateType.PENDING } };

      const res = await isExpiredResult.handle(packageInfo, false, true, packageInfoApi);
      expect(res).toEqual(true);
      expect(counter).toEqual(1);
    });

    it('failed force', async () => {
      let counter = 0;
      const packageInfoApi: any = {
        async updateMany(filter, update) {
          expect(filter).toEqual({ hash: '1' });
          expect(update).toEqual({ latest: false });
          counter++;
        }
      };
      const packageInfo: any = { hash: '1', date: Date.now(), state: { type: StateType.FAILED } };

      const res = await isExpiredResult.handle(packageInfo, false, true, packageInfoApi);
      expect(res).toEqual(true);
      expect(counter).toEqual(1);
    });

    it('succeeded force', async () => {
      let counter = 0;
      const packageInfoApi: any = {
        async updateMany(filter, update) {
          expect(filter).toEqual({ hash: '1' });
          expect(update).toEqual({ latest: false });
          counter++;
        }
      };
      const packageInfo: any = { hash: '1', date: Date.now(), state: { type: StateType.SUCCEEDED } };

      const res = await isExpiredResult.handle(packageInfo, false, true, packageInfoApi);
      expect(res).toEqual(true);
      expect(counter).toEqual(1);
    });

    it('pending update', async () => {
      const packageInfo: any = { hash: '1', date: Date.now(), state: { type: StateType.PENDING } };

      const res = await isExpiredResult.handle(packageInfo, true, false, undefined);
      expect(res).toEqual(false);
    });

    it('failed update', async () => {
      let counter = 0;
      const packageInfoApi: any = {
        async updateMany(filter, update) {
          expect(filter).toEqual({ hash: '1' });
          expect(update).toEqual({ latest: false });
          counter++;
        }
      };
      const packageInfo: any = { hash: '1', date: Date.now(), state: { type: StateType.FAILED } };

      const res = await isExpiredResult.handle(packageInfo, true, false, packageInfoApi);
      expect(res).toEqual(true);
      expect(counter).toEqual(1);
    });

    it('succeeded update', async () => {
      const packageInfo: any = { hash: '1', date: Date.now(), state: { type: StateType.SUCCEEDED } };

      const res = await isExpiredResult.handle(packageInfo, true, false, undefined);
      expect(res).toEqual(false);
    });

    it('succeeded expired', async () => {
      const packageInfo: any = {
        hash: '1',
        date: Date.now() - (24 * 60 * 60 * 1000 + 1000),
        state: { type: StateType.SUCCEEDED }
      };

      const res = await isExpiredResult.handle(packageInfo, false, false, undefined);
      expect(res).toEqual(true);
    });

    it('succeeded expired update', async () => {
      let counter = 0;
      const packageInfoApi: any = {
        async updateMany(filter, update) {
          expect(filter).toEqual({ hash: '1' });
          expect(update).toEqual({ latest: false });
          counter++;
        }
      };
      const packageInfo: any = {
        hash: '1',
        date: Date.now() - (24 * 60 * 60 * 1000 + 1000),
        state: { type: StateType.SUCCEEDED }
      };

      const res = await isExpiredResult.handle(packageInfo, false, true, packageInfoApi);
      expect(res).toEqual(true);
      expect(counter).toEqual(1);
    });

    it('succeeded expired force', async () => {
      let counter = 0;
      const packageInfoApi: any = {
        async updateMany(filter, update) {
          expect(filter).toEqual({ hash: '1' });
          expect(update).toEqual({ latest: false });
          counter++;
        }
      };
      const packageInfo: any = {
        hash: '1',
        date: Date.now() - (24 * 60 * 60 * 1000 + 1000),
        state: { type: StateType.SUCCEEDED }
      };

      const res = await isExpiredResult.handle(packageInfo, true, false, packageInfoApi);
      expect(res).toEqual(true);
      expect(counter).toEqual(1);
    });

    it('succeeded custom expiration', async () => {
      const days = 3;
      expect(process.env.PACKAGE_VALIDATION_EXPIRATION_IN_DAYS).toEqual(undefined);
      process.env.PACKAGE_VALIDATION_EXPIRATION_IN_DAYS = days;

      const packageInfo: any = {
        hash: '1',
        date: Date.now() - (days * 24 * 60 * 60 * 1000 - 1000),
        state: { type: StateType.SUCCEEDED }
      };

      const res = await isExpiredResult.handle(packageInfo, true, false, undefined);
      expect(res).toEqual(false);

      delete process.env.PACKAGE_VALIDATION_EXPIRATION_IN_DAYS;
      expect(process.env.PACKAGE_VALIDATION_EXPIRATION_IN_DAYS).toEqual(undefined);
    });

    it('succeeded expired custom expiration', async () => {
      const days = 3;
      expect(process.env.PACKAGE_VALIDATION_EXPIRATION_IN_DAYS).toEqual(undefined);
      process.env.PACKAGE_VALIDATION_EXPIRATION_IN_DAYS = days;

      let counter = 0;
      const packageInfoApi: any = {
        async updateMany(filter, update) {
          expect(filter).toEqual({ hash: '1' });
          expect(update).toEqual({ latest: false });
          counter++;
        }
      };
      const packageInfo: any = {
        hash: '1',
        date: Date.now() - (days * 24 * 60 * 60 * 1000 + 1000),
        state: { type: StateType.SUCCEEDED }
      };

      const res = await isExpiredResult.handle(packageInfo, true, false, packageInfoApi);
      expect(res).toEqual(true);
      expect(counter).toEqual(1);

      delete process.env.PACKAGE_VALIDATION_EXPIRATION_IN_DAYS;
      expect(process.env.PACKAGE_VALIDATION_EXPIRATION_IN_DAYS).toEqual(undefined);
    });
  });

  describe('StartPackageValidation', () => {
    let startPackageValidation: StartPackageValidation = null;
    beforeAll(() => {
      startPackageValidation = container.resolve(StartPackageValidation);
    });

    it('no params', async () => {
      let counter = 0;
      const taskChannel: any = {
        assertQueue() {
          counter++;
        },
        sendToQueue(buffer) {
          counter++;
          expect(JSON.parse(buffer.toString('utf8'))).toEqual({});
        },
        waitForConfirms() {
          counter++;
          return new Promise(r =>
            setTimeout(() => {
              counter++;
              r();
            }, 10)
          );
        }
      };

      const res = await startPackageValidation.handle(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        taskChannel
      );
      expect(res).toEqual(undefined);
      expect(counter).toEqual(4);
    });

    it('packageName', async () => {
      let counter = 0;
      const taskChannel: any = {
        assertQueue() {
          counter++;
        },
        sendToQueue(buffer) {
          counter++;
          expect(JSON.parse(buffer.toString('utf8'))).toEqual({
            cid: '1',
            pkg: 'packageName'
          });
        },
        waitForConfirms() {
          counter++;
          return new Promise(r =>
            setTimeout(() => {
              counter++;
              r();
            }, 10)
          );
        }
      };

      const res = await startPackageValidation.handle(
        '1',
        'packageName',
        undefined,
        undefined,
        undefined,
        undefined,
        taskChannel
      );
      expect(res).toEqual(undefined);
      expect(counter).toEqual(4);
    });

    it('packageJSON', async () => {
      let counter = 0;
      const taskChannel: any = {
        assertQueue() {
          counter++;
        },
        sendToQueue(buffer) {
          counter++;
          expect(JSON.parse(buffer.toString('utf8'))).toEqual({
            cid: '1',
            pkg: 'packageJSONstring'
          });
        },
        waitForConfirms() {
          counter++;
          return new Promise(r =>
            setTimeout(() => {
              counter++;
              r();
            }, 10)
          );
        }
      };

      const res = await startPackageValidation.handle(
        '1',
        undefined,
        'packageJSONstring',
        undefined,
        undefined,
        undefined,
        taskChannel
      );
      expect(res).toEqual(undefined);
      expect(counter).toEqual(4);
    });

    it('packageName and packageJSON', async () => {
      let counter = 0;
      const taskChannel: any = {
        assertQueue() {
          counter++;
        },
        sendToQueue(buffer) {
          counter++;
          expect(JSON.parse(buffer.toString('utf8'))).toEqual({
            cid: '1',
            pkg: 'packageJSONstring'
          });
        },
        waitForConfirms() {
          counter++;
          return new Promise(r =>
            setTimeout(() => {
              counter++;
              r();
            }, 10)
          );
        }
      };

      const res = await startPackageValidation.handle(
        '1',
        'name',
        'packageJSONstring',
        undefined,
        undefined,
        undefined,
        taskChannel
      );
      expect(res).toEqual(undefined);
      expect(counter).toEqual(4);
    });

    it('packageLock', async () => {
      let counter = 0;
      const taskChannel: any = {
        assertQueue() {
          counter++;
        },
        sendToQueue(buffer) {
          counter++;
          expect(JSON.parse(buffer.toString('utf8'))).toEqual({
            cid: '1',
            pkg: 'packageJSONstring',
            packageLock: 'packageLockContent'
          });
        },
        waitForConfirms() {
          counter++;
          return new Promise(r =>
            setTimeout(() => {
              counter++;
              r();
            }, 10)
          );
        }
      };

      const res = await startPackageValidation.handle(
        '1',
        undefined,
        'packageJSONstring',
        'packageLockContent',
        undefined,
        undefined,
        taskChannel
      );
      expect(res).toEqual(undefined);
      expect(counter).toEqual(4);
    });

    it('yarnLock', async () => {
      let counter = 0;
      const taskChannel: any = {
        assertQueue() {
          counter++;
        },
        sendToQueue(buffer) {
          counter++;
          expect(JSON.parse(buffer.toString('utf8'))).toEqual({
            cid: '1',
            pkg: 'packageJSONstring',
            yarnLock: 'yarnLockContent'
          });
        },
        waitForConfirms() {
          counter++;
          return new Promise(r =>
            setTimeout(() => {
              counter++;
              r();
            }, 10)
          );
        }
      };

      const res = await startPackageValidation.handle(
        '1',
        undefined,
        'packageJSONstring',
        undefined,
        'yarnLockContent',
        undefined,
        taskChannel
      );
      expect(res).toEqual(undefined);
      expect(counter).toEqual(4);
    });

    it('isProduction true', async () => {
      let counter = 0;
      const taskChannel: any = {
        assertQueue() {
          counter++;
        },
        sendToQueue(buffer) {
          counter++;
          expect(JSON.parse(buffer.toString('utf8'))).toEqual({
            cid: '1',
            pkg: 'packageJSONstring',
            production: true
          });
        },
        waitForConfirms() {
          counter++;
          return new Promise(r =>
            setTimeout(() => {
              counter++;
              r();
            }, 10)
          );
        }
      };

      const res = await startPackageValidation.handle(
        '1',
        undefined,
        'packageJSONstring',
        undefined,
        undefined,
        true,
        taskChannel
      );
      expect(res).toEqual(undefined);
      expect(counter).toEqual(4);
    });

    it('isProduction false', async () => {
      let counter = 0;
      const taskChannel: any = {
        assertQueue() {
          counter++;
        },
        sendToQueue(buffer) {
          counter++;
          expect(JSON.parse(buffer.toString('utf8'))).toEqual({
            cid: '1',
            pkg: 'packageJSONstring',
            production: false
          });
        },
        waitForConfirms() {
          counter++;
          return new Promise(r =>
            setTimeout(() => {
              counter++;
              r();
            }, 10)
          );
        }
      };

      const res = await startPackageValidation.handle(
        '1',
        undefined,
        'packageJSONstring',
        undefined,
        undefined,
        false,
        taskChannel
      );
      expect(res).toEqual(undefined);
      expect(counter).toEqual(4);
    });
  });

  describe('Evaluate', () => {
    let evaluate: Evaluate = null;
    beforeAll(() => {
      evaluate = container.resolve(Evaluate);
    });

    it('no params', async () => {
      try {
        const res = await evaluate.handle(undefined, undefined);
        expect(false).toEqual(true);
      } catch (e) {
        expect(true).toEqual(true);
      }
    });

    it('no data', async () => {
      try {
        const res = await evaluate.handle(undefined, {});
        expect(false).toEqual(true);
      } catch (e) {
        expect(true).toEqual(true);
      }
    });

    it('no ruleSet', async () => {
      try {
        const res = await evaluate.handle({}, undefined);
        expect(false).toEqual(true);
      } catch (e) {
        expect(true).toEqual(true);
      }
    });

    // it('#1', async () => {
    //   const data = {
    //     meta: {},
    //     tree: {},
    //     unknownPackages: []
    //   };
    //   const ruleSet = {
    //     license: {},
    //     version: {},
    //     npmScores: {}
    //   };

    //   const res = await evaluate.handle(data, ruleSet);
    //   expect(res).toEqual({
    //     rootEvaluation: {
    //       nodeName: 'name',
    //       nodeVersion: 'version',
    //       evaluations: [],
    //       nodeScore: 1,
    //       dependencies: []
    //     },
    //     qualification: Qualification.RECOMMENDED
    //   });
    // });
  });

  describe('GetNpmInfo', () => {
    let getNpmInfo: any = null;
    beforeAll(() => {
      getNpmInfo = container.resolve(GetNpmInfo);
    });

    beforeEach(() => {
      request.mockClear();
    });

    it('no params', async () => {
      try {
        const res = await getNpmInfo.handle(undefined, undefined);
        expect(false).toEqual(true);
      } catch (e) {
        expect(true).toEqual(true);
      }
    });

    it('request error', async () => {
      const mockResult = {};
      request.mockReturnValue(Promise.reject(mockResult));

      try {
        const res = await getNpmInfo.handle('name');
        expect(false).toEqual(true);
      } catch (e) {
        expect(e.message).toEqual("'name' npm package not exists");
      }
    });

    it('missing package', async () => {
      const mockResult = {};
      request.mockReturnValue(Promise.resolve(mockResult));

      try {
        const res = await getNpmInfo.handle('name');
        expect(false).toEqual(true);
      } catch (e) {
        expect(e.message).toEqual("'name' npm package not exists");
      }
    });

    it('missing package version', async () => {
      const mockResult = {
        name: 'name',
        'dist-tags': { latest: 'latestVersion' },
        versions: { latestVersion: { versionData: 1 } }
      };
      request.mockReturnValue(Promise.resolve(mockResult));

      try {
        const res = await getNpmInfo.handle('name', 'someVersion');
        expect(false).toEqual(true);
      } catch (e) {
        expect(e.message).toEqual("'someVersion' version not exists for package 'name'");
      }
    });

    it('name', async () => {
      const mockResult = {
        name: 'name',
        'dist-tags': { latest: 'latestVersion' },
        versions: { latestVersion: { versionData: 1 } }
      };
      request.mockReturnValue(Promise.resolve(mockResult));

      const res = await getNpmInfo.handle('name');
      expect(res).toEqual({
        name: 'name',
        version: 'latestVersion',
        latestVersion: 'latestVersion',
        versionJSON: { versionData: 1 },
        raw: mockResult
      });
    });

    it('name@version', async () => {
      const mockResult = {
        name: 'name',
        'dist-tags': { latest: 'latestVersion' },
        versions: { latestVersion: { versionData: 1 } }
      };
      request.mockReturnValue(Promise.resolve(mockResult));

      const res = await getNpmInfo.handle('name', 'latestVersion');
      expect(res).toEqual({
        name: 'name',
        version: 'latestVersion',
        latestVersion: 'latestVersion',
        versionJSON: { versionData: 1 },
        raw: mockResult
      });
    });

    it('name@notLatestVersion', async () => {
      const mockResult = {
        name: 'name',
        'dist-tags': { latest: 'latestVersion' },
        versions: { latestVersion: { versionData: 1 }, notLatestVersion: { versionData: 2 } }
      };
      request.mockReturnValue(Promise.resolve(mockResult));

      const res = await getNpmInfo.handle('name', 'notLatestVersion');
      expect(res).toEqual({
        name: 'name',
        version: 'notLatestVersion',
        latestVersion: 'latestVersion',
        versionJSON: { versionData: 2 },
        raw: mockResult
      });
    });

    it('@scope/name', async () => {
      const mockResult = {
        name: '@scope/name',
        'dist-tags': { latest: 'latestVersion' },
        versions: { latestVersion: { versionData: 1 } }
      };
      request.mockReturnValue(Promise.resolve(mockResult));

      const res = await getNpmInfo.handle('@scope/name');
      expect(res).toEqual({
        name: '@scope/name',
        version: 'latestVersion',
        latestVersion: 'latestVersion',
        versionJSON: { versionData: 1 },
        raw: mockResult
      });

      expect(request).lastCalledWith({
        uri: 'https://registry.npmjs.org/@scope%2Fname',
        json: true
      });
    });
  });

  describe('ValidationStart', () => {
    let validationStart: ValidationStart = null;
    beforeAll(() => {
      validationStart = container.resolve(ValidationStart);
    });

    it('no params', async () => {
      try {
        const res = await validationStart.handle(
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        );
        expect(false).toEqual(true);
      } catch (e) {
        expect(true).toEqual(true);
      }
    });

    it('has evaluationInfo with result', async () => {
      const evaluationInfo: any = { result: {} };

      const packageInfoFromResult: any = {
        packageInfo: {
          _id: '321',
          packageName: 'asd',
          isProduction: true,
          state: {
            type: StateType.SUCCEEDED
          }
        },
        created: false
      };
      const evaluationsApi: any = {
        fromRuleSet(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return evaluationInfo;
        }
      };

      const isExpiredResult: any = async params => {
        const { packageInfo, update, force } = params;
        expect(Object.keys(params)).toEqual([ 'packageInfo', 'update', 'force' ]);
        expect(packageInfo).toEqual(packageInfoFromResult.packageInfo);
        expect(update).toEqual(true);
        expect(force).toEqual(false);

        return false;
      };

      const res = await validationStart.handle(
        false,
        null,
        packageInfoFromResult,
        undefined,
        undefined,
        undefined,
        undefined,
        evaluationsApi,
        isExpiredResult,
        undefined
      );
      expect(res).toEqual(evaluationInfo);
    });

    it('has evaluationInfo without result', async () => {
      const evaluationInfo: any = {};

      const packageInfoFromResult: any = {
        packageInfo: {
          _id: '321',
          packageName: 'asd',
          isProduction: true,
          state: {
            type: StateType.SUCCEEDED
          },
          meta: { meta: 1 }
        },
        created: false
      };
      const evaluationsApi: any = {
        fromRuleSet(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return evaluationInfo;
        },
        evaluate(params) {
          const { evaluationInfo, data } = params;
          expect(Object.keys(params)).toEqual([ 'evaluationInfo', 'data' ]);
          expect(evaluationInfo).toEqual(evaluationInfo);
          expect(data).toEqual({ meta: 1 });
        }
      };

      const isExpiredResult: any = async params => {
        const { packageInfo, update, force } = params;
        expect(Object.keys(params)).toEqual([ 'packageInfo', 'update', 'force' ]);
        expect(packageInfo).toEqual(packageInfoFromResult.packageInfo);
        expect(update).toEqual(true);
        expect(force).toEqual(false);

        return false;
      };

      const res = await validationStart.handle(
        false,
        null,
        packageInfoFromResult,
        undefined,
        undefined,
        undefined,
        undefined,
        evaluationsApi,
        isExpiredResult,
        undefined
      );
      expect(res).toEqual(evaluationInfo);
    });

    it('created packageInfo', async () => {
      const evaluationInfo: any = { _id: '1' };

      const packageInfoFromResult: any = {
        packageInfo: {
          _id: '321',
          packageName: 'asd',
          isProduction: true,
          state: {
            type: StateType.PENDING
          }
        },
        created: true
      };
      const evaluationsApi: any = {
        fromRuleSet(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return null;
        },
        create(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return evaluationInfo;
        }
      };

      const isExpiredResult: any = async params => {
        const { packageInfo, update, force } = params;
        expect(Object.keys(params)).toEqual([ 'packageInfo', 'update', 'force' ]);
        expect(packageInfo).toEqual(packageInfoFromResult.packageInfo);
        expect(update).toEqual(true);
        expect(force).toEqual(false);

        return false;
      };

      const startPackageValidation: any = async params => {
        const { packageName, packageJSON, packageLock, yarnLock, cid, isProduction } = params;
        expect(Object.keys(params)).toEqual([
          'packageName',
          'packageJSON',
          'packageLock',
          'yarnLock',
          'cid',
          'isProduction'
        ]);
        expect(packageName).toEqual(packageInfoFromResult.packageInfo.packageName);
        expect(packageJSON).toEqual(undefined);
        expect(packageLock).toEqual(undefined);
        expect(yarnLock).toEqual(undefined);
        expect(cid).toEqual(evaluationInfo._id);
        expect(isProduction).toEqual(packageInfoFromResult.packageInfo.isProduction);
      };

      const res = await validationStart.handle(
        false,
        null,
        packageInfoFromResult,
        undefined,
        undefined,
        undefined,
        undefined,
        evaluationsApi,
        isExpiredResult,
        startPackageValidation
      );
      expect(res).toEqual(evaluationInfo);
    });

    it('created packageInfo with force', async () => {
      const evaluationInfo: any = { _id: '1' };

      const packageInfoFromResult: any = {
        packageInfo: {
          _id: '321',
          packageName: 'asd',
          isProduction: true,
          state: {
            type: StateType.PENDING
          }
        },
        created: true
      };
      const evaluationsApi: any = {
        fromRuleSet(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return null;
        },
        create(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return evaluationInfo;
        }
      };

      const isExpiredResult: any = async params => {
        const { packageInfo, update, force } = params;
        expect(Object.keys(params)).toEqual([ 'packageInfo', 'update', 'force' ]);
        expect(packageInfo).toEqual(packageInfoFromResult.packageInfo);
        expect(update).toEqual(true);
        expect(force).toEqual(false);

        return false;
      };

      const startPackageValidation: any = async params => {
        const { packageName, packageJSON, packageLock, yarnLock, cid, isProduction } = params;
        expect(Object.keys(params)).toEqual([
          'packageName',
          'packageJSON',
          'packageLock',
          'yarnLock',
          'cid',
          'isProduction'
        ]);
        expect(packageName).toEqual(packageInfoFromResult.packageInfo.packageName);
        expect(packageJSON).toEqual(undefined);
        expect(packageLock).toEqual(undefined);
        expect(yarnLock).toEqual(undefined);
        expect(cid).toEqual(evaluationInfo._id);
        expect(isProduction).toEqual(packageInfoFromResult.packageInfo.isProduction);
      };

      const res = await validationStart.handle(
        true,
        null,
        packageInfoFromResult,
        undefined,
        undefined,
        undefined,
        undefined,
        evaluationsApi,
        isExpiredResult,
        startPackageValidation
      );
      expect(res).toEqual(evaluationInfo);
    });

    it('packageJSON', async () => {
      const evaluationInfo: any = { _id: '1' };

      const packageInfoFromResult: any = {
        packageInfo: {
          _id: '321',
          packageName: 'asd',
          isProduction: true,
          state: {
            type: StateType.PENDING
          }
        },
        created: true
      };
      const evaluationsApi: any = {
        fromRuleSet(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return null;
        },
        create(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return evaluationInfo;
        }
      };

      const isExpiredResult: any = async params => {
        const { packageInfo, update, force } = params;
        expect(Object.keys(params)).toEqual([ 'packageInfo', 'update', 'force' ]);
        expect(packageInfo).toEqual(packageInfoFromResult.packageInfo);
        expect(update).toEqual(true);
        expect(force).toEqual(false);

        return false;
      };

      const startPackageValidation: any = async params => {
        const { packageName, packageJSON, packageLock, yarnLock, cid, isProduction } = params;
        expect(Object.keys(params)).toEqual([
          'packageName',
          'packageJSON',
          'packageLock',
          'yarnLock',
          'cid',
          'isProduction'
        ]);
        expect(packageName).toEqual(packageInfoFromResult.packageInfo.packageName);
        expect(packageJSON).toEqual('packageJSONContent');
        expect(packageLock).toEqual(undefined);
        expect(yarnLock).toEqual(undefined);
        expect(cid).toEqual(evaluationInfo._id);
        expect(isProduction).toEqual(packageInfoFromResult.packageInfo.isProduction);
      };

      const res = await validationStart.handle(
        false,
        null,
        packageInfoFromResult,
        'packageJSONContent',
        undefined,
        undefined,
        undefined,
        evaluationsApi,
        isExpiredResult,
        startPackageValidation
      );
      expect(res).toEqual(evaluationInfo);
    });

    it('packageLock', async () => {
      const evaluationInfo: any = { _id: '1' };

      const packageInfoFromResult: any = {
        packageInfo: {
          _id: '321',
          packageName: 'asd',
          isProduction: true,
          state: {
            type: StateType.PENDING
          }
        },
        created: true
      };
      const evaluationsApi: any = {
        fromRuleSet(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return null;
        },
        create(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return evaluationInfo;
        }
      };

      const isExpiredResult: any = async params => {
        const { packageInfo, update, force } = params;
        expect(Object.keys(params)).toEqual([ 'packageInfo', 'update', 'force' ]);
        expect(packageInfo).toEqual(packageInfoFromResult.packageInfo);
        expect(update).toEqual(true);
        expect(force).toEqual(false);

        return false;
      };

      const startPackageValidation: any = async params => {
        const { packageName, packageJSON, packageLock, yarnLock, cid, isProduction } = params;
        expect(Object.keys(params)).toEqual([
          'packageName',
          'packageJSON',
          'packageLock',
          'yarnLock',
          'cid',
          'isProduction'
        ]);
        expect(packageName).toEqual(packageInfoFromResult.packageInfo.packageName);
        expect(packageJSON).toEqual('packageJSONContent');
        expect(packageLock).toEqual('packageLockContent');
        expect(yarnLock).toEqual(undefined);
        expect(cid).toEqual(evaluationInfo._id);
        expect(isProduction).toEqual(packageInfoFromResult.packageInfo.isProduction);
      };

      const res = await validationStart.handle(
        false,
        null,
        packageInfoFromResult,
        'packageJSONContent',
        'packageLockContent',
        undefined,
        undefined,
        evaluationsApi,
        isExpiredResult,
        startPackageValidation
      );
      expect(res).toEqual(evaluationInfo);
    });

    it('yarnLock', async () => {
      const evaluationInfo: any = { _id: '1' };

      const packageInfoFromResult: any = {
        packageInfo: {
          _id: '321',
          packageName: 'asd',
          isProduction: true,
          state: {
            type: StateType.PENDING
          }
        },
        created: true
      };
      const evaluationsApi: any = {
        fromRuleSet(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return null;
        },
        create(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return evaluationInfo;
        }
      };

      const isExpiredResult: any = async params => {
        const { packageInfo, update, force } = params;
        expect(Object.keys(params)).toEqual([ 'packageInfo', 'update', 'force' ]);
        expect(packageInfo).toEqual(packageInfoFromResult.packageInfo);
        expect(update).toEqual(true);
        expect(force).toEqual(false);

        return false;
      };

      const startPackageValidation: any = async params => {
        const { packageName, packageJSON, packageLock, yarnLock, cid, isProduction } = params;
        expect(Object.keys(params)).toEqual([
          'packageName',
          'packageJSON',
          'packageLock',
          'yarnLock',
          'cid',
          'isProduction'
        ]);
        expect(packageName).toEqual(packageInfoFromResult.packageInfo.packageName);
        expect(packageJSON).toEqual('packageJSONContent');
        expect(packageLock).toEqual(undefined);
        expect(yarnLock).toEqual('yarnLockContent');
        expect(cid).toEqual(evaluationInfo._id);
        expect(isProduction).toEqual(packageInfoFromResult.packageInfo.isProduction);
      };

      const res = await validationStart.handle(
        false,
        null,
        packageInfoFromResult,
        'packageJSONContent',
        undefined,
        'yarnLockContent',
        undefined,
        evaluationsApi,
        isExpiredResult,
        startPackageValidation
      );
      expect(res).toEqual(evaluationInfo);
    });

    it('expired', async () => {
      const evaluationInfo: any = { _id: '1' };

      const packageInfoFromResult: any = {
        packageInfo: {
          _id: '321',
          packageName: 'asd',
          isProduction: true,
          state: {
            type: StateType.SUCCEEDED
          }
        },
        created: false
      };

      const packageInfoNew = {
        _id: '321',
        packageName: 'qwe',
        isProduction: true,
        state: {
          type: StateType.PENDING
        }
      };

      const evaluationsApi: any = {
        fromRuleSet(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return null;
        },
        create(params) {
          const { packageInfoId, ruleSet } = params;
          expect(Object.keys(params)).toEqual([ 'packageInfoId', 'ruleSet' ]);
          expect(packageInfoId).toEqual('321');
          expect(ruleSet).toEqual(null);

          return evaluationInfo;
        }
      };

      const isExpiredResult: any = async params => {
        const { packageInfo, update, force } = params;
        expect(Object.keys(params)).toEqual([ 'packageInfo', 'update', 'force' ]);
        expect(packageInfo).toEqual(packageInfoFromResult.packageInfo);
        expect(update).toEqual(true);
        expect(force).toEqual(false);

        return true;
      };

      const startPackageValidation: any = async params => {
        const { packageName, packageJSON, packageLock, yarnLock, cid, isProduction } = params;
        expect(Object.keys(params)).toEqual([
          'packageName',
          'packageJSON',
          'packageLock',
          'yarnLock',
          'cid',
          'isProduction'
        ]);
        expect(packageName).toEqual(packageInfoNew.packageName);
        expect(packageJSON).toEqual(undefined);
        expect(packageLock).toEqual(undefined);
        expect(yarnLock).toEqual(undefined);
        expect(cid).toEqual(evaluationInfo._id);
        expect(isProduction).toEqual(packageInfoNew.isProduction);
      };

      const packageInfoApi: any = {
        async create(pi) {
          expect(pi).toEqual(packageInfoFromResult.packageInfo);

          return packageInfoNew
        }
      };

      const res = await validationStart.handle(
        false,
        null,
        packageInfoFromResult,
        undefined,
        undefined,
        undefined,
        packageInfoApi,
        evaluationsApi,
        isExpiredResult,
        startPackageValidation
      );
      expect(res).toEqual(evaluationInfo);
    });
  });
});
