import { spawn, ChildProcess } from "child_process";

export interface UsiEngineOption {
    path: string;
}

enum UsiStatus {
    Init,
    UsiOk,
    ReadyOk,
}

export class UsiEngine {
    process: ChildProcess;
    stdout_buf: string;
    status: UsiStatus;
    on_readyok: Function;
    on_bestmove: Function;

    constructor(public option: UsiEngineOption) {
        this.stdout_buf = "";
        this.status = UsiStatus.Init;
    }

    run() {
        this.process = spawn(this.option.path);
        this.process.on("error", (err: Error) => {
            console.error("Failed to launch process");
        });
        this.process.on("close", (code: number, signal: string) => {
            console.log("process closed");
        });
        this.process.stdout.on("data", this._on_stdout.bind(this));
        this._write_line("usi");
    }

    _on_stdout(data: Buffer) {
        this.stdout_buf += data.toString().replace(/\r/g, "");
        // 改行コードで分割
        let lines = this.stdout_buf.split("\n");
        if (this.stdout_buf[this.stdout_buf.length - 1] === "\n") {
            // ちょうど改行で終了
            this.stdout_buf = "";
            lines.pop();//空データ削除
        } else {
            // 最後のデータは次に持ち越す
            this.stdout_buf = lines.pop();
        }

        lines.forEach((line) => {
            console.log("from usi: " + line);
            this._process_stdout(line);
        });
    }

    _process_stdout(line: string) {
        switch (this.status) {
            case UsiStatus.Init:
                if (line === "usiok") {
                    this.status = UsiStatus.UsiOk;
                    this._write_line("isready");
                }
                break;
            case UsiStatus.UsiOk:
                if (line === "readyok") {
                    this.status = UsiStatus.ReadyOk;
                    this.on_readyok(this);
                }
                break;
            case UsiStatus.ReadyOk:
                let match_bestmove = line.match(/^bestmove ([^ ]+)/);
                if (match_bestmove) {
                    this.on_bestmove(this, match_bestmove[1]);
                }
                break;
        }
    }

    _write_line(line: string) {
        console.log("to usi: " + line);
        this.process.stdin.write(line + "\n");
    }

    write_usinewgame() {
        this._write_line("usinewgame");
    }

    write_position(moves: string[], startpos: string="startpos") {
        let line = `position ${startpos}`;
        if (moves.length > 0) {
            line += " moves " + moves.join(" ");
        }
        this._write_line(line);
    }

    write_go() {
        this._write_line("go btime 0 wtime 0 byoyomi 2000");
    }

    quit() {
        this._write_line("quit");
    }
}
