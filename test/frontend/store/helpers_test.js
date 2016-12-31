const Helpers = require('../../../scripts/store/helpers');
const sinon = require('sinon');
const { assert } = require('chai');

describe('HelpersTest', function() {
  let sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    clock = sinon.useFakeTimers(new Date().getTime());
  });

  afterEach(function() {
    sandbox.restore();
    clock.restore();
  });

  describe('#deactivateAll()', function() {
    it('should return empty when given empty projects', function() {
      const actual = Helpers.deactivateAll([]);
      assert.sameMembers(actual, []);
    });

    it('should return exact same inactive project', function() {
      const project = Helpers.createNewProject('test_id', 'test_name');
      const actual = Helpers.deactivateAll([project]);
      assert.deepEqual(actual, [project]);
    });

    it('should add an increment for active projects', function() {
      const project = Helpers.createNewProject('test_id', 'test_name');
      project.active = true;
      project.currentStart = 1000;

      const actual = Helpers.deactivateAll([project]);

      project.active = false;
      project.currentStart = -1;
      project.increments.push({
        start: 1000,
        end: new Date().getTime(),
      });

      assert.deepEqual(actual, [project]);
    });

    it('should add an increment with existing increments', function() {
      const project = Helpers.createNewProject('test_id', 'test_name');
      project.increments.push({
        start: 100,
        end: 200,
      });
      project.active = true;
      project.currentStart = 1000;

      const actual = Helpers.deactivateAll([project]);

      project.active = false;
      project.currentStart = -1;
      project.increments.push({
        start: 1000,
        end: new Date().getTime(),
      });

      assert.deepEqual(actual, [project]);
    });
  });

  describe('#createNewProject', function() {
    it('returns a new project', function() {
      const actual = Helpers.createNewProject('test_id', 'test_name');
      assert.deepEqual(actual, {
        id: 'test_id',
        name: 'test_name',
        increments: [],
        artificialTime: [],
        currentStart: -1,
        active: false,
      });
    });
  });

  describe('#findProject', function() {
    it('returns -1 when project not found', function() {
      assert.equal(Helpers.findProject([], 'test_id'), -1);
    });

    it('returns -1 when project not found with data', function() {
      const test1 = Helpers.createNewProject('test1', 'Test 1');
      assert.equal(Helpers.findProject([test1], 'test2'), -1);
    });

    it('returns -1 when no id provided', function() {
      const test1 = Helpers.createNewProject('test1', 'Test 1');
      assert.equal(Helpers.findProject([test1], null), -1);
    });

    it('returns index of found project', function() {
      const test1 = Helpers.createNewProject('test1', 'Test 1');
      assert.equal(Helpers.findProject([test1], 'test1'), 0);
    });

    it('returns index when many projects exist.', function() {
      const projects = [];
      for (let i = 0; i < 100; ++i) {
        projects.push(Helpers.createNewProject('test' + (i+1), 'Test' + (i+1)));
      }

      assert.equal(Helpers.findProject(projects, 'test50'), 49);
    });
  });
});
