const https = require('https');
const { exec } = require('child_process');
const fs = require('fs');

const owner = 'your-username';
const repo = 'your-repo';
const branch = 'main'; // or whatever branch you want

const intervalMs = 61 * 1000; // Check every 1 min
const lastCommitFile = '.last_commit_hash'; // Local file to store last commit hash
const lastUpdatedFile = '.last_updated_hash'; // Local file to store last update time

function getLatestCommit(cb) {
  const options = {
    hostname: 'api.github.com',
    path: `/repos/0xtinylabs/marketingbot-monorepo/commits/main`,
    headers: { 'User-Agent': 'node.js' }
  };
  https.get(options, res => {
    let data = '';

    res.on('data', chunk => data += chunk);
    console.log(data)
    res.on('end', () => {
      const json = JSON.parse(data);
      cb(json.sha);
    });
  });
}


function checkForUpdate(callback) {
  getLatestCommit(sha => {
    fs.writeFileSync(lastCommitFile, sha)
    const last_updated = fs.existsSync(lastUpdatedFile) ? fs.readFileSync(lastUpdatedFile, "utf-8") : '';

    console.log(sha, last_updated)
    if (sha !== last_updated && sha) {
      callback?.()
    } else {
      console.log('No update');
    }

  });
}

const runUpdateCheck = (callback) => {
  setInterval(() => {
    checkForUpdate(callback)
    console.log('Checking for updates...');
  }, intervalMs);
  checkForUpdate(); // Run immediately
}

module.exports = {
  checkForUpdate,
  getLatestCommit,
  runUpdateCheck,
  lastUpdatedFile,
  lastCommitFile
}