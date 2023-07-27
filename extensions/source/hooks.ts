import { readFileSync, writeFileSync } from 'fs-extra';
import { BuildHook, IBuildResult, IBuildTaskOption } from '../@types';
import { Channel, PlatHelp, checkAndEnable, checkIosEnable } from './builder';
// @ts-ignore
import packageJSON from '../package.json';
import path from 'path';
import fs from "fs-extra"
import CfgUtil from './CfgUtil';
import UmKit from './UmKit';

let rawPlatTSDir = "";
const PACKAGE_NAME = 'plat-helper';
const joinPack = (...arg: string[]) => {
    return path.join(__dirname, "../", ...arg);
}

function log(...arg: any[]) {
    return console.log(`[${PACKAGE_NAME}] `, ...arg);
}
// let allAssets = [];

function string2unicode(str) {
    var ret = "";
    var ustr = "";

    for (var i = 0; i < str.length; i++) {

        var code = str.charCodeAt(i);
        var code16 = code.toString(16);

        if (code < 0xf) {
            ustr = "\\u" + "000" + code16;
        } else if (code < 0xff) {
            ustr = "\\u" + "00" + code16;
        } else if (code < 0xfff) {
            ustr = "\\u" + "0" + code16;
        } else {
            ustr = "\\u" + code16;
        }
        ret += ustr;
        //ret += "\\u" + str.charCodeAt(i).toString(16);   
    }

    return ret;
}

// [behind=3, fullSensor=10, fullUser=13, 
// landscape=0, locked=14, nosensor=5, portrait=1, 
// reverseLandscape=8, reversePortrait=9, sensor=4, 
// sensorLandscape=6, sensorPortrait=7, unspecified=4294967295, 
// user=2, userLandscape=11, userPortrait=12].
type Orientation = "sensorLandscape" | "reverseLandscape" | "landscape" | "portrait";

export const throwError: BuildHook.throwError = true;

export const load: BuildHook.load = async function () {
    console.log(`[${PACKAGE_NAME}] Load cocos plugin example in builder.`);
    console.log("packageJSON.DEBUG_WORD=" + packageJSON.DEBUG_WORD);
    CfgUtil.initCfg(data => {
        rawPlatTSDir = Editor.UI.File.resolveToRaw(data.platTSDirPath)
        console.log("rawPlatTSDir", rawPlatTSDir)
    })
    // allAssets = await Editor.Message.request('asset-db', 'query-assets');
};

export const onBeforeBuild: BuildHook.onAfterBuild = async function (options: PlatHelp.ITaskOptions) {
    console.log(options);
    // revisePlatCfg(options);
};

export const onBeforeCompressSettings: BuildHook.onBeforeCompressSettings = async function (options, result) {

};

export const onAfterCompressSettings: BuildHook.onAfterCompressSettings = async function (options, result) {

};

export const onAfterBuild: BuildHook.onAfterBuild = async function (options: PlatHelp.ITaskOptions, result: PlatHelp.IResult) {
    if (UmKit.me.checkPlatform(options.platform) && UmKit.me.checkUMEnable(options)) {
        UmKit.me.attach2MiniGame(options, result)
    }
    if (checkAndEnable(options)) {
        attachASProj(options);
        attachLiband(options);
        reviseGradleProp(options, result)
        attachPlatVariable(options);
        attachChannel2Mainjs(options, result);
        attachPackageVersion2Mainjs(options, result, "and_packVersion");
        reviseGradleVersion(options);
    }
    if (checkIosEnable(options)) {
        attachPackageVersion2Mainjs(options, result, "ios_packVersion");
    }
};

export const unload: BuildHook.unload = async function () {

};

export const onBeforeMake: BuildHook.onBeforeMake = async function (root, options) {

};

export const onAfterMake: BuildHook.onAfterMake = async function (root, options) {

};

