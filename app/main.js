const { app, BrowserWindow, ipcMain, shell: ElectronShell } = require("electron");
const { join } = require("path");
const { spawn } = require("child_process");
const { v4 } = require("uuid");

const dirname = join(__dirname, "..");
const client_dir = join(dirname, "client");
const server_dir = join(dirname, "server");
const app_dir = join(dirname, "app");

const { runUpdateCheck, lastUpdatedFile, lastCommitFile } = require("./check-for-update");
const { existsSync, write, readFileSync, writeFileSync } = require("fs");
const killPort = require("kill-port");


let window;

const sendLogToWindow = (log) => {
  console.log(log);
  if (window && window.webContents && window.webContents.send) {
    window.webContents.send("log", log);
  }
};

runUpdateCheck(() => {
  if (window) {
    window.webContents.send("update", {});
  }
})

let server_process = null;
let client_process = null;

function killProcessSafe(proc, ports) {
  for (const port of ports) {
    killPort(port, "tcp").catch((err) => {
      console.error(`Error killing port ${port}:`, err);
    });
  }
  return new Promise((resolve) => {
    if (proc && !proc.killed) {
      proc.on("exit", () => resolve());
      proc.kill("SIGTERM");
      setTimeout(() => resolve(), 1000);
    } else {
      resolve();
    }
  });
}

const runServerDev = async () => {
  await killProcessSafe(server_process, [3002, 3004]);

  server_process = spawn("npm", ["run", "start:dev"], { cwd: server_dir, shell: true });
  server_process.stdout.on("data", (d) => sendLogToWindow({
    type: "server", log: { type: "info", message: d.toString(), timestamp: Date.now(), id: v4() }
  }));
  server_process.stderr.on("data", (d) => sendLogToWindow({
    type: "server", log: { type: "error", message: d.toString(), timestamp: Date.now(), id: v4() }
  }));
  server_process.on("error", (err) => sendLogToWindow({
    type: "server", log: { type: "error", message: err, timestamp: Date.now(), id: v4() }
  }));
}

const runClientDev = async () => {
  await killProcessSafe(client_process, [3000]);



  client_process = spawn("npm", ["run", "dev"], { cwd: client_dir, shell: true });
  client_process.stdout.on("data", (d) => sendLogToWindow({
    type: "client", log: { type: "info", message: d.toString(), timestamp: Date.now(), id: v4() }
  }));
  client_process.stderr.on("data", (d) => sendLogToWindow({
    type: "client", log: { type: "error", message: d.toString(), timestamp: Date.now(), id: v4() }
  }));
  client_process.on("error", (err) => sendLogToWindow({
    type: "client", log: { type: "error", message: err, timestamp: Date.now(), id: v4() }
  }));

}

const runServer = async () => {
  await killProcessSafe(server_process, [3002]);

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

  try {

    await killPort(3004, "tcp")
  }
  catch { }
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
  await killProcessSafe(client_process, [3000]);

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

const checkUrl = async (url) => {
  const axios = require("axios");
  while (true) {
    try {
      await axios.get(url);
      break;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
};

const checkUrlStatus = async (url) => {
  const axios = require("axios");
  try {
    const response = await axios.get(url);
    return response.status > 199 && response.status < 300;
  } catch (error) {
    console.error(`Error checking URL ${url}`);
    return false;
  }
}

setInterval(() => {
  checkUrlStatus("http://localhost:3002").then(s => {
    if (!s && window) {
      window.webContents.send("server-down");
    }
    if (s && window) {
      window.webContents.send("server-up");
    }
  })
}, 1000)

const startApp = async () => {
  if (window) window.close();
  window = createWindow();
  window.loadFile(join(app_dir, "loading.html"));

  await killProcessSafe(server_process, [3004]);
  await killProcessSafe(client_process, [3000]);

  setTimeout(async () => {

    if (process.env.APP_ENV === "development") {
      await runServerDev();
      await runClientDev();
    }

    else {
      await runServer();
      await runClient();
    }

    await checkUrl("http://localhost:3000");

    window.loadURL("http://localhost:3000");
  }, 1000);
};

ipcMain.on("reload", async () => {
  const { exec } = require("child_process");
  const res = exec(`cd ${dirname} && git stash && git pull`);

  res.on("close", async () => {
    const commit = existsSync(lastCommitFile) ? readFileSync(lastCommitFile, "utf-8") : "";
    existsSync(lastUpdatedFile) && writeFileSync(lastUpdatedFile, commit);

    await startApp();
  });
});

ipcMain.on("open-external", (event, data) => {
  ElectronShell.openExternal(data?.url);
});

ipcMain.on("restart-server", async () => {
  await killProcessSafe(server_process, [3002]);
  console.log("Server process killed");
  if (process.env.APP_ENV === "development") {
    await runServerDev();
  }
  else {
    await runServer();
  }
})

app.whenReady().then(async () => {
  await startApp();
});

app.on('window-all-closed', async () => {
  await killProcessSafe(server_process, [3002]);
  await killProcessSafe(client_process, [3000]);
  app.quit();
});
