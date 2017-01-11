const Helpers = require('./helpers');
const Moment = require('moment-timezone');

module.exports = {
  /**
   * Given a view of the projects, flattens them into an array of start and stop
   * intervals for which each project was active. These are not ordered. For
   * manually entered durations, we show a new field named 'manual' and display
   * the end time which maps to when the manual entry was created.
   */
  SS: function(projects) {
    // We need to flatten each of the increments into it's own row, then
    // format the time segments in the user's local time.
    const formattedData = [];
    const FORMAT_STRING = 'MM/DD/YYYY hh:mm:ss.SSS A z';
    const USER_TZ = Moment.tz.guess();
    projects.forEach((p) => {
      if (p.increments.length === 0 && p.artificialTime.length === 0) {
        formattedData.push({ name: p.name });
        return;
      }

      // Combine and normalize the increments and artificial times.
      const all_intervals = (p.increments || [])
        .concat(p.artificialTime || [])
        .map((a) => {
          if (typeof a.diff === 'undefined') {
            return {
              start: a.start,
              end: a.end,
            };
          }
          return {
            end: a.timestamp,
            manual: a.diff,
          };
        });

      all_intervals.forEach((i) => {
        const retval = {
          name: p.name,
          end: Moment.tz(i.end, USER_TZ).format(FORMAT_STRING),
        };
        if (typeof i.manual === 'undefined') {
          retval.start = Moment.tz(i.start, USER_TZ).format(FORMAT_STRING);
        } else {
          retval.manual = i.manual;
        }
        formattedData.push(retval);
      });
    });
    return {
      data: formattedData,
      fields: ['name', 'start', 'end', 'manual (s)']
    };
  },

  /**
   * Formats the projects where the total time spent working on a project for a
   * given day is output. Artificial time is added into the day it was input on.
   */
  D: function(projects) {
    const formattedData = [];
    const USER_TIMEZONE = Moment.tz.guess();
    const DATE_FORMAT = 'MM/DD/YYYY';
    projects.forEach((p) => {
      if (p.increments.length === 0 && p.artificialTime.length === 0) {
        formattedData.push({
          name: p.name,
        });
        return;
      }

      const all_intervals = (p.increments || [])
        .map((i) => { return {diff: i.end - i.start, timestamp: i.end} })
        .concat((p.artificialTime || [])
          .map((a) => { return {diff: a.diff * 1000, timestamp: a.timestamp} }))
        .sort((l, r) => {
          return l.timestamp - r.timestamp;
        });

      let prevEnd = null;
      let running = 0;
      all_intervals.forEach((i) => {
        if (prevEnd != null) {
          // Check if the start of this interval crosses a date boundary form the
          // previous interval.
          if (prevEnd.isBefore(Moment.tz(i.timestamp, USER_TIMEZONE), 'day')) {
            // This new interval represents another date. Export what we have
            // and restart counting.
            const parts = Helpers.getParts(running);
            formattedData.push({
              name: p.name,
              date: prevEnd.format(DATE_FORMAT),
              hours: parts.hours,
              minutes: parts.minutes,
              seconds: parts.seconds,
              milliseconds: parts.milliseconds,
            });
            running = 0;
          }
        }

        prevEnd = Moment.tz(i.timestamp, USER_TIMEZONE)
        running += i.diff;
      });

      // No matter what, we will not have processed the last incrmeent.
      const parts = Helpers.getParts(running);
      formattedData.push({
        name: p.name,
        date: prevEnd.format(DATE_FORMAT),
        hours: parts.hours,
        minutes: parts.minutes,
        seconds: parts.seconds,
        milliseconds: parts.milliseconds,
      });
    });
    return {
      data: formattedData,
      fields: ['name', 'date', 'hours', 'minutes', 'seconds', 'milliseconds'],
    };
  }
};
