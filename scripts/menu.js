const { remote } = require('electron');
const { Menu, MenuItem } = remote;
const Store = require('./store');

const menu = new Menu();
menu.append(new MenuItem({
  label: 'Clear All',
  click: function() {
    Store.commit('clearProjects');
  }
}));

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();

  menu.popup(remote.getCurrentWindow());
}, false);

module.exports = menu;