function getOrientation(options: PlatHelp.ITaskOptions): Orientation {
    const orientationOption = options.packages.android.orientation
    return (orientationOption.landscapeLeft && orientationOption.landscapeRight) ? "sensorLandscape" :
        (orientationOption.landscapeLeft ? "reverseLandscape" : (orientationOption.landscapeRight ? "landscape" : "portrait"));
}

function revisePlatCfg(options: PlatHelp.ITaskOptions) {
    if (rawPlatTSDir == "") return;
    const { and_channel: channel } = options.packages['plat-helper'];
    const GameCfgPath = Editor.Utils.Path.join(rawPlatTSDir, "./PlatCfg.ts");
    const cfgCnt = readFileSync(GameCfgPath, "utf-8");
    const cfgLines = cfgCnt.split("\n");
    for (let index = 0; index < cfgLines.length; index++) {
        const line = cfgLines[index];
        if (line.indexOf("env:") > -1) {
            cfgLines[index] = `env: GameEnv.${channel},`;
        }
    }
    writeFileSync(GameCfgPath, cfgLines.join("\n"));
    log("已修改 PlatCfg.ts " + `env ${channel}`);
}

function attachASProj(options: PlatHelp.ITaskOptions) {
    if (options.platform != "android") return;
    const { and_channel: channel } = options.packages['plat-helper'];
    const pjoin = Editor.Utils.Path.join;
    const projPath = pjoin(options.buildPath.replace("project://", Editor.Project.path + "\\"), options.outputName, "proj");
    const propPath = pjoin(projPath, "gradle.properties");
    const propCnt = readFileSync(propPath, "utf-8");
    const ASProjPath = makesureASProj(options);

    let oldNDIR = "";
    let newNDIR = "";
    let propLines = propCnt.split("\n");
    for (let index = 0; index < propLines.length; index++) {
        const line = propLines[index];
        if (line.indexOf("NATIVE_DIR") > -1) {
            oldNDIR = line;
            propLines[index] = `NATIVE_DIR=${ASProjPath}`;
            // propLines[index] = propLines[index].replace("engine/android", "engine/" + options.outputName);
            newNDIR = propLines[index];
            break
        }
    }
    writeFileSync(propPath, propLines.join("\n"));
    log("已将 AS工程 链接代码重定向 " + `${oldNDIR} -> ${newNDIR}`);
}

/**
 * 确保对应环境的平台安卓代码存在
 * @return {string} 对应平台安卓代码项目的路径
 */
function makesureASProj(options: PlatHelp.ITaskOptions): string {
    const pjoin = Editor.Utils.Path.join;
    const EnvAsProjPath = pjoin(Editor.Project.path, "native/engine/" + options.outputName).replace(/\\/g, "/");
    const enAndTempalte = joinPack("static/native-engine/" + options.outputName);
    if (!fs.existsSync(EnvAsProjPath)) {
        if (fs.existsSync(enAndTempalte)) {
            const baseAndPath = pjoin(Editor.Project.path, "native/engine/android").replace(/\\/g, "/");
            if (fs.existsSync(baseAndPath)) {
                fs.copySync(baseAndPath, EnvAsProjPath);
                // delete app dir;
                fs.rmdirSync(pjoin(EnvAsProjPath, "app"), { recursive: true });
                // repalce by template
                fs.copySync(pjoin(enAndTempalte, "app"), pjoin(EnvAsProjPath, "app"));
            } else {
                console.error("baseAnd not found in " + baseAndPath);
            }
        } else {
            console.error("没有找到对应的安卓工程模板，请检查是否存在 " + enAndTempalte);
        }
    }
    if (fs.existsSync(EnvAsProjPath)) {
        const manifestPath = pjoin(EnvAsProjPath, "app/AndroidManifest.xml");
        const manifestCnt = readFileSync(manifestPath, "utf-8");
        writeFileSync(manifestPath, ajustMainfest(options, manifestCnt), "utf-8");
    }
    return EnvAsProjPath
}

