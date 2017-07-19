'use strict';

const render = require('./renderer');
const chromeLauncher = require('chrome-launcher');
const express = require('express');
const compression = require('compression');

const app = express();

app.use(compression());

app.get('/', async function(request, response) {
  const injectShadyDom = !!request.query['wc-inject-shadydom'];
  const html = await render(request.query.url, injectShadyDom).catch((err) => console.error(err));
  response.send(html);
});

app.get('/_ah/health', (request, response) => response.send('OK'));

const appPromise = chromeLauncher.launch({
  chromeFlags: ['--headless', '--disable-gpu', '--remote-debugging-address=0.0.0.0'],
  port: 9222
}).then((chrome) => {
  // Don't open a port when running from inside a module (eg. tests). Importing
  // module can control this.
  const port = process.env.PORT || '3000';
  if (!module.parent) {
    app.listen(port, function() {
      console.log('Listening on port', port);
    });
  }
  return app;
});

module.exports = appPromise;
