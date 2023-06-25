// let fs = require('fire-fs');
import fs from "fs-extra"
// let path = require('fire-path');
import path from "path"
// let electron = require('electron');
import electron from "electron"

export default class CfgUtil {
    public static cfgData: Record<string, any> = {
        platTSDirPath: "project://",// ts脚本根路径
    }
    public static initCfg(cb?: (data: any) => void) {
        let configFilePath = this._getAppCfgPath();
        let b = fs.existsSync(configFilePath);
        if (b) {
            console.log("cfg path: " + configFilePath);
            fs.readFile(configFilePath, 'utf-8', (err, data) => {
                if (!err) {
                    let saveData = JSON.parse(data.toString());
                    this.cfgData = saveData;
                    if (cb) {
                        cb(saveData);
                    }
                }
            });
        } else {
            if (cb) {
                cb(null);
            }
        }
    }
    public static saveCfgByData(data: Record<string, any>) {
        Object.keys(data).forEach(v => {
            this.cfgData[v] = data[v];
        });
        this._save();
    }
    private static _save() {
        let savePath = this._getAppCfgPath();
        fs.writeFileSync(savePath, JSON.stringify(this.cfgData));
    }
    private static _getAppCfgPath() {
        let userDataPath = null;
        if (electron.remote) {
            userDataPath = electron.remote.app.getPath('userData');
        } else {
            userDataPath = electron.app.getPath('userData');
        }
        let tar = Editor.App.path;
        tar = tar.replace(/\\/g, '-');
        tar = tar.replace(/:/g, '-');
        tar = tar.replace(/\//g, '-');
        return path.join(userDataPath, "plat-helper-" + tar + ".json");
    }
}
// module.exports = {
//     cfgData: {
//         excelRootPath: null,// excel根路径
//     },
//     initCfg(cb) {
//         let configFilePath = this._getAppCfgPath();
//         let b = fs.existsSync(configFilePath);
//         if (b) {
//             console.log("cfg path: " + configFilePath);
//             fs.readFile(configFilePath, 'utf-8', function (err, data) {
//                 if (!err) {
//                     let saveData = JSON.parse(data.toString());
//                     this.cfgData = saveData;
//                     if (cb) {
//                         cb(saveData);
//                     }
//                 }
//             }.bind(this));
//         } else {
//             if (cb) {
//                 cb(null);
//             }
//         }
//     },
//     saveCfgByData(data) {
//         Object.keys(data).forEach(v => {
//             this.cfgData[v] = data[v];
//         });
//         this._save();
//     },
//     _save() {
//         let savePath = this._getAppCfgPath();
//         fs.writeFileSync(savePath, JSON.stringify(this.cfgData));
//     },
//     _getAppCfgPath() {
//         let userDataPath = null;
//         if (electron.remote) {
//             userDataPath = electron.remote.app.getPath('userData');
//         } else {
//             userDataPath = electron.app.getPath('userData');
//         }
//         let tar = Editor.libraryPath;
//         tar = tar.replace(/\\/g, '-');
//         tar = tar.replace(/:/g, '-');
//         tar = tar.replace(/\//g, '-');
//         return path.join(userDataPath, "excel-fucker-" + tar + ".json");
//     },
// };