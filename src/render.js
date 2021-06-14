const exec = require('child_process').exec
const rootPath = require('electron-root-path').rootPath;
const fixPath = require('fix-path');
fixPath();

const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const smisInput = document.getElementById('smis');
const regnumberInput = document.getElementById('regnumber');

const downloadBtn = document.getElementById('downloadBtn');
downloadBtn.onclick = async () => {
    exec(`node ${rootPath}/src/filo/Puppeteer.js ${usernameInput.value} ${passwordInput.value} ${smisInput.value} ${regnumberInput.value}`, function (error, stdout, stderr) {
        console.log('stdout: ', stdout);
        alert('Done!')
        if (stderr) {
            console.log('stderr: ' + stderr);
        }
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
}
