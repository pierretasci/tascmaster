const Mutations = require('../../../scripts/store/mutations');
const Helpers = require('../../../scripts/store/helpers');
const sinon = require('sinon');
const { assert } = require('chai');

describe('StoreTest', function() {
  let sandbox;
  let clock;
  let persist;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    clock = sinon.useFakeTimers(new Date().getTime());

    persist = sinon.stub(Helpers, 'persistState');
    persist.returns(true);
  });

  afterEach(function() {
    sandbox.restore();
    clock.restore();
    persist.restore();
  });

  describe('#addArtificialTime', function() {
    it('invalid payload', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.addArtificialTime(state));
      assert.isFalse(persist.called);
    });

    it('invalid id', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.addArtificialTime(state, {}));
      assert.isFalse(persist.called);
    });

    it('invalid diff', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.addArtificialTime(state, { id: 'test' }));
      assert.isFalse(persist.called);
    });

    it('invalid diff type', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.addArtificialTime(state,
        { id: 'test', diff: '1' }));
      assert.isFalse(persist.called);
    });

    it('adds positive artificial time', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      Mutations.addArtificialTime(state, { id: 'test', diff: 1 });
      assert.deepEqual(state.projects[0].artificialTime, [1]);
      assert.isTrue(persist.called);
    });

    it('adds negative artificial time', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      Mutations.addArtificialTime(state, { id: 'test', diff: -1 });
      assert.deepEqual(state.projects[0].artificialTime, [-1]);
      assert.isTrue(persist.called);
    });

    it('adds multiple artificial time', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      Mutations.addArtificialTime(state, { id: 'test', diff: -1 });
      Mutations.addArtificialTime(state, { id: 'test', diff: 10 });
      assert.deepEqual(state.projects[0].artificialTime, [-1, 10]);
      assert.isTrue(persist.called);
    });
  });

  describe('#addProject', function() {
    it('invalid payload', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.addProject(state));
      assert.isFalse(persist.called);
    });

    it('invalid id', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.addProject(state, {}));
      assert.isFalse(persist.called);
    });

    it('id exists', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.addProject(state, { id: 'test' }));
      assert.isFalse(persist.called);
    });

    it('adds project', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      const newProject = Helpers.createNewProject('test2', 'Test 2');
      Mutations.addProject(state, newProject);

      assert.lengthOf(state.projects, 2);
      assert.deepEqual(state.projects[1], newProject);
      assert.isTrue(persist.called);
    });
  });

  describe('#addAndStartProject', function() {
    it('invalid payload', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.addAndStartProject(state));
      assert.isFalse(persist.called);
    });

    it('invalid id', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.addAndStartProject(state, {}));
      assert.isFalse(persist.called);
    });

    it('id exists', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.addAndStartProject(state,
          { project: { id: 'test' }}));
      assert.isFalse(persist.called);
    });

    it('adds project', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      const newProject = Helpers.createNewProject('test2', 'Test 2');
      Mutations.addAndStartProject(state,
          { project: newProject });

      newProject.active = true;
      newProject.currentStart = new Date().getTime();

      assert.lengthOf(state.projects, 2);
      assert.deepEqual(state.projects[1], newProject);
      assert.isTrue(persist.called);
    });

    it('adds project and disables all other projects', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      state.projects[0].active = true;
      const start1 = new Date().getTime();
      state.projects[0].currentStart = start1;

      clock.tick(1000 * 60);

      const newProject = Helpers.createNewProject('test2', 'Test 2');
      Mutations.addAndStartProject(state,
          { project: newProject });

      newProject.active = true;
      newProject.currentStart = new Date().getTime();

      assert.lengthOf(state.projects, 2);

      assert.isFalse(state.projects[0].active);
      assert.deepEqual(state.projects[0].increments,
          [{ start: start1, end: new Date().getTime() }]);

      assert.deepEqual(state.projects[1], newProject);
      assert.isTrue(persist.called);
    });

    it('adds project and keeps all other projects going', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      state.projects[0].active = true;
      const start1 = new Date().getTime();
      state.projects[0].currentStart = start1;

      clock.tick(1000 * 60);

      const newProject = Helpers.createNewProject('test2', 'Test 2');
      Mutations.addAndStartProject(state,
          { project: newProject, overrideStart: false });

      newProject.active = true;
      newProject.currentStart = new Date().getTime();

      assert.lengthOf(state.projects, 2);

      assert.isTrue(state.projects[0].active);
      assert.lengthOf(state.projects[0].increments, 0);

      assert.deepEqual(state.projects[1], newProject);
      assert.isTrue(persist.called);
    });
  });
});
