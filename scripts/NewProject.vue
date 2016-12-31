<template lang="pug">
  .line.project.add
    input(
      type="text",
      placeholder="Enter new project name...",
      v-model.trim="project_name",
      @keyup.enter="add").input-project
    .button-row
      button(
        type="button",
        @click="add",
        @keyup.enter="add").btn.image.add
      button(
        type="button",
        v-if="platform === 'darwin'",
        @click="addAndStart",
        @click.meta="addAndStartBackground",
        @keyup.enter="addAndStart").btn.image.play
      button(
        type="button",
        v-if="platform !== 'darwin'",
        @click="addAndStart",
        @click.ctrl="addAndStartBackground",
        @keyup.enter="addAndStart").btn.image.play
</template>

<script>
const Validator = require('validator');

const nameToId = function(name) {
  if (typeof name !== 'string' || Validator.isEmpty(name)) {
    return false;
  }
  return name.toLowerCase().replace(/[^a-zA-Z0-9]/gi, '-');
}

const validateProject = function(project) {
  if (typeof project !== 'object') {
    alert('No project provided.');
    return false;
  }

  if (typeof project.id !== 'string' && Validator.isEmpty(project.id)) {
    alert('Project did not contain an id.');
    return false;
  }

  if (typeof project.name !== 'string' && Validator.isEmpty(project.id)) {
    alert('Project did not contain a name.');
    return false;
  }

  return true;
}

module.exports = {
  data: function() {
    return {
      project_name: '',
    };
  },
  methods: {
    add: function(e) {
      let newProject = {
        id: nameToId(this.project_name),
        name: this.project_name,
      };
      if (validateProject(newProject)) {
        this.$store.commit('addProject', newProject);
        this.project_name = '';
      }
    },

    addAndStart: function(e) {
      if (!e.metaKey && !e.ctrlKey) {
        let newProject = {
          id: nameToId(this.project_name),
          name: this.project_name,
        };
        if (validateProject(newProject)) {
          this.$store.commit('addAndStartProject', { project: newProject });
          this.project_name = '';
        }
      }
    },

    addAndStartBackground: function(e) {
      let newProject = {
        id: nameToId(this.project_name),
        name: this.project_name,
      };
      if (validateProject(newProject)) {
        this.$store.commit('addAndStartProject', {
          project: newProject,
          overrideStart: false
        });
        this.project_name = '';
      }
    },
  },
  props: ['platform']
};
</script>
