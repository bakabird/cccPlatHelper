import PlatBase, { GamePlat } from "./PlatBase";

function ttlog(...args) {
    console.log("ttLog", ...args);
}

export default class PlatTT extends PlatBase {
    private static _instance: PlatTT = null;

    public static getInstance() {
        if (!this._instance) {
            this._instance = new PlatTT();
        }
        return this._instance;
    }

    /**
     * 确认平台准备完毕
     */
    public checkPlatReady(onReady: (env: "Debug" | "Release") => void) {
        if (tt.canIUse("getUpdateManager")) {
            const updateManager = tt.getUpdateManager();
            updateManager.onUpdateReady((res) => {
                tt.showModal({
                    title: "更新提示",
                    content: "新版本已经准备好，是否重启小游戏？",
                    success: (res) => {
                        if (res.confirm) {
                            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                            updateManager.applyUpdate();
                        }
                    },
                });
            });
            updateManager.onUpdateFailed((err) => {
                // 新的版本下载失败
                console.log("版本下载失败原因", err);
                tt.showToast({
                    title: "新版本下载失败，请稍后再试",
                    icon: "none",
                });
            });
        }
        if (tt.canIUse("showShareMenu")) {
            tt.showShareMenu({});
        }
        onReady("Release");
    }

    public vibrate(type: "long" | "short") {
        if (type == "short") {
            tt.vibrateShort()
        } else {
            tt.vibrateLong();
        }
    }

    public endGame() {
        tt.exitMiniProgram({
            isFullExit: true
        });
    }

    public get plat(): GamePlat {
        return GamePlat.tt;
    }

    public get uma(): UMA {
        return tt.uma
    }
}