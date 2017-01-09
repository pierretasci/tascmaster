const Mutations = require('../../../scripts/store/mutations');
const Helpers = require('../../../scripts/store/helpers');
const moment = require('moment-timezone');
const sinon = require('sinon');
const { assert } = require('chai');
const { ipcRenderer } = require('electron');

describe('StoreTest', function() {
  let sandbox;
  let clock;
  let persist;
  let ipcRendererSend;
  let momentTzGuess;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    clock = sinon.useFakeTimers(new Date().getTime());

    ipcRendererSend = sinon.spy(ipcRenderer, 'send');
    momentTzGuess = sinon.stub(moment.tz, 'guess');
    momentTzGuess.returns('America/Los_Angeles');

    persist = sinon.stub(Helpers, 'persistState');
    persist.returns(true);
  });

  afterEach(function() {
    sandbox.restore();
    clock.restore();
    persist.restore();
    ipcRendererSend.restore();
    momentTzGuess.restore();
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

  describe('#startTimer', function() {
    it('invalid payload', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.startTimer(state));
      assert.isFalse(persist.called);
    });

    it('invalid id', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.startTimer(state, {}));
      assert.isFalse(persist.called);
    });

    it('id does not exist', function() {
      const state = { projects: [ Helpers.createNewProject('test', 'Test') ]};
      assert.isFalse(Mutations.startTimer(state,
          { project: { id: 'test2' }}));
      assert.isFalse(persist.called);
    });

    it('starts project and disables all other projects', function() {
      const state = { projects: [
        Helpers.createNewProject('test', 'Test'),
        Helpers.createNewProject('test2', 'Test 2')
      ]};
      state.projects[0].active = true;
      const start1 = new Date().getTime();
      state.projects[0].currentStart = start1;

      clock.tick(1000 * 60);

      Mutations.startTimer(state, { id: 'test2' });

      const expected = { projects: [
        Helpers.createNewProject('test', 'Test'),
        Helpers.createNewProject('test2', 'Test 2'),
      ]};
      expected.projects[0].increments.push({
        start: start1,
        end: new Date().getTime(),
      });
      expected.projects[1].active = true;
      expected.projects[1].currentStart = new Date().getTime();

      assert.deepEqual(state, expected);
      assert.isTrue(persist.called);
    });

    it('adds project and keeps all other projects going', function() {
      const state = { projects: [
        Helpers.createNewProject('test', 'Test'),
        Helpers.createNewProject('test2', 'Test 2'),
      ]};
      state.projects[0].active = true;
      const start1 = new Date().getTime();
      state.projects[0].currentStart = start1;

      clock.tick(1000 * 60);

      Mutations.startTimer(state, { id: 'test2', overrideStart: false});

      const expected = { projects: [
        Helpers.createNewProject('test', 'Test'),
        Helpers.createNewProject('test2', 'Test 2'),
      ]};
      expected.projects[0].active = true;
      expected.projects[0].currentStart = start1;
      expected.projects[1].active = true;
      expected.projects[1].currentStart = new Date().getTime();

      assert.deepEqual(expected, state);
      assert.isTrue(persist.called);
    });
  });

  describe('#exportToCsv SS', function() {
    it('returns false on incorrect input', function() {
      assert.isFalse(Mutations.exportToCsv({}));
      assert.isFalse(Mutations.exportToCsv({}, {}));
    });

    it('formats one project, one increment', function() {
      const state = { projects: [
        Helpers.createNewProject('test', 'Test 1'),
      ]};
      state.projects[0].increments = [{
        start: moment('2017-01-01 01:00:00 PST').valueOf(),
        end: moment('2017-01-01 01:01:00 PST').valueOf(),
      }];

      Mutations.exportToCsv(state, { type: 'SS' });

      const expected = { fields: ['name', 'start', 'end', 'manual']};
      expected.data = [{
        name: 'Test 1',
        start: '01/01/2017 01:00:00.000 AM PST',
        end: '01/01/2017 01:01:00.000 AM PST',
      }];

      assert.isTrue(ipcRendererSend.called);
      const actual = ipcRendererSend.getCall(0).args[1];
      assert.deepEqual({ type: 'CSV', data: expected }, actual);
    });

    it('formats one project, two artifical times', function() {
      const state = { projects: [
        Helpers.createNewProject('test', 'Test 1'),
      ]};
      state.projects[0].artificialTime = [20, -10];

      Mutations.exportToCsv(state, { type: 'SS' });

      const expected = { fields: ['name', 'start', 'end', 'manual']};
      expected.data = [
        {
          name: 'Test 1',
          manual: 20
        },
        {
          name: 'Test 1',
          manual: -10
        },
      ];

      assert.isTrue(ipcRendererSend.called);
      const actual = ipcRendererSend.getCall(0).args[1];
      assert.deepEqual({ type: 'CSV', data: expected }, actual);
    });

    it('formats two projects, mix artifical times and real times', function() {
      const state = { projects: [
        Helpers.createNewProject('test', 'Test 1'),
        Helpers.createNewProject('test-2', 'Test 2'),
      ]};
      state.projects[0].increments = [{
        start: moment('2017-01-01 01:00:00 PST').valueOf(),
        end: moment('2017-01-01 02:00:00 PST').valueOf(),
      }];
      state.projects[0].artificialTime = [20, -10];

      state.projects[1].increments = [
        {
          start: moment('2017-01-01 02:30:00 PST').valueOf(),
          end: moment('2017-01-01 03:00:00 PST').valueOf(),
        },
        {
          start: moment('2017-01-01 15:00:00 PST').valueOf(),
          end: moment('2017-01-01 15:00:01 PST').valueOf(),
        },
      ];
      state.projects[1].artificialTime = [20000];

      Mutations.exportToCsv(state, { type: 'SS' });

      const expected = { fields: ['name', 'start', 'end', 'manual']};
      expected.data = [
        {
          name: 'Test 1',
          start: '01/01/2017 01:00:00.000 AM PST',
          end: '01/01/2017 02:00:00.000 AM PST',
        },
        {
          name: 'Test 1',
          manual: 20,
        },
        {
          name: 'Test 1',
          manual: -10,
        },
        {
          name: 'Test 2',
          start: '01/01/2017 02:30:00.000 AM PST',
          end: '01/01/2017 03:00:00.000 AM PST',
        },
        {
          name: 'Test 2',
          start: '01/01/2017 03:00:00.000 PM PST',
          end: '01/01/2017 03:00:01.000 PM PST',
        },
        {
          name: 'Test 2',
          manual: 20000,
        },
      ];

      assert.isTrue(ipcRendererSend.called);
      const actual = ipcRendererSend.getCall(0).args[1];
      assert.deepEqual({ type: 'CSV', data: expected }, actual);
    });
  });

  describe('#exportToCsv D', function() {
    it('returns false on incorrect input', function() {
      assert.isFalse(Mutations.exportToCsv({}));
      assert.isFalse(Mutations.exportToCsv({}, {}));
    });

    it('formats a single day of increments', function() {
      const state = { projects: [
        Helpers.createNewProject('test', 'Test 1'),
      ]};
      state.projects[0].increments = [
        {
          start: moment('2017-01-01 01:00:00 PST').valueOf(),
          end: moment('2017-01-01 02:00:00 PST').valueOf(),
        },
        {
          start: moment('2017-01-01 10:00:00 PST').valueOf(),
          end: moment('2017-01-01 13:00:00 PST').valueOf(),
        },
        {
          start: moment('2017-01-01 20:00:00 PST').valueOf(),
          end: moment('2017-01-01 23:59:59 PST').valueOf(),
        },
      ];

      Mutations.exportToCsv(state, { type: 'D' });

      const expected = { fields:
          ['name', 'date', 'hours', 'minutes', 'seconds', 'milliseconds']};
      expected.data = [{
        name: 'Test 1',
        date: '01/01/2017',
        hours: 7,
        minutes: 59,
        seconds: 59,
        milliseconds: 0
      }];

      assert.isTrue(ipcRendererSend.called);
      const actual = ipcRendererSend.getCall(0).args[1];
      assert.deepEqual({ type: 'CSV', data: expected }, actual);
    });

    it('formats a single day of artificial times', function() {
      const state = { projects: [
        Helpers.createNewProject('test', 'Test 1'),
      ]};
      // These are in seconds.
      state.projects[0].artificialTime =
          [4 * 3600, -6 * 3600, 50 * 60];

      Mutations.exportToCsv(state, { type: 'D' });

      const expected = { fields:
          ['name', 'date', 'hours', 'minutes', 'seconds', 'milliseconds']};
      expected.data = [{
        name: 'Test 1',
        hours: -1,
        minutes: -10,
        seconds: 0,
        milliseconds: 0
      }];

      assert.isTrue(ipcRendererSend.called);
      const actual = ipcRendererSend.getCall(0).args[1];
      assert.deepEqual({ type: 'CSV', data: expected }, actual);
    });

    it('formats a multiple days of increments', function() {
      const state = { projects: [
        Helpers.createNewProject('test', 'Test 1'),
      ]};
      state.projects[0].increments = [
        {
          start: moment('2017-01-01 01:00:00 PST').valueOf(),
          end: moment('2017-01-01 02:00:00 PST').valueOf(),
        },
        {
          start: moment('2017-01-01 10:00:00 PST').valueOf(),
          end: moment('2017-01-01 13:00:00 PST').valueOf(),
        },
        {
          start: moment('2017-01-02 00:00:00 PST').valueOf(),
          end: moment('2017-01-02 10:00:00 PST').valueOf(),
        },
      ];

      Mutations.exportToCsv(state, { type: 'D' });

      const expected = { fields:
          ['name', 'date', 'hours', 'minutes', 'seconds', 'milliseconds']};
      expected.data = [
        {
          name: 'Test 1',
          date: '01/01/2017',
          hours: 4,
          minutes: 0,
          seconds: 0,
          milliseconds: 0
        },
        {
          name: 'Test 1',
          date: '01/02/2017',
          hours: 10,
          minutes: 0,
          seconds: 0,
          milliseconds: 0
        },
      ];

      assert.isTrue(ipcRendererSend.called);
      const actual = ipcRendererSend.getCall(0).args[1];
      assert.deepEqual({ type: 'CSV', data: expected }, actual);
    });

    it('formats a multiple days of increments and artificial time', function() {
      const state = { projects: [
        Helpers.createNewProject('test', 'Test 1'),
        Helpers.createNewProject('test', 'Test 2'),
      ]};
      state.projects[0].increments = [
        {
          start: moment('2017-01-01 01:00:00 PST').valueOf(),
          end: moment('2017-01-01 02:00:00 PST').valueOf(),
        },
        {
          start: moment('2017-01-01 10:00:00 PST').valueOf(),
          end: moment('2017-01-01 13:00:00 PST').valueOf(),
        },
        {
          start: moment('2017-01-02 00:00:00 PST').valueOf(),
          end: moment('2017-01-02 10:00:00 PST').valueOf(),
        },
      ];
      state.projects[0].artificialTime = [3600, -60];
      state.projects[1].increments = [
        {
          start: moment('2017-01-01 05:00:00 PST').valueOf(),
          end: moment('2017-01-01 10:00:00 PST').valueOf(),
        },
        {
          start: moment('2017-01-02 10:00:00 PST').valueOf(),
          end: moment('2017-01-02 15:00:00 PST').valueOf(),
        },
        {
          start: moment('2017-01-03 15:00:00 PST').valueOf(),
          end: moment('2017-01-03 20:00:00 PST').valueOf(),
        },
        {
          start: moment('2017-01-04 20:00:00 PST').valueOf(),
          end: moment('2017-01-04 21:00:00 PST').valueOf(),
        },
      ];
      state.projects[1].artificialTime = [-3600];

      Mutations.exportToCsv(state, { type: 'D' });

      const expected = { fields:
          ['name', 'date', 'hours', 'minutes', 'seconds', 'milliseconds']};
      expected.data = [
        {
          name: 'Test 1',
          date: '01/01/2017',
          hours: 4,
          minutes: 0,
          seconds: 0,
          milliseconds: 0
        },
        {
          name: 'Test 1',
          date: '01/02/2017',
          hours: 10,
          minutes: 0,
          seconds: 0,
          milliseconds: 0
        },
        {
          name: 'Test 1',
          hours: 0,
          minutes: 59,
          seconds: 0,
          milliseconds: 0
        },
        {
          name: 'Test 2',
          date: '01/01/2017',
          hours: 5,
          minutes: 0,
          seconds: 0,
          milliseconds: 0
        },
        {
          name: 'Test 2',
          date: '01/02/2017',
          hours: 5,
          minutes: 0,
          seconds: 0,
          milliseconds: 0
        },
        {
          name: 'Test 2',
          date: '01/03/2017',
          hours: 5,
          minutes: 0,
          seconds: 0,
          milliseconds: 0
        },
        {
          name: 'Test 2',
          date: '01/04/2017',
          hours: 1,
          minutes: 0,
          seconds: 0,
          milliseconds: 0
        },
        {
          name: 'Test 2',
          hours: -1,
          minutes: 0,
          seconds: 0,
          milliseconds: 0
        },
      ];

      assert.isTrue(ipcRendererSend.called);
      const actual = ipcRendererSend.getCall(0).args[1];
      assert.deepEqual({ type: 'CSV', data: expected }, actual);
    });
  });
});
