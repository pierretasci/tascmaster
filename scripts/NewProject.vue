<template lang="pug">
  .line.project
    input(
      type="text",
      placeholder="Enter new project name...",
      v-model.trim="project_name").input-project
    .button-row
      button(
        type="button",
        @click="add"
        @keyup.enter="add").btn Add
      button(type="button").btn.primary Start
</template>

<script>
const nameToId = function(name) {
  if (typeof name !== 'string') {
    return false;
  }

  return name.toLowerCase().replace(/[^a-zA-Z0-9]/gi, '-');
}

const validateProject = function(project) {
  if (!project) {
    console.log('No project provided.');
    return false;
  }

  if (!project.id) {
    console.log('Project did not contain an id.');
    return false;
  }

  if (!project.name) {
    console.log('Project did not contain a name.');
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
    }
  }
};
</script>
