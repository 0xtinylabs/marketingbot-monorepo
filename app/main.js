const { updateElectronApp } = require("update-electron-app")
updateElectronApp()

const { app, BrowserWindow, session } = require("electron");
const { join } = require("path")
const { exec } = require("child_process");
const { default: axios } = require("axios");

const { installExtension } = require("electron-extension-installer")

const dirname = join(__dirname, "..")
const client_dir = join(dirname, "client")
const server_dir = join(dirname, "server")
const app_dir = join(dirname, "app")

const metamask_path = join(app_dir, "metamask")

const { v4 } = require("uuid")

let window;


const sendLogToWindow = (log) => {
  if (!window) {
    return
  }
  if (window.webContents && window.webContents.send) {
    window.webContents.send("log", log);
  } else {
    console.error("Window not ready to send logs");
  }
}


const runServer = async () => {
  const res = exec(`cd ${dirname} && npm run start:server:dev`, (error, out, stderr) => {
    if (error || stderr) {
      return console.log(error);
    }
  })
  res.on("error", (err) => {
    sendLogToWindow({
      type: "server", log: {
        type: "error",
        message: err,
        timestamp: Date.now(),
        id: v4()
      }
    })
  })
  res.stdout.on("data", (data) => {
    console.log(data)
    sendLogToWindow({
      type: "server", log: {
        type: "info",
        message: data,
        timestamp: Date.now(),
        id: v4()
      }
    })
  })
}

const runClient = async () => {
  const res = exec(`cd ${dirname} && npm run start:client:dev`, (error, out, stderr) => {
    if (error || stderr) {
      return console.log(error);
    }
  })


  res.on("error", (err) => {
    sendLogToWindow({
      type: "client", log: {
        type: "error",
        message: err,
        timestamp: Date.now(),
        id: v4()
      }
    })
  })
  res.stdout.on("data", (data) => {
    sendLogToWindow({
      type: "client", log: {
        type: "info",
        message: data,
        timestamp: Date.now(),
        id: v4()
      }
    })
  })

}

const createWindow = async () => {
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
  return win
};


const checkUrl = async () => {

  try {
    const res = await axios.get("http://localhost:3000")
    return true
  }
  catch {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 1000)
    })
    return await checkUrl()
  }
  finally {
  }
}


app.whenReady().then(async () => {
  window = await createWindow();


  window.loadFile(join(app_dir, "loading.html"))

  await runClient()
  await runServer()

  await checkUrl()



  window.loadURL("http://localhost:3000")

});