function ajustMainfest(options: PlatHelp.ITaskOptions, content: string): string {
    const { and_channel: channel } = options.packages['plat-helper'];
    if (channel == Channel.Mi) {
        return ajustMainfestMi(options, content);
    } else if (channel == Channel.Oppo) {
        return ajustMainfestOppo(options, content);
    } else if (channel == Channel.Vivo) {
        return ajustMainfestVivo(options, content);
    } else if (channel == Channel.Taptap) {
        return ajustMainfestTaptap(options, content);
    } else if (channel == Channel.YYB) {
        return ajustMainfestYYB(options, content);
    } else {
        return content;
    }
}

function ajustMainfestVivo(options: PlatHelp.ITaskOptions, content: string): string {
    const orientation = getOrientation(options)
    content = content.replace(/android:screenOrientation=".*"/g, `android:screenOrientation="${orientation}"`);
    return content;
}

function ajustMainfestOppo(options: PlatHelp.ITaskOptions, content: string): string {
    const orientation = getOrientation(options)

    content = content.replace(/<meta-data android:name="app_key" .*/g, `<meta-data android:name="app_key" android:value="${options.packages['plat-helper'].OPPO_APP_KEY}" />`);
    content = content.replace(/android:screenOrientation=".*"/g, `android:screenOrientation="${orientation}"`);
    return content;
}

function ajustMainfestMi(options: PlatHelp.ITaskOptions, content: string): string {
    const orientation = getOrientation(options)
    content = content.replace(/<meta-data android:name="miGameAppId" .*/g, `<meta-data android:name="miGameAppId" android:value="mi_${options.packages['plat-helper'].MI_APP_ID}" />`);
    content = content.replace(/<meta-data android:name="miGameAppKey" .*/g, `<meta-data android:name="miGameAppKey" android:value="mi_${options.packages['plat-helper'].MI_APP_KEY}" />`);
    content = content.replace(/android:screenOrientation=".*"/g, `android:screenOrientation="${orientation}"`);
    return content;
}

function ajustMainfestTaptap(options: PlatHelp.ITaskOptions, content: string): string {
    const orientation = getOrientation(options)
    content = content.replace(/android:screenOrientation=".*"/g, `android:screenOrientation="${orientation}"`);
    return content;
}

function ajustMainfestYYB(options: PlatHelp.ITaskOptions, content: string): string {
    const orientation = getOrientation(options)
    content = content.replace(/android:screenOrientation=".*"/g, `android:screenOrientation="${orientation}"`);
    return content;
}

/**
 * 确保该 options 对应 orientation/umeng 的 liband 目录存在。如果没有将创建
 * @return {string} 对应的 liband 的路径
 */
function makesureLiband(options: PlatHelp.ITaskOptions): string {
    const umengEnable = UmKit.me.checkUMEnable(options)
    const orientation = getOrientation(options)
    const orientationLibandDir = `libandroid-${orientation}-um${umengEnable ? 1 : 0}`;
    const pjoin = Editor.Utils.Path.join;
    const libandoirdRootDir = pjoin(Editor.Project.path, "native/engine/libandroid").replace(/\\/g, "/");
    const libandoirdPath = pjoin(Editor.Project.path, "native/engine/libandroid/" + orientationLibandDir).replace(/\\/g, "/");
    console.log("libandoirdPath ", libandoirdPath);
    fs.ensureDirSync(libandoirdRootDir);
    if (!fs.existsSync(libandoirdPath)) {
        const baseLibandoirdPath = joinPack("static/libandroid")
        console.log("baseLibandoirdPath ", baseLibandoirdPath)
        // copy
        fs.copySync(baseLibandoirdPath, libandoirdPath);
        UmKit.me.libandFilesWalk(umengEnable, libandoirdPath)
        // revise the Androimainfest.xml
        const mainfest = pjoin(libandoirdPath, "./AndroidManifest.xml");
        console.log("mainfest ", mainfest)
        let content = fs.readFileSync(mainfest, "utf-8");
        content = content.replace(/android:screenOrientation="portrait"/g, `android:screenOrientation="${orientation}"`);
        fs.writeFileSync(mainfest, content, "utf-8");
    }
    return libandoirdPath;
}

