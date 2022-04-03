const createElement = require('./CreateElement');

class LoadingBar {
  static show() {
    this.div = createElement('div', '', 'overlay');
    createElement('div', 'Loading...', 'active-progress', this.div);
  }

  static hide() {
    this.div.remove();
  }
}

module.exports = LoadingBar;
