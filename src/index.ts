import * as electron from "electron";
import {app, BrowserWindow} from "electron";

import * as path from "path";
import * as url from "url";

let mainWindow: BrowserWindow;

function createWindow() {
    mainWindow = new BrowserWindow({width: 800, height: 600});

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "..", "index.html"),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
}

app.on("window-all-closed", () => {
    app.quit();
});

app.on("ready", createWindow);