/**
 * 确保 liband 的引入
 * @param options 
 * @returns 
 */
function attachLiband(options: PlatHelp.ITaskOptions) {
    if (options.platform != "android") return;
    const { and_channel: channel } = options.packages['plat-helper'];
    const pjoin = Editor.Utils.Path.join;
    const projPath = pjoin(options.buildPath.replace("project://", Editor.Project.path + "\\"), options.outputName, "proj");
    // const libandoirdPath = pjoin(Editor.Project.path, "native/engine/libandroid").replace(/\\/g, "/");
    const libandoirdPath = makesureLiband(options);
    const propPath = pjoin(projPath, "gradle.properties");
    const settingsPath = pjoin(projPath, "settings.gradle");
    const propCnt = readFileSync(propPath, "utf-8");
    const qhhzLibandoird = `LIB_DIR=${libandoirdPath}`;
    const settingsGradle = `include ':libcocos',':libservice', ':libandroid', ':LinesXFree'
project(':libcocos').projectDir     = new File(COCOS_ENGINE_PATH,'cocos/platform/android/libcocos2dx')
project(':libandroid').projectDir = new File(LIB_DIR)
project(':LinesXFree').projectDir    = new File(NATIVE_DIR, 'app')
if(PROP_ENABLE_INSTANT_APP == "true" || PROP_ENABLE_INSTANT_APP == "yes") {
    include ':instantapp'
    project(':instantapp').projectDir   = new File(NATIVE_DIR, 'instantapp')
}

rootProject.name = "LinesXFree"
    `
    let propLines = propCnt.split("\n");
    for (let index = 0; index < propLines.length; index++) {
        const line = propLines[index];
        if (line.indexOf("LIB_DIR") > -1) {
            propLines.splice(index, 1);
            index--;
        }
    }
    propLines.push(qhhzLibandoird);
    writeFileSync(propPath, propLines.join("\n"));
    writeFileSync(settingsPath, settingsGradle)
    log("已为 AS工程 增加 qhhz.libandoird 库 ");
}

// 增加平台对应的变量
function attachPlatVariable(options: PlatHelp.ITaskOptions) {
    if (options.platform != "android") return;
    const { and_channel: channel } = options.packages['plat-helper'];
    const pjoin = Editor.Utils.Path.join;
    const projPath = pjoin(options.buildPath.replace("project://", Editor.Project.path + "\\"), options.outputName, "proj");
    const propPath = pjoin(projPath, "gradle.properties");
    const propCnt = readFileSync(propPath, "utf-8");
    const checkVariable = [
        "OPPO_APP_ID", "OPPO_APP_KEY", "OPPO_APP_SECRET",
        "MI_APP_ID", "MI_APP_KEY", "MI_APP_NAME", "MI_SPLASH_ID",
        "TAPTAP_CLIENT_ID", "CSJ_APP_ID", "CSJ_APP_NAME", "CSJ_BANNER_HEIGHT", "CSJ_BANNER_WIDTH",
        "VIVO_APP_ID", "VIVO_AD_MEDIA_ID",
    ]

    let propLines = propCnt.split("\n");
    for (let index = 0; index < propLines.length; index++) {
        const line = propLines[index];
        const includeCheck = checkVariable.find((vKey) => line.indexOf(vKey) > -1);
        if (includeCheck) {
            propLines.splice(index, 1);
            index--;
        }
    }
    checkVariable.forEach(vKey => {
        const vVal = options.packages['plat-helper'][vKey];
        if (vVal && vVal != "") {
            // const unicode_vVal = escape(vVal).replace(/\%u/g, "\\u");
            const unicode_vVal = string2unicode(vVal);
            console.log(vVal, "->", unicode_vVal);
            propLines.push(`${vKey}="${unicode_vVal}"`);
            log("+ " + `${vKey}="${vVal}"`);
        }
    })
    writeFileSync(propPath, propLines.join("\n"));
}

