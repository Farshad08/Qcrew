const { spawn } = require('child_process');
const fs = require('fs');

const out = fs.openSync('stdout.log', 'a');
const err = fs.openSync('stderr.log', 'a');

const server = spawn('node', ['server.js'], {
    detached: true,
    stdio: ['ignore', out, err]
});

server.unref();

fs.writeFileSync('wrap-done.txt', 'Spawned server');
