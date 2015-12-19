'use strict';

const fs = require('fs'),
  path = require('path'),
  remote = require('remote'),
  BrowserWindow = remote.require('browser-window'),
  browser = BrowserWindow.getFocusedWindow(),
  co = require('co'),
  _template = require('lodash.template'),
  _templateSettings = {},
  _forEach = require('lodash.foreach');

_templateSettings.imports = {_forEach};

const el = {
  inputer: document.getElementById('inputer')
}

el.inputer.addEventListener('change', handler);
window.addEventListener('keypress', e => {
  if (e.keyCode == 13) {
    browser.print();
    // browser.printToPDF({
    //   pageSize: 'A6'
    // }, (err, data) => {
    //   fs.writeFile('test.pdf', data, 'utf-8', err => {});
    // });
  }
});

function handler(e) {
  const file = e.target.files[0],
    type = file.type;

  if (/csv/.test(type)) {
    co(function*() {
      const data = yield readFile(file),
        templatePath = path.resolve(__dirname, 'templates/index.html'),
        template = yield readLocalFile(templatePath),
        html = _template(template)({data: parse(data)});
        console.log(html);

      document.body.innerHTML = html;
    });
  }
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', e => {
      resolve(e.target.result);
    });
    reader.readAsText(file);
  });
}

function readLocalFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (err, data) => {
      return data ? resolve(data) : reject(err);
    });
  });
}

function parse(data) {
  const lines = data.split(/\n/).filter(line => line);
  return lines.map(line => {
    if (!line) return;
    const data = line.split(',');
    return {
      name: data[0],
      postalCode: (num => {
        return num.replace(/(\d{3})(\d{4})/, (m, pn, sn) => {
          return `${pn}<span class="gutter"></span>${sn}`
        });
      })(data[1]),
      address1: data[2],
      address2: data[3],
    };
  });
}

function onError(err) {
  console.error(err);
}