function tmpHub() {
    // const orientationOption = options.packages.android.orientation
    // screenOrientation (attr) enum 
    // [behind=3, fullSensor=10, fullUser=13, 
    // landscape=0, locked=14, nosensor=5, portrait=1, 
    // reverseLandscape=8, reversePortrait=9, sensor=4, 
    // sensorLandscape=6, sensorPortrait=7, unspecified=4294967295, 
    // user=2, userLandscape=11, userPortrait=12].
    // const orientationVariable = "PROP_ORIENTATION=".concat(
    //     (orientationOption.landscapeLeft && orientationOption.landscapeRight) ? "6" :
    //         (orientationOption.landscapeLeft ? "8" : (orientationOption.landscapeRight ? "0" : "1")));

    // "PROP_ORIENTATION", 

    // propLines.push(orientationVariable);
    // log("+" + orientationVariable);
}



function reviseGradleProp(options: PlatHelp.ITaskOptions, result: PlatHelp.IResult) {
    if (options.platform != "android") return;
    const { and_channel: and_channel, and_packVersion, PROTOCOL_URL, PRIVATE_URL,
        // and_enableAd: enableAd
    } = options.packages['plat-helper'];
    const pjoin = Editor.Utils.Path.join;
    const projPath = pjoin(options.buildPath.replace("project://", Editor.Project.path + "\\"), options.outputName, "proj");
    const propPath = pjoin(projPath, "gradle.properties");
    const propCnt = readFileSync(propPath, "utf-8");
    const useAndroidX = "android.useAndroidX=true";
    const enableJetifier = "android.enableJetifier=true";
    const protocolUrl = `PROTOCOL_URL="${PROTOCOL_URL}"`
    const privateUrl = `PRIVATE_URL="${PRIVATE_URL}"`
    const packVersion = `PACK_VERSION=${and_packVersion}\nPACK_VERSION_NAME=${and_packVersion}.0`
    const designWidth = `DESIGN_HEIGHT=${result.settings.screen.designResolution.height}`
    const designHeight = `DESIGN_WIDTH=${result.settings.screen.designResolution.width}`
    const channel = `CHANNEL=${and_channel}`
    // const enableAdProp = `ENABLE_AD=${enableAd ? 1 : 0}`
    const compileJavaCommend = `#业务编码字符集, 注意这是指定源码解码的字符集[编译器]`;
    const compileJava = `compileJava.options.encoding="UTF-8"`
    const compileTestJavaCommend = `#测试编码字符集, 注意这是指定源码解码的字符集[编译器]`
    const compileTestJava = `compileTestJava.options.encoding="UTF-8"`
    const lineRemoveDetects = [
        "android.useAndroidX", "android.enableJetifier",
        "PROTOCOL_URL", "PRIVATE_URL", "PACK_VERSION", "PACK_VERSION_NAME",
        "ENABLE_AD",
        "DESIGN_HEIGHT", "DESIGN_WIDTH", "CHANNEL",
        "业务编码字符集", "compileJava.options.encoding",
        "#\u4E1A\u52A1\u7F16\u7801\u5B57\u7B26\u96C6",
        "测试编码字符集", "compileTestJava.options.encoding",
        "#\u6D4B\u8BD5\u7F16\u7801\u5B57\u7B26\u96C6",
    ]

    let propLines = propCnt.split("\n");
    for (let index = 0; index < propLines.length; index++) {
        const line = propLines[index];
        // 统一
        if (lineRemoveDetects.find(v => line.indexOf(v) > -1)) {
            propLines.splice(index, 1);
            index--;
        }
    }

    // if ([GameEnv.Mi].includes(env)) {
    //     const lineIndex = propLines.findIndex(v => v.indexOf("PROP_MIN_SDK_VERSION") > -1);
    //     if (lineIndex > -1) {
    //         propLines.splice(lineIndex, 1, `PROP_MIN_SDK_VERSION=23`);
    //         log("已将 AS工程 min_sdk_version 设置为 23 ");
    //     }
    // }
    if ([Channel.Mi, Channel.Taptap].includes(and_channel)) {
        propLines.push(compileJavaCommend);
        propLines.push(compileJava);
        propLines.push(compileTestJavaCommend);
        propLines.push(compileTestJava);
        log("已为 AS工程 设置编码字符集");
    }
    if ([Channel.Oppo, Channel.Mi, Channel.YYB].includes(and_channel)) {
        propLines.push(useAndroidX);
        log("已为 AS工程 开启 useAndroidX ");
    }
    if ([Channel.Oppo, Channel.Mi, Channel.YYB].includes(and_channel)) {
        propLines.push(enableJetifier);
        log("已为 AS工程 开启 enableJetifier");
    }
    // propLines.push(enableAdProp);
    // log("+" + enableAdProp);
    propLines.push(protocolUrl);
    log("+" + protocolUrl);
    propLines.push(privateUrl);
    log("+" + privateUrl);
    propLines.push(designHeight);
    log("+" + designHeight);
    propLines.push(designWidth);
    log("+" + designWidth);
    propLines.push(channel);
    log("+" + channel);
    propLines.push(packVersion);
    log("+" + packVersion);
    writeFileSync(propPath, propLines.join("\n"));
}

