#!/usr/bin/env node
const handler = require('./resizer.js');
// Usage: ./invoke.js http://example.org/image.jpg <size=32>
const url = process.argv[2];
const size = process.argv[3]? Number(process.argv[3]): undefined;

handler.downloadAndResize({ url, size }, {}, (error, data) => {
  if (error) return console.error('FAILURE', error.message);
  console.log('SUCCESS', data);
});
