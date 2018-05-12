import * as electron from "electron";

window.addEventListener("load", () => {
    let buttonstart = document.getElementById("start");
    buttonstart.addEventListener("click", () => {
        electron.ipcRenderer.send("start");
    });
});

electron.ipcRenderer.on("kifu", (event, arg) => {
    let selectkifu = document.getElementById("kifu");
    let msg = document.createElement("option");
    msg.innerText = arg;
    selectkifu.appendChild(msg);
    msg.scrollIntoView();
});