function reviseGradleVersion(options: PlatHelp.ITaskOptions) {
    const pjoin = Editor.Utils.Path.join;
    const projPath = pjoin(options.buildPath.replace("project://", Editor.Project.path + "\\"), options.outputName, "proj");
    const buildGradlePath = pjoin(projPath, "build.gradle");
    const buildGradleSourcePath = joinPack("static/asset/build.gradle.txt");
    const gradleWrapperPath = pjoin(projPath, "gradle/wrapper/gradle-wrapper.properties");
    const gradleWrapperCnt = readFileSync(gradleWrapperPath, "utf-8");
    let lines = gradleWrapperCnt.split("\n");
    for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (line.indexOf("distributionUrl") > -1) {
            lines.splice(index, 1);
            index--;
        }
    }
    lines.push(`distributionUrl = https\://services.gradle.org/distributions/gradle-7.6.1-all.zip`);
    writeFileSync(gradleWrapperPath, lines.join("\n"));
    writeFileSync(buildGradlePath, readFileSync(buildGradleSourcePath, "utf-8"), "utf-8");
    log("已为 AS工程 设置 gradle 版本");
}

function attachChannel2Mainjs(options: PlatHelp.ITaskOptions, result: PlatHelp.IResult) {
    const { and_channel: channel } = options.packages['plat-helper'];
    const pjoin = Editor.Utils.Path.join;
    const inject_script = `window.channel = "${channel}";\n
    `
    var url = pjoin(result.dest, 'data', 'main.js');

    if (!fs.existsSync(url)) {
        url = pjoin(result.dest, 'assets', 'main.js');
    }

    const data = fs.readFileSync(url, "utf-8");
    const newStr = inject_script + data;
    fs.writeFileSync(url, newStr, { encoding: "utf-8" });
    console.warn("(window.channel) updated in built main.js.");
}

function attachPackageVersion2Mainjs(options: PlatHelp.ITaskOptions, result: PlatHelp.IResult, key: string) {
    const packageVersion: number = options.packages['plat-helper'][key];
    const pjoin = Editor.Utils.Path.join;
    const inject_script = `window.packageVersion = "${packageVersion}";\n
    `
    var url = pjoin(result.dest, 'data', 'main.js');

    if (!fs.existsSync(url)) {
        url = pjoin(result.dest, 'assets', 'main.js');
    }

    const data = fs.readFileSync(url, "utf-8");
    const newStr = inject_script + data;
    fs.writeFileSync(url, newStr, { encoding: "utf-8" });
    console.warn("(window.packageVersion) updated in built main.js.");
}