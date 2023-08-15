import * as fs from 'fs-extra';
import path from 'path';
import { createApp, App, ref } from 'vue';
import CfgUtil from '../../CfgUtil';

const join = path.join;
const joinPack = (...arg: string[]) => {
    return join(__dirname, '../../../', ...arg);
}

const CONST_LASTEST_ADCFG_VERSION = 4;
const panelDataMap = new WeakMap<any, App>();

console.log("default panel init");
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() {
            console.log('show');
        },
        hide() {
            console.log('hide');
        }
    },
    template: fs.readFileSync(joinPack("static/template/default/index.html"), 'utf-8'),
    style: fs.readFileSync(joinPack('static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        logTextArea: '#logTextArea'
    },
    methods: {},
    ready() {
        let logCtrl = this.$.logTextArea as any;
        let logListScrollToBottom = function () {
            setTimeout(function () {
                logCtrl.scrollTop = logCtrl.scrollHeight;
            }, 10);
        };
        const app = createApp({});
        app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ui-');
        app.component('MyApp', {
            template: fs.readFileSync(joinPack('static/template/vue/app.html'), 'utf-8'),
            setup() { // 返回值会暴露给模板和其他的选项式 API 钩子
                // const tsDir = ref(0);
                const adCfgDir = ref(0);
                // 返回值会暴露给模板和其他的选项式 API 钩子
                return {
                    // tsDir,
                    adCfgDir
                }
            },
            data() {
                return {
                    logView: "",
                    platTSDirPath: "project://",
                    platAdCfgDirPath: "project://",
                }
            },
            watch: { // 侦听根级属性
                logView(val, oldVal) {
                    logCtrl.value = val;
                }
            },
            computed: {
                rawPlatTSDirPath() {
                    if (this.platTSDirPath) {
                        return Editor.UI.File.resolveToRaw(this.platTSDirPath);
                    } else {
                        return null;
                    }
                },
                rawPlatAdCfgDirPath() {
                    if (this.platAdCfgDirPath) {
                        return Editor.UI.File.resolveToRaw(this.platAdCfgDirPath);
                    } else {
                        return null;
                    }
                },
            },
            mounted() {
                this._initPluginCfg();
            },
            methods: {
                _initPluginCfg() {
                    CfgUtil.initCfg((data) => {
                        // this.tsDir.protocol = "project"
                        this.adCfgDir.protocol = "project"
                        if (data) {
                            this._addLog("confirm config path: " + JSON.stringify(data))
                            // this.platTSDirPath = data.platTSDirPath;
                            // this.tsDir.value = this.platTSDirPath;
                            this.platAdCfgDirPath = data.platAdCfgDirPath;
                            this.adCfgDir.value = this.platAdCfgDirPath;
                        }
                    });
                },
                _addLog(str: string) {
                    let time = new Date();
                    this.logView += "[" + time.toLocaleString() + "]: " + str + "\n";
                    logListScrollToBottom();
                },
                onConfirmPlatPath(dir: string) {
                    this._addLog("confirm config path: " + dir)
                    this.platTSDirPath = dir;
                    CfgUtil.saveCfgByData({ platTSDirPath: this.platTSDirPath });
                },
                onConfirmAdCfgPath(dir: string) {
                    this._addLog("confirm adCfg path: " + dir)
                    this.platAdCfgDirPath = dir;
                    CfgUtil.saveCfgByData({ platAdCfgDirPath: this.platAdCfgDirPath });
                },
                onClickCreateAdCfgTS() {
                    this._addLog("onClickCreateAdCfgTS")
                    if (this.platAdCfgDirPath) {
                        if (fs.existsSync(this.rawPlatAdCfgDirPath)) {
                            const path = join(this.rawPlatAdCfgDirPath, "AdCfg.ts");
                            if (!fs.existsSync(path)) {
                                fs.copyFileSync(joinPack("static/asset/AdCfg.ts.txt"), path);
                                Editor.Message.send("asset-db", "refresh-asset", 'db://assets/');
                                this._addLog("AdCfg.ts 创建成功！")
                            } else {
                                this._addLog("AdCfg.ts 创建失败！err:" + 2)
                            }
                        } else {
                            this._addLog("AdCfg.ts 创建失败！err:" + 1)
                        }
                    } else {
                        this._addLog("AdCfg.ts 创建失败！err:" + 0)
                    }
                },
                onClickUpdateAdCfgTS() {
                    this._addLog("onClickUpdateAdCfgTS")
                    if (this.platAdCfgDirPath) {
                        if (fs.existsSync(this.rawPlatAdCfgDirPath)) {
                            const path = join(this.rawPlatAdCfgDirPath, "AdCfg.ts");
                            if (fs.existsSync(path)) {
                                let content = fs.readFileSync(path, "utf-8");
                                // get the version
                                const matchRlt = content.match(/！不要删除也不要修改这个注释！ Version (\d*)/)
                                const version = parseInt(matchRlt?.[1]?.trim() ?? "0");
                                const pack = { content }
                                const latestVersion = this._updateAdCfg(version, pack);
                                if (latestVersion < 0) {
                                    this._addLog("AdCfg.ts 更新失败！请手动更新！")
                                    this._addLog("AdCfg.ts 更新失败！请手动更新！")
                                    this._addLog("AdCfg.ts 更新失败！请手动更新！")
                                    this._addLog("AdCfg.ts 更新失败！请手动更新！")
                                    this._addLog("AdCfg.ts 更新失败！请手动更新！")
                                    this._addLog("AdCfg.ts 更新失败！请手动更新！")
                                } else {
                                    if (version == 0) {
                                        pack.content = `// ！不要删除也不要修改这个注释！ Version ${latestVersion}\n` + pack.content;
                                    } else {
                                        pack.content = pack.content.replace(
                                            /！不要删除也不要修改这个注释！ Version (\d*)/,
                                            `！不要删除也不要修改这个注释！ Version ${latestVersion}`
                                        )
                                    }
                                    fs.writeFileSync(path, pack.content, "utf-8");
                                    Editor.Message.send("asset-db", "refresh-asset", 'db://assets/');
                                    this._addLog(`AdCfg.ts 成功更新到版本！${latestVersion}`)
                                }
                            } else {
                                this._addLog("AdCfg.ts 更新失败！err: AdCfg.ts 文件不存在")
                            }
                        } else {
                            this._addLog("AdCfg.ts 更新失败！err: platAdCfgDirPath 对应文件夹不存在")
                        }
                    } else {
                        this._addLog("AdCfg.ts 更新失败！err: 尚未设置 platAdCfgDirPath")
                    }
                },
                _updateAdCfg(curVersion: number, contentPack: { content: string }): number {
                    let tmpNum = 0;
                    let lines = contentPack.content.split("\n");
                    if (curVersion < 1) {
                        // 0 -> 1

                        // 找到 微信小游戏
                        tmpNum = lines.findIndex(line => line.includes("微信小游戏"))
                        if (tmpNum < 0) return -1;
                        // 塞入 
                        lines.splice(tmpNum, 0,
                            "    // 安卓应用宝",
                            "    _and_yyb_: {",
                            "    },");


                        // 找到 "and_taptap"
                        tmpNum = lines.findIndex(line => line.includes(`"and_taptap"`))
                        if (tmpNum < 0) return -1;
                        // 塞入 
                        lines.splice(tmpNum, 0,
                            `                case GameEnv.YYB: plat = "and_yyb";`,
                            "                    break;");
                    }
                    if (curVersion < 2) {
                        // 1 -> 2

                        // 更新引用
                        lines.splice(1, 3,
                            `import { NATIVE, OPPO, VIVO, WECHAT, XIAOMI } from "cc/env";`,
                            `import { sys } from "cc";`,
                            `import Plat from "../Plat";`,
                            `import { Channel } from "../PlatBase";`)

                        // 调整 GameEnv 到 Channel
                        let content = lines.join("\n");
                        content = content.replace(/PlatCfg.env/g, "Plat.inst.channel");
                        content = content.replace(/GameEnv.Oppo/g, "Channel.Oppo");
                        content = content.replace(/GameEnv.Mi/g, "Channel.Mi");
                        content = content.replace(/GameEnv.Vivo/g, "Channel.Vivo");
                        content = content.replace(/GameEnv.YYB/g, "Channel.YYB");
                        content = content.replace(/GameEnv.Taptap/g, "Channel.Taptap");

                        lines = content.split("\n");
                    }
                    if (curVersion < 3) {
                        // 2 -> 3

                        // 更新引用
                        lines.splice(1, 1,
                            `import { BYTEDANCE, HUAWEI, NATIVE, OPPO, VIVO, WECHAT, XIAOMI } from "cc/env";`)

                        // 找到 微信小游戏
                        tmpNum = lines.findIndex(line => line.includes("微信小游戏"))
                        if (tmpNum < 0) return -1;
                        // 塞入 
                        lines.splice(tmpNum, 0,
                            "    // 字节跳动：抖音",
                            "    _tt_: {",
                            "    },",
                            "    // 华为",
                            "    _hw_: {",
                            "    },"
                        );


                        // 找到 (VIVO)
                        tmpNum = lines.findIndex(line => line.includes(`(VIVO)`))
                        if (tmpNum < 0) return -1;
                        // 塞入 
                        lines.splice(tmpNum, 0,
                            `        } else if (BYTEDANCE) {`,
                            `            plat = "tt"`,
                            `        } else if (HUAWEI) {`,
                            `            plat = "hw"`
                        );
                    }
                    if (curVersion < 4) {
                        // 巨大改动，不兼容更新。
                        // 以后可以默认 AdCfg 的版本一定大于等于 4。
                    }
                    contentPack.content = lines.join("\n");
                    // remove Version
                    return CONST_LASTEST_ADCFG_VERSION;
                },
            },
        })
        app.mount(this.$.app!);
        panelDataMap.set(this, app);
    },
    beforeClose() { },
    close() {
        const app = panelDataMap.get(this);
        if (app) {
            app.unmount();
        }
    }
});
