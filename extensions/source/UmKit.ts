import { IBuildResult, Platform } from "../@types";
import { PlatHelp } from "./builder";
import fs from "fs-extra"
import child_process from "child_process"
import FsUtil from "./FsUtil";

function log(...arg: any[]) {
    return console.log(`[UmKit] `, ...arg);
}

export default class UmKit {
    private static _me: UmKit;
    public static get me(): UmKit {
        if (!this._me) {
            this._me = new UmKit()
        }
        return this._me
    }

    private _mkDir(path: string) {
        if (fs.existsSync(path)) {
            var tempstats = fs.statSync(path);
            if (!tempstats.isDirectory()) {
                fs.unlinkSync(path);
                fs.mkdirSync(path);
            }
        } else {
            fs.mkdirSync(path);
        }
    }

    public checkPlatform(platform: Platform): boolean {
        return platform == "oppo-mini-game"
            || platform == "vivo-mini-game"
            || platform == "wechatgame"
            || platform == "huawei-quick-game"
            || platform == "xiaomi-quick-game"
            || platform == "bytedance-mini-game"
    }

    public checkUMEnable(option: PlatHelp.ITaskOptions) {
        return option.packages['plat-helper'].umEnable
    }

    public attach2MiniGame(options: PlatHelp.ITaskOptions, result: IBuildResult) {
        const pjoin = Editor.Utils.Path.join;
        const mkDir = this._mkDir;
        const joinPack = (...arg: string[]) => {
            return pjoin(__dirname, "../", ...arg);
        }

        let dir = result.paths.dir;
        if (options.platform == "vivo-mini-game") {
            dir = pjoin(dir, "src");
        }
        let gameJsPath = pjoin(dir, "game.js");
        let path = joinPack("static/uma/utils")
        let requirePath = "import uma from \"./utils";
        let uploadUserInfo = false;
        switch (options.platform) {
            case "wechatgame":
                if (options.packages["build-plugin-exportconfig"] && options.packages["build-plugin-exportconfig"].platform == "qq") {
                    path = pjoin(path, "umtrack-qq-game");
                    requirePath = "uma = require(\"/utils/umtrack/lib/uma.min.js\");\n" +
                        "qq.uma = uma;\n"
                    break;
                }
                if (options.packages["build-plugin-exportconfig"] && options.packages["build-plugin-exportconfig"].platform == "kuaishou") {
                    path = pjoin(path, "umtrack-kuaishou");
                    requirePath = requirePath + "/umtrack/lib/uma.min.js\"";
                    break;
                }
                path = pjoin(path, "umtrack-wx-game");
                let require = requirePath;
                requirePath = require + "/umtrack/lib/index.js\"";
                break;
            case "xiaomi-quick-game":
                gameJsPath = pjoin(dir, "main.js");
                path = pjoin(path, "umtrack-quickgame");
                requirePath = "require('./utils/umtrack/lib/uma.min.js')\n" +
                    "var uma = qg.uma";
                break
            case "oppo-mini-game":
                gameJsPath = pjoin(dir, "main.js");;
                path = pjoin(path, "umtrack-quickgame");
                requirePath = "require('./utils/umtrack/lib/uma.min.js')";
                break;
            case "huawei-quick-game":
                path = pjoin(path, "umtrack-quickgame");
                requirePath = "require('./utils/umtrack/lib/uma.min.js')";
                break;
            case "vivo-mini-game":
                path = pjoin(path, "umtrack-quickgame");
                requirePath = "require('./utils/umtrack/lib/uma.min.js')\n" +
                    "var uma = qg.uma";
                break
            case "bytedance-mini-game":
                path = pjoin(path, "umtrack-tt-game");
                requirePath = `var uma = require('./utils/umtrack/lib/uma.min')`
                uploadUserInfo = true;
                break;
            default:
                return;
        }
        let targetPath = pjoin(dir, "utils");
        mkDir(targetPath);
        targetPath = pjoin(targetPath, "umtrack");
        mkDir(targetPath);
        // @ts-ignore
        let cmdStr = process.platform == "darwin" ? `cp -a -f ${path}/* ${targetPath}`
            : 'echo d|xcopy ' + path + ' ' + targetPath + " /s/y";
        log("copy cmd:" + cmdStr)
        child_process.spawn(process.platform == "darwin" ? "/bin/bash" : "cmd.exe", (process.platform == "darwin" ? ['-c'] : ['/s', '/c']).concat([cmdStr]));
        let content = fs.readFileSync(gameJsPath, 'utf8').toString();
        content = `${requirePath};
    uma.init({
      appKey: '${options.packages["plat-helper"].umId}',
      useOpenid: ${options.packages["plat-helper"].umUseOpenId}, // default true
      autoGetOpenid: ${options.packages["plat-helper"].umUseOpenId},
      debug: ${options.packages["plat-helper"].umDebug},
      uploadUserInfo: ${uploadUserInfo},
    });\n` + content;
        fs.writeFileSync(gameJsPath, content);
    }

    public libandFilesWalk(enable: boolean, libandoirdPath: string) {
        FsUtil.walkDirectoryFiles(libandoirdPath, (path) => {
            const file = fs.readFileSync(path)
            let content = file.toString();
            if (enable) {
                content = content.replace(/#IFUM|#ENDUM/g, "")
            } else {
                content = content.replace(/#IFUM[\s\S]*?#ENDUM/g, "")
            }
            fs.writeFileSync(path, content)
        })
    }
}