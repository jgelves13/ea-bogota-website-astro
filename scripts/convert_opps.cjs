// Convert JS data files to JSON
// The JS files define global vars (EVENTS_DATA, OPPORTUNITIES_DATA)
// We load them via require-like approach using vm module
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const srcDir = 'G:/Mon Drive/EA Bogot\u00e1/Website/js';
const dstDir = 'C:/Users/joseg/Documents/ea-bogota-website-astro/src/data';

// Events
const eventsJs = fs.readFileSync(path.join(srcDir, 'events-data.js'), 'utf-8');
const eventsCtx = {};
vm.createContext(eventsCtx);
vm.runInContext(eventsJs, eventsCtx);
fs.writeFileSync(path.join(dstDir, 'events.json'), JSON.stringify(eventsCtx.EVENTS_DATA, null, 2), 'utf-8');
console.log('Events:', eventsCtx.EVENTS_DATA.length, 'entries');

// Opportunities
const oppsJs = fs.readFileSync(path.join(srcDir, 'opportunities-data.js'), 'utf-8');
const oppsCtx = {};
vm.createContext(oppsCtx);
vm.runInContext(oppsJs, oppsCtx);
fs.writeFileSync(path.join(dstDir, 'opportunities.json'), JSON.stringify(oppsCtx.OPPORTUNITIES_DATA, null, 2), 'utf-8');
console.log('Opportunities:', oppsCtx.OPPORTUNITIES_DATA.length, 'entries');
