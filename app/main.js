const { app, BrowserWindow, ipcMain } = require("electron");
const { join } = require("path");
const { spawn } = require("child_process");
const { v4 } = require("uuid");

const dirname = join(__dirname, "..");
const client_dir = join(dirname, "client");
const server_dir = join(dirname, "server");
const app_dir = join(dirname, "app");

const { runUpdateCheck, lastUpdatedFile, lastCommitFile } = require("./check-for-update");
const { existsSync, write, readFileSync, writeFileSync } = require("fs");


let window;

const sendLogToWindow = (log) => {
  console.log(log);
  if (window && window.webContents && window.webContents.send) {
    window.webContents.send("log", log);
  }
};

runUpdateCheck(() => {
  if (window) {
    console.log("x")
    window.webContents.send("update");
  }
})

let server_process = null;
let client_process = null;

function killProcessSafe(proc, name) {
  return new Promise((resolve) => {
    if (proc && !proc.killed) {
      proc.on("exit", () => resolve());
      proc.kill("SIGTERM");
      setTimeout(() => resolve(), 1000); // Eğer process exit event'i çalışmazsa 1sn sonra yine devam
    } else {
      resolve();
    }
  });
}

const runServer = async () => {
  await killProcessSafe(server_process, "server");

  // (İstersen buraya kill-port ekle: await kill(3001); vs)

  // Build önce, sonra server başlat
  await new Promise((resolve) => {
    const build = spawn("npm", ["run", "build"], { cwd: server_dir, shell: true });
    build.stdout.on("data", (d) => sendLogToWindow({
      type: "server", log: { type: "info", message: d.toString(), timestamp: Date.now(), id: v4() }
    }));
    build.stderr.on("data", (d) => sendLogToWindow({
      type: "server", log: { type: "error", message: d.toString(), timestamp: Date.now(), id: v4() }
    }));
    build.on("exit", resolve);
  });

  server_process = spawn("npm", ["run", "start"], { cwd: server_dir, shell: true });
  server_process.stdout.on("data", (d) => sendLogToWindow({
    type: "server", log: { type: "info", message: d.toString(), timestamp: Date.now(), id: v4() }
  }));
  server_process.stderr.on("data", (d) => sendLogToWindow({
    type: "server", log: { type: "error", message: d.toString(), timestamp: Date.now(), id: v4() }
  }));
  server_process.on("error", (err) => sendLogToWindow({
    type: "server", log: { type: "error", message: err, timestamp: Date.now(), id: v4() }
  }));
};

const runClient = async () => {
  await killProcessSafe(client_process, "client");

  // (İstersen buraya kill-port ekle: await kill(3000); vs)

  // Build önce, sonra client başlat
  await new Promise((resolve) => {
    const build = spawn("npm", ["run", "build"], { cwd: client_dir, shell: true });
    build.stdout.on("data", (d) => sendLogToWindow({
      type: "client", log: { type: "info", message: d.toString(), timestamp: Date.now(), id: v4() }
    }));
    build.stderr.on("data", (d) => sendLogToWindow({
      type: "client", log: { type: "error", message: d.toString(), timestamp: Date.now(), id: v4() }
    }));
    build.on("exit", resolve);
  });

  await new Promise((resolve) => {
    const build = spawn("npm", ["run", "build"], { cwd: client_dir, shell: true });
    build.stdout.on("data", (d) => sendLogToWindow({
      type: "client", log: { type: "info", message: d.toString(), timestamp: Date.now(), id: v4() }
    }));
    build.stderr.on("data", (d) => sendLogToWindow({
      type: "client", log: { type: "error", message: d.toString(), timestamp: Date.now(), id: v4() }
    }));
    build.on("exit", resolve);
  });


  client_process = spawn("npm", ["run", "start"], { cwd: client_dir, shell: true });
  client_process.stdout.on("data", (d) => sendLogToWindow({
    type: "client", log: { type: "info", message: d.toString(), timestamp: Date.now(), id: v4() }
  }));
  client_process.stderr.on("data", (d) => sendLogToWindow({
    type: "client", log: { type: "error", message: d.toString(), timestamp: Date.now(), id: v4() }
  }));
  client_process.on("error", (err) => sendLogToWindow({
    type: "client", log: { type: "error", message: err, timestamp: Date.now(), id: v4() }
  }));
};

const createWindow = () => {
  const win = new BrowserWindow({
    fullscreen: true,
    resizable: true,
    title: "Marketbot",
    minWidth: 800,
    minHeight: 800,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: true,
    },
  });
  return win;
};

const checkUrl = async () => {
  const axios = require("axios");
  while (true) {
    try {
      await axios.get("http://localhost:3000");
      break;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

const startApp = async () => {
  if (window) window.close();
  window = createWindow();
  window.loadFile(join(app_dir, "loading.html"));

  await killProcessSafe(server_process, "server");
  await killProcessSafe(client_process, "client");

  setTimeout(async () => {
    await runServer();
    await runClient();
    await checkUrl();
    window.loadURL("http://localhost:3000");
  }, 1000);
};

ipcMain.on("reload", async () => {
  const { exec } = require("child_process");
  const res = exec(`cd ${dirname} && git pull`);
  const commit = existsSync(lastCommitFile) ? readFileSync(lastCommitFile, "utf-8") : "";
  existsSync(lastUpdatedFile) && writeFileSync(lastUpdatedFile, commit);
  res.on("close", async () => {
    await startApp();
  });
});

app.whenReady().then(async () => {
  await startApp();
});

app.on('window-all-closed', async () => {
  await killProcessSafe(server_process, "server");
  await killProcessSafe(client_process, "client");
  app.quit();
});
