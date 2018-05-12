import * as electron from "electron";
import { app, BrowserWindow, ipcMain } from "electron";

import { UsiEngine, UsiEngineOption } from "./usi_engine";

let engines: UsiEngine[] = [];
let ui_wc: electron.WebContents;

export function init() {
    ipcMain.on("start", (event: electron.IpcMessageEvent) => {
        ui_wc = event.sender;
        ui_wc.send("kifu", "Start");

        let ok_count = 0;
        for (let i = 0; i < 2; i++) {
            let opt: UsiEngineOption = { path: "Engine/Lesserkai.exe" };
            let engine = new UsiEngine(opt);
            engines.push(engine);
            console.log("usi.run");
            engine.on_readyok = () => {
                ok_count++;
                if (ok_count === 2) {
                    match_main();
                }
            }
            engine.run();
        }
    });
}

let moves: string[] = [];
function match_main() {
    console.log("match main");
    moves = [];
    for (let i = 0; i < 2; i++) {
        let player = i;
        let engine = engines[i];
        engine.on_bestmove = (_: UsiEngine, move: string) => {
            bestmove(player, move);
        }

        engine.write_usinewgame();
    }

    go(0);
}

function go(player: number) {
    let engine = engines[player];
    engine.write_position(moves);
    engine.write_go();
}

function bestmove(player: number, move: string) {
    ui_wc.send("kifu", move);
    if (move === "resign") {
        engines.forEach((engine) => {
            engine.quit();
        });
    } else {
        moves.push(move);
        go(1 - player);
    }
}