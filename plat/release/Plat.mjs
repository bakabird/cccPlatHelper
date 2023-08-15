import { game, sys, native } from 'cc';
import { NATIVE, WECHAT, BYTEDANCE, HUAWEI, VIVO, OPPO, XIAOMI, DEV } from 'cc/env';

var GamePlat;
(function (GamePlat) {
    GamePlat["web"] = "web";
    GamePlat["wx"] = "wx";
    GamePlat["vivo"] = "vivo";
    GamePlat["oppo"] = "oppo";
    GamePlat["ios"] = "ios";
    GamePlat["and"] = "and";
    GamePlat["mi"] = "mi";
    GamePlat["huawei"] = "huawei";
    GamePlat["tt"] = "tt";
})(GamePlat || (GamePlat = {}));
var Channel;
(function (Channel) {
    Channel["Taptap"] = "Taptap";
    Channel["Oppo"] = "Oppo";
    Channel["Vivo"] = "Vivo";
    Channel["Mi"] = "Mi";
    Channel["YYB"] = "YYB";
    Channel["Default"] = "Default";
})(Channel || (Channel = {}));
var AndLayoutGravity;
(function (AndLayoutGravity) {
    AndLayoutGravity[AndLayoutGravity["Top"] = 1] = "Top";
    AndLayoutGravity[AndLayoutGravity["Bottom"] = 2] = "Bottom";
    AndLayoutGravity[AndLayoutGravity["Left"] = 4] = "Left";
    AndLayoutGravity[AndLayoutGravity["Right"] = 8] = "Right";
    AndLayoutGravity[AndLayoutGravity["CenterVertical"] = 16] = "CenterVertical";
    AndLayoutGravity[AndLayoutGravity["CenterHorizontal"] = 32] = "CenterHorizontal";
    AndLayoutGravity[AndLayoutGravity["Center"] = 48] = "Center";
})(AndLayoutGravity || (AndLayoutGravity = {}));
function ajustByPlat(cfg, channel) {
    let plat = "default";
    if (NATIVE && sys.os === sys.OS.ANDROID) {
        // if (true) {
        switch (channel) {
            case Channel.Oppo:
                plat = "and_oppo";
                break;
            case Channel.Mi:
                plat = "and_mi";
                break;
            case Channel.Vivo:
                plat = "and_vivo";
                break;
            case Channel.YYB:
                plat = "and_yyb";
                break;
            case Channel.Taptap:
                plat = "and_taptap";
                break;
        }
    }
    else if (NATIVE && sys.os === sys.OS.IOS) {
        plat = "ios";
    }
    else if (WECHAT) {
        plat = "wx";
    }
    else if (BYTEDANCE) {
        plat = "tt";
    }
    else if (HUAWEI) {
        plat = "hw";
    }
    else if (VIVO) {
        plat = "vivo";
    }
    else if (OPPO) {
        plat = "oppo";
    }
    else if (XIAOMI) {
        plat = "mi";
    }
    const base = cfg;
    const platCfg = base[`_${plat}_`];
    if (platCfg) {
        for (const key in platCfg) {
            if (Object.prototype.hasOwnProperty.call(platCfg, key)) {
                const value = platCfg[key];
                base[key] = value;
            }
        }
    }
}
class PlatBase {
    constructor() {
        this.testShowADCount = 0;
        this._isInit = false;
    }
    /**
     * 初始化
     * @param {object} option 初始化参数
     * @param {(tip: string) => void} option.popTip 弹出提示
     * @param {boolean} option.isLandsacpe 是否横屏
     * @param {object} option.AdCfg 广告配置(传入后将会对配置进行平台适配兼容)，可通过插件创建/更新。
     * @param {object} option.usePlatWeb [可选]是否在对应平台上强制使用 PlatWeb
     * @param {object} option.replacePlat [可选]在对应平台上改用自定义的 PlatBase 类
     * @param {PlatHWParam} option.huaweiParam [可选]华为小游戏参数
     * @returns
     */
    init(option) {
        if (this._isInit)
            return;
        if (option.replacePlat && option.replacePlat[this.plat] && !Plat.forceUsePlatBase) {
            Plat.forceUsePlatBase = new option.replacePlat[this.plat]();
            option.replacePlat = undefined;
            option.usePlatWeb = undefined;
            Plat.inst.init(option);
            return;
        }
        else if (option.usePlatWeb && option.usePlatWeb[this.plat]) {
            Plat.forceUsePlatWeb = true;
            option.replacePlat = undefined;
            option.usePlatWeb = undefined;
            Plat.inst.init(option);
            return;
        }
        if ((option.popTip === null || option.popTip === undefined)
            || (option.isLandsacpe === null || option.isLandsacpe === undefined)) {
            console.error("PlatBase.init 参数错误", option);
            return;
        }
        this.popTip = option.popTip;
        this.huaweiParam = option.huaweiParam;
        this.isLandsacpe = this.isLandsacpe;
        ajustByPlat(option.AdCfg, Plat.inst.channel);
        this._isInit = true;
    }
    /** 登录 */
    login(onLogin, uid) {
        onLogin();
    }
    /**
     * 屏幕震动
     * @param type 震动类型
     */
    vibrate(type) {
        console.log("vibrate", type);
    }
    /**
     * @deprecated 准备废弃。推荐使用 showReawrdAd。
     * 广告展示
     * @param {ADCallback} onSuc
     * @param {Function} onNotSupport 当前平台不支持广告展示时调用
     * @param {String} posId - 广告位id。如不需要传null即可
     */
    showAD(onSuc, onNotSupport, posId) {
        this.showRewardAd({
            suc: () => onSuc(true),
            fail: () => onSuc(false),
            notSupport: onNotSupport,
            posId,
        });
    }
    /**
     * 播放激励广告
     * @param arg 参数
     * @param arg.suc 播放成功回调
     * @param arg.fail 播放失败回调 errcode 0：广告播放中途退出 -1：广告加载中
     * @param arg.notSupport 平台不支持回调
     * @param arg.posId 广告位id。建议配置在 AdCfg 中，如不需要传null即可
     */
    showRewardAd(arg) {
        var _a, _b, _c;
        this.testShowADCount++;
        if (this.testShowADCount == 1) {
            console.log("【测试】奖励成功");
            arg.suc();
        }
        else if (this.testShowADCount == 2) {
            console.log("【测试】平台不支持");
            (_a = arg.notSupport) === null || _a === void 0 ? void 0 : _a.call(arg);
        }
        else if (this.testShowADCount == 3) {
            console.log("【测试】广告播放中途退出");
            (_b = arg.fail) === null || _b === void 0 ? void 0 : _b.call(arg, 0);
        }
        else {
            console.log("【测试】广告加载中");
            (_c = arg.fail) === null || _c === void 0 ? void 0 : _c.call(arg, -1);
            this.testShowADCount = 0;
        }
    }
    /**
     * 播放Banner广告
     * @param arg - 参数
     * @param arg.posId - 广告位id。建议配置在 AdCfg 中，如不需要传null即可
     * @param arg.pos - 广告位置
     * @param arg.wxArg - [可选] 微信平台参数
     * @param arg.wxArg.width - 广告条宽度,屏幕的百分比,取值范围0-1;
     * @param arg.wxArg.bottom - 广告条距离屏幕底部的高度,单位是像素;
     */
    showBannerAd(arg) {
        var _a, _b;
        console.log("PlatBase.showBannerAd posId," + arg.posId + ",pos," + arg.pos);
        console.log("PlatBase.showBannerAd wxArg", (_a = arg.wxArg) === null || _a === void 0 ? void 0 : _a.width, (_b = arg.wxArg) === null || _b === void 0 ? void 0 : _b.bottom);
    }
    /**
     * 隐藏当前的Banner广告
     */
    hideBannerAd() {
        console.log("hideBannerAd");
    }
    /**
     * 播放模板广告
     * @param arg - 参数
     * @param {String} arg.posId - 广告位id。建议配置在 AdCfg 中，如不需要传null即可
     * @param {Function} arg.onAdClose - 广告结束回调
     * @param {String} arg.widthMode - 宽度模式：Dip（走 widthDp 的值） | MatchParent（跟屏幕同宽） | WrapContent(走内容宽度)
     * @param {boolean} arg.force - 是否强制玩家点击广告
     * @param {number} arg.widthDp - 可选，默认300。Dip模式下的宽度
     * @param {boolean} arg.debug - 可选，默认false。是否调试
     * @param {AndLayoutGravity} arg.gravity - 可选，默认居中贴底。调整广告的布局位置
     *      AndLayoutGravity.Top
     *      AndLayoutGravity.Top | AndLayoutGravity.Left
     *      AndLayoutGravity.CenterHorizontal | AndLayoutGravity.Bottom
     *      AndLayoutGravity.Center
     */
    showTemplateAd(arg) {
        console.log("PlatBase.showTemplateAd posId," + arg.posId);
        console.log("PlatBase.showTemplateAd onAdClose," + arg.onAdClose);
        console.log("PlatBase.showTemplateAd widthMode," + arg.widthMode);
        console.log("PlatBase.showTemplateAd force," + arg.force);
        console.log("PlatBase.showTemplateAd widthDp," + arg.widthDp);
        console.log("PlatBase.showTemplateAd gravity," + arg.gravity);
        console.log("PlatBase.showTemplateAd debug," + arg.debug);
    }
    /**
     * 隐藏当前的Banner广告
     */
    hideTemplateAd() {
        console.log("hideTemplateAd");
    }
    /**
     * 播放插屏广告
     * @param arg - 参数
     * @param arg.posId - 广告位id。建议配置在 AdCfg 中，如不需要传null即可
     */
    showInterstitialAd(arg) {
        console.log("PlatBase.showInterstitialAd posId," + arg.posId);
        console.log("PlatBase.showInterstitialAd onAdClose," + arg.onAdClose);
    }
    /**
     * 退出游戏
     */
    endGame() {
        game.end();
    }
    /**
     * 进入游戏中心
     */
    enterGameCenter() {
        console.log("enterGameCenter");
    }
    /**
     * 设置加载页进度
     * @param {number} pro - progress 0-99 当前进度
     */
    setLoadingProgress(pro) {
        console.log("setLoadingProgress " + pro);
    }
    /**
     * 隐藏游戏加载页面
     */
    loadingComplete() {
        console.log("loadingComplete");
    }
    /**
     * 确认平台准备完毕
     */
    checkPlatReady(onReady) {
        onReady("Release");
    }
    /**
     * 开始录屏
     */
    startRecord(options) {
        console.log("startRecord. do nothings", options);
    }
    /**
     * 暂停录屏
     */
    pauseRecord() {
        console.log("pauseRecords. do nothings");
    }
    /**
     * 恢复录屏
     */
    resumeRecord() {
        console.log("resumeRecord. do nothings");
    }
    /**
     * 结束录屏
     */
    stopRecord(onStop) {
        console.log("stopRecord. do nothings");
        onStop("");
    }
    /**
     * 分享录屏
     * @param options
     * @param {string} options.vidPath - 录屏的地址
     */
    shareRecord(options) {
        console.log("shareRecord. do nothings", options);
    }
    get uma() {
        return window.uma;
    }
    get curTime() {
        return Date.now();
    }
    get plat() {
        return GamePlat.web;
    }
    get channel() {
        return Channel.Default;
    }
    /**
     * 包版本：一般是原生平台使用
     */
    get packageVersion() {
        return -1;
    }
}

var jsb$1 = native;
class PlatAnd extends PlatBase {
    static getInstance() {
        if (!this._instance) {
            this._instance = new PlatAnd();
        }
        return this._instance;
    }
    logCatch(...args) {
        console.log(`[JSB-CATCH]`, ...args);
    }
    constructor() {
        super();
        if (NATIVE) {
            jsb$1.jsbBridgeWrapper.removeAllListeners();
            jsb$1.jsbBridgeWrapper.addNativeEventListener("ShowAdRet", (code) => {
                var _a;
                var icode = parseInt(code);
                this.logCatch("ShowAdRet");
                (_a = this._onShowRwdAdCallback) === null || _a === void 0 ? void 0 : _a.call(this, icode == 1, icode == 0 ? 0 : -1);
                this._onShowRwdAdCallback = null;
            });
            jsb$1.jsbBridgeWrapper.addNativeEventListener("TemplateAdRet", (code) => {
                var _a;
                var icode = parseInt(code);
                this.logCatch("TemplateAdRet");
                (_a = this._onShowTemplateAdCallback) === null || _a === void 0 ? void 0 : _a.call(this, icode == 1 ? null : icode);
                this._onShowTemplateAdCallback = null;
            });
            jsb$1.jsbBridgeWrapper.addNativeEventListener("InsertAdRet", (code) => {
                var _a;
                var icode = parseInt(code);
                this.logCatch("InsertAdRet");
                (_a = this._onShowInsertAdCallback) === null || _a === void 0 ? void 0 : _a.call(this, icode == 1 ? null : icode);
                this._onShowInsertAdCallback = null;
            });
            jsb$1.jsbBridgeWrapper.addNativeEventListener("AntiAddictionRet", (code) => {
                this.logCatch("AntiAddictionRet");
                this._onLoginCallback();
                this._onLoginCallback = null;
            });
            jsb$1.jsbBridgeWrapper.addNativeEventListener("CheckPlatReadyRet", (env) => {
                if (env != "Debug" && env != "Release") {
                    env = "Release";
                }
                this.logCatch("CheckPlatReadyRet");
                this._onCheckPlatReady(env);
                this._onCheckPlatReady = null;
            });
            this._uma = {
                trackEvent(eventId, params) {
                    jsb$1.jsbBridgeWrapper.dispatchEventToNative('Track', JSON.stringify({
                        eventID: eventId,
                        params: typeof (params) == "string" ? {
                            p2c_val: params
                        } : params,
                    }));
                }
            };
        }
        else {
            this._uma = {
                trackEvent(eventId, params) {
                    console.log('[uma]trackEvent', eventId, params);
                }
            };
        }
    }
    login(onLogin, uid) {
        if (NATIVE) {
            if (this._onLoginCallback)
                return;
            this._onLoginCallback = onLogin;
            jsb$1.jsbBridgeWrapper.dispatchEventToNative('AntiAddiction', uid);
        }
        else {
            super.login(onLogin, uid);
        }
    }
    showAD(onSuc, onNotSupport, posId) {
        this.showRewardAd({
            suc: () => onSuc(true),
            fail: () => onSuc(false),
            notSupport: () => onNotSupport(),
            posId,
        });
    }
    showBannerAd(arg) {
        if (NATIVE) {
            jsb$1.jsbBridgeWrapper.dispatchEventToNative('ShowBannerAd', JSON.stringify(arg));
        }
    }
    hideBannerAd() {
        if (NATIVE) {
            jsb$1.jsbBridgeWrapper.dispatchEventToNative('HideBannerAd');
        }
    }
    showTemplateAd(arg) {
        var _a, _b, _c;
        if (NATIVE) {
            (_a = arg.widthDp) !== null && _a !== void 0 ? _a : (arg.widthDp = 300);
            (_b = arg.gravity) !== null && _b !== void 0 ? _b : (arg.gravity = AndLayoutGravity.Bottom | AndLayoutGravity.Center);
            (_c = arg.debug) !== null && _c !== void 0 ? _c : (arg.debug = false);
            arg["andMiArg"] = {
                widthMode: arg.widthMode,
                force: arg.force,
                widthDp: arg.widthDp,
                gravity: arg.gravity,
                debug: arg.debug,
            };
            this._onShowTemplateAdCallback = arg.onAdClose;
            jsb$1.jsbBridgeWrapper.dispatchEventToNative('ShowTemplateAd', JSON.stringify(arg));
        }
    }
    hideTemplateAd() {
        if (NATIVE) {
            this._onShowTemplateAdCallback = null;
            jsb$1.jsbBridgeWrapper.dispatchEventToNative('HideTemplateAd');
        }
    }
    showRewardAd(arg) {
        if (this._onShowRwdAdCallback)
            return;
        if (NATIVE) {
            const onAdCallback = (isSuc, errcode) => {
                var _a;
                if (isSuc) {
                    arg.suc();
                }
                else {
                    (_a = arg.fail) === null || _a === void 0 ? void 0 : _a.call(arg, errcode);
                }
            };
            this._onShowRwdAdCallback = onAdCallback;
            jsb$1.jsbBridgeWrapper.dispatchEventToNative('ShowAd', arg.posId);
        }
        else {
            super.showRewardAd(arg);
        }
    }
    showInterstitialAd(arg) {
        if (NATIVE) {
            this._onShowInsertAdCallback = arg.onAdClose;
            jsb$1.jsbBridgeWrapper.dispatchEventToNative('ShowInterstitialAd', arg.posId);
        }
        else {
            super.showInterstitialAd(arg);
        }
    }
    endGame() {
        if (NATIVE) {
            jsb$1.jsbBridgeWrapper.dispatchEventToNative('EndGame', "");
        }
        else {
            super.endGame();
        }
    }
    enterGameCenter() {
        if (NATIVE) {
            jsb$1.jsbBridgeWrapper.dispatchEventToNative('EnterGameCenter', "");
        }
        else {
            super.enterGameCenter();
        }
    }
    checkPlatReady(onReady) {
        if (NATIVE) {
            if (this._onCheckPlatReady)
                return;
            this._onCheckPlatReady = onReady;
            jsb$1.jsbBridgeWrapper.dispatchEventToNative('CheckPlatReady', "");
        }
        else {
            super.checkPlatReady(onReady);
        }
    }
    get plat() {
        return GamePlat.and;
    }
    get uma() {
        return this._uma;
    }
    get channel() {
        return window.channel;
    }
    get packageVersion() {
        var _a;
        return (_a = window.packageVersion) !== null && _a !== void 0 ? _a : 1;
    }
}

var jsb = native;
class PlatIOS extends PlatBase {
    static getInstance() {
        if (!this._instance) {
            this._instance = new PlatIOS();
        }
        return this._instance;
    }
    logCatch(...args) {
        console.log(`[JSB-IOS-CATCH]`, ...args);
    }
    constructor() {
        super();
        if (NATIVE) {
            jsb.jsbBridgeWrapper.removeAllListeners();
            jsb.jsbBridgeWrapper.addNativeEventListener("ShowAdRet", (code) => {
                var _a;
                var icode = parseInt(code);
                this.logCatch("ShowAdRet");
                (_a = this._onShowRwdAdCallback) === null || _a === void 0 ? void 0 : _a.call(this, icode == 1, icode == 0 ? 0 : -1);
                this._onShowRwdAdCallback = null;
            });
            jsb.jsbBridgeWrapper.addNativeEventListener("AntiAddictionRet", (code) => {
                this.logCatch("AntiAddictionRet");
                this._onLoginCallback();
                this._onLoginCallback = null;
            });
            jsb.jsbBridgeWrapper.addNativeEventListener("CheckPlatReadyRet", (env) => {
                if (env != "Debug" && env != "Release") {
                    env = "Release";
                }
                this.logCatch("CheckPlatReadyRet");
                this._onCheckPlatReady(env);
                this._onCheckPlatReady = null;
            });
            this._uma = {
                trackEvent(eventId, params) {
                    if (typeof (params) == "string") {
                        params = { p2c_val: params };
                    }
                    else {
                        for (let key in params) {
                            params[key] = params[key].toString();
                        }
                    }
                    jsb.jsbBridgeWrapper.dispatchEventToNative('Track', JSON.stringify({
                        eventID: eventId,
                        params,
                    }));
                }
            };
        }
        else {
            this._uma = {
                trackEvent(eventId, params) {
                    console.log('[uma]trackEvent', eventId, params);
                }
            };
        }
    }
    login(onLogin, uid) {
        if (NATIVE) {
            if (this._onLoginCallback)
                return;
            this._onLoginCallback = onLogin;
            jsb.jsbBridgeWrapper.dispatchEventToNative('AntiAddiction', uid);
        }
        else {
            super.login(onLogin, uid);
        }
    }
    showAD(onSuc, onNotSupport, posId) {
        this.showRewardAd({
            suc: () => onSuc(true),
            fail: () => onSuc(false),
            notSupport: () => onNotSupport(),
            posId,
        });
    }
    showBannerAd(arg) {
        if (NATIVE) {
            jsb.jsbBridgeWrapper.dispatchEventToNative('ShowBannerAd', JSON.stringify(arg));
        }
    }
    hideBannerAd() {
        if (NATIVE) {
            jsb.jsbBridgeWrapper.dispatchEventToNative('HideBannerAd');
        }
    }
    showRewardAd(arg) {
        if (this._onShowRwdAdCallback)
            return;
        if (NATIVE) {
            const onAdCallback = (isSuc, errcode) => {
                var _a;
                if (isSuc) {
                    arg.suc();
                }
                else {
                    (_a = arg.fail) === null || _a === void 0 ? void 0 : _a.call(arg, errcode);
                }
            };
            this._onShowRwdAdCallback = onAdCallback;
            jsb.jsbBridgeWrapper.dispatchEventToNative('ShowAd', arg.posId);
        }
        else {
            super.showRewardAd(arg);
        }
    }
    showInterstitialAd(arg) {
        if (NATIVE) {
            jsb.jsbBridgeWrapper.dispatchEventToNative('ShowInterstitialAd', arg.posId);
        }
    }
    endGame() {
        if (NATIVE) {
            jsb.jsbBridgeWrapper.dispatchEventToNative('EndGame', "");
        }
        else {
            super.endGame();
        }
    }
    enterGameCenter() {
        if (NATIVE) {
            jsb.jsbBridgeWrapper.dispatchEventToNative('EnterGameCenter', "");
        }
        else {
            super.enterGameCenter();
        }
    }
    checkPlatReady(onReady) {
        if (NATIVE) {
            if (this._onCheckPlatReady)
                return;
            this._onCheckPlatReady = onReady;
            jsb.jsbBridgeWrapper.dispatchEventToNative('CheckPlatReady', "");
        }
        else {
            super.checkPlatReady(onReady);
        }
    }
    get plat() {
        return GamePlat.ios;
    }
    get uma() {
        return this._uma;
    }
    get packageVersion() {
        return window.packageVersion;
    }
}

class PlatMi extends PlatBase {
    constructor() {
        super(...arguments);
        this._sysInfo = null;
        this._onRwdAdSuc = null;
        this._nextShowAd = 0;
        // 0:待加载 1:Load中 2:Load完毕
        this._lastRwdState = 0;
        this._bannerAd = null; //banner
        this._insertAd = null;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new PlatMi();
        }
        return this._instance;
    }
    get sysInfo() {
        if (this._sysInfo)
            return this._sysInfo;
        this._sysInfo = qg.getSystemInfoSync();
        return this._sysInfo;
    }
    endGame() {
        qg.exitApplication({
            success: () => {
                console.log("退出成功！");
            },
            fail: () => {
                console.log("退出失败！");
            }
        });
    }
    showAD(onSuc, onNotSupport, posId) {
        this.showRewardAd({
            suc: () => {
                onSuc(true);
            },
            fail: () => {
                onSuc(false);
            },
            notSupport: () => {
                onNotSupport();
            },
            posId,
        });
    }
    showRewardAd(arg) {
        var _a;
        if (this.curTime < this._nextShowAd) {
            arg === null || arg === void 0 ? void 0 : arg.fail(-1);
            return;
        }
        this._nextShowAd = this.curTime + 3 * 1000;
        if (this._lastRwdState == 1) {
            arg === null || arg === void 0 ? void 0 : arg.fail(-1);
            console.log("showRewardAd cancel, last call not end.");
            return;
        }
        this._onRwdAdSuc = (isSuc, errcode) => {
            if (isSuc) {
                arg.suc();
            }
            else {
                arg === null || arg === void 0 ? void 0 : arg.fail(errcode);
            }
        };
        if (!this._rwdAd || this._lastRwdPosId != arg.posId) {
            (_a = this._rwdAd) === null || _a === void 0 ? void 0 : _a.destroy();
            this._rwdAd = null;
            this._lastRwdPosId = arg.posId;
            this._initRewardedAd(arg.posId);
        }
        else if (this._lastRwdState == 0) {
            this._rwdAd.load();
        }
        if (this._lastRwdState == 2) {
            this._rwdAd.show();
        }
    }
    _initRewardedAd(posId) {
        const rewardedAd = qg.createRewardedVideoAd({
            adUnitId: posId,
        });
        let count = 0;
        const autoPlayAtFirstLoad = () => {
            if (count == 0) {
                this._rwdAd.show();
                count++;
            }
        };
        const rwdADWaiting = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, false, -1);
            this._onRwdAdSuc = null;
        };
        const rwdAdFail = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, false, 0);
            this._onRwdAdSuc = null;
        };
        const rwdAdSuc = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, true);
            this._onRwdAdSuc = null;
        };
        rewardedAd.onError((errMsg, errCode) => {
            console.log("激励视频广告加载失败 ", errCode, errMsg);
            this._lastRwdState = 0;
            rwdADWaiting();
        });
        rewardedAd.onLoad(() => {
            console.log('激励视频广告加载完成-onload触发');
            this._lastRwdState = 2;
            autoPlayAtFirstLoad();
        });
        rewardedAd.onClose((isEnded) => {
            console.log('视频广告关闭回调');
            if (isEnded) {
                console.log("正常播放结束，可以下发游戏奖励");
                rwdAdSuc();
            }
            else {
                console.log("播放中途退出，不下发游戏奖励");
                rwdAdFail();
            }
            this._lastRwdState = 0;
            // 平台接口特性：视频播放结束后会自动调 load
        });
        this._lastRwdState = 1;
        this._rwdAd = rewardedAd;
    }
    showBannerAd(arg) {
        if (!this._bannerAd || arg.pos != this._lastBannerPos) {
            this._loadBannerAd(arg.posId, arg.pos);
        }
        else {
            this._bannerAd.show();
        }
    }
    hideBannerAd() {
        if (this._bannerAd) {
            this._bannerAd.hide();
            console.log("隐藏小米小游戏banner");
        }
    }
    /**
     * 加载banner广告
     */
    _loadBannerAd(posId, pos) {
        if (this._bannerAd) {
            this._bannerAd.destroy();
            this._bannerAd = null;
        }
        if (pos == "top") {
            console.error("top banner 暂不支持");
        }
        const bannerWidth = 385;
        const bannerHeight = 58;
        let left = (this.sysInfo.screenWidth - bannerWidth) * 0.5;
        if (this.isLandsacpe) {
            left = this.sysInfo.screenWidth * 0.5;
        }
        let bannerStyle = {
            left: left,
            top: this.sysInfo.screenHeight - bannerHeight,
            width: bannerWidth
        };
        this._lastBannerPos = pos;
        this._bannerAd = qg.createBannerAd({
            adUnitId: posId,
            style: bannerStyle
        });
        // console.log(qg.getProvider())
        if (this._bannerAd) {
            this._bannerAd.onLoad((res) => {
                console.log(res, 'onload');
            });
            //监听 banner 广告尺寸变化事件
            this._bannerAd.onResize((res) => {
                this._bannerAd.style.left = (this.sysInfo.screenWidth - res.width) * 0.5;
                console.log("===========left" + this._bannerAd.style.left, this._bannerAd.style);
            });
            this._bannerAd.onError((res) => {
                console.log(res, 'onError');
                this._bannerAd = null;
            });
            this._bannerAd.onClose(() => {
                console.log("banner广告关闭");
                this._bannerAd = null;
            });
            if (this._bannerAd) {
                this._bannerAd.show();
                console.log("xiaomi 小游戏Banner show");
            }
        }
    }
    /**
     * 确认平台准备完毕
     */
    checkPlatReady(onReady) {
        if (this.sysInfo.platformVersionCode > 1060) {
            const updateManager = qg.getUpdateManager();
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                console.log('onCheckForUpdate', res.hasUpdate);
            });
            updateManager.onUpdateReady(function () {
                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                updateManager.applyUpdate();
            });
            updateManager.onUpdateFailed(function () {
                // 新版本下载失败
            });
        }
        onReady("Release");
    }
    showInterstitialAd(arg) {
        console.log("显示小米小游戏插屏");
        if (this._insertAd)
            return;
        this._insertAd = qg.createInterstitialAd({
            adUnitId: arg.posId,
        });
        const close = () => {
            this._insertAd.destroy();
            this._insertAd = null;
        };
        this._insertAd.onLoad(() => {
            console.log("插屏广告加载成功");
            this._insertAd.show().then((data) => {
                console.log('小游戏插屏广告show成功', JSON.stringify(data));
                close();
            }, (err) => {
                console.log('小游戏插屏广告show失败', JSON.stringify(err));
                close();
            });
        });
        this._insertAd.onError((err) => {
            console.log("小游戏插屏广告出错:" + err.code + err.msg);
            close();
        });
        this._insertAd.onClose(() => {
            console.log("插屏广告关闭");
            this._insertAd.destroy();
            this._insertAd = null;
            close();
        });
    }
    get plat() {
        return GamePlat.mi;
    }
    get uma() {
        return qg.uma;
    }
}
PlatMi._instance = null;

class PlatOPPO extends PlatBase {
    constructor() {
        super(...arguments);
        this._nextShowAd = 0;
    }
    static getInstance() {
        if (!this._instance) {
            console.log("using PlatOPPO");
            this._instance = new PlatOPPO();
        }
        return this._instance;
    }
    showAD(onSuc, onNotSupport, posId) {
        this.showRewardAd({
            suc: () => {
                onSuc(true);
            },
            fail: () => {
                onSuc(false);
            },
            notSupport: () => {
                onNotSupport();
            },
            posId,
        });
    }
    showRewardAd(arg) {
        var _a, _b;
        if (this.curTime < this._nextShowAd) {
            (_a = arg.fail) === null || _a === void 0 ? void 0 : _a.call(arg, -1);
            this.popTip("广告拉取过于频繁");
            return;
        }
        this._nextShowAd = this.curTime + 3 * 1000;
        if (this._onRwdAdSuc != null) {
            (_b = arg.fail) === null || _b === void 0 ? void 0 : _b.call(arg, -1);
            console.log("showAD cancel, last call not end.");
            return;
        }
        this._onRwdAdSuc = (isSuc, errcode) => {
            if (isSuc) {
                arg.suc();
            }
            else {
                arg === null || arg === void 0 ? void 0 : arg.fail(errcode);
            }
        };
        if (!this._rwdAd || arg.posId != this._lastRwdPosId) {
            this._initRewardedAd(arg.posId);
            this._lastRwdPosId = arg.posId;
        }
        this._rwdAd.load();
    }
    showBannerAd(arg) {
        if (!this._bannerAd || arg.pos != this._lastBannerPos) {
            this._loadBannerAd(arg.posId, arg.pos);
            this._lastRwdPosId = arg.posId;
        }
        else {
            this._bannerAd.show();
        }
    }
    hideBannerAd() {
        if (this._bannerAd) {
            this._bannerAd.hide();
        }
    }
    showInterstitialAd(arg) {
        console.log("暂不支持");
        return;
    }
    vibrate(type) {
        if (type == "short") {
            qg.vibrateShort({ success(res) { }, fail(res) { } }); //（20 ms）
        }
        else {
            qg.vibrateLong({ success(res) { }, fail(res) { } }); //400 ms
        }
    }
    /**
     * 确认平台准备完毕
     */
    checkPlatReady(onReady) {
        qg.getSystemInfo({
            success: data => {
                this._deviceInfo = {
                    brand: data.brand, model: data.model, pixelRatio: data.pixelRatio,
                    screenWidth: data.screenWidth, screenHeight: data.screenHeight,
                    windowWidth: data.windowWidth, windowHeight: data.windowHeight, statusBarHeight: data.statusBarHeight,
                    language: data.language, version: '', system: data.system, platform: data.platformVersionName, fontSizeSetting: 0, SDKVersion: '', benchmarkLevel: 0, platformVersionCode: data.platformVersionCode,
                };
                console.log('sysinfo:', JSON.stringify(data));
                if (this._deviceInfo.platformVersionCode >= 1094) {
                    this._dealUpdate();
                }
            },
            fail: err => {
                console.error('getsysinfo failed:', err);
            },
            complete: () => {
                onReady("Release");
            }
        });
    }
    _dealUpdate() {
        const updateManager = qg.getUpdateManager();
        //检测是否有可更新版本
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            if (res.hasUpdate) ;
            else {
                console.log("PlatOPPO 没有可更新版本");
                // qg.showToast({
                //     title: "没有可更新版本",
                //     icon: "none",
                //     duration: 2000,
                // });
            }
        });
        updateManager.onUpdateReady(function () {
            qg.showModal({
                title: "更新提示",
                content: "新版本已经准备好，是否重启应用？",
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate();
                    }
                },
            });
        });
    }
    endGame() {
        qg.exitApplication({});
    }
    setLoadingProgress(pro) {
        qg.setLoadingProgress({
            progress: pro,
        });
        if (qg.getSystemInfoSync().platformVersionCode < 1076) {
            console.log("新的数据上报接口 API 仅支持平台版本号大于 1076 的快应用");
            return;
        }
        qg.reportMonitor("load_res_begin");
    }
    loadingComplete() {
        qg.loadingComplete({
            complete: (res) => {
                if (qg.getSystemInfoSync().platformVersionCode < 1076) {
                    console.log("新的数据上报接口 API 仅支持平台版本号大于 1076 的快应用");
                    return;
                }
                qg.reportMonitor("load_res_complete");
                qg.reportMonitor("game_scene");
            },
        });
    }
    _initRewardedAd(posId) {
        if (this._rwdAd)
            this._rwdAd.destroy();
        const rewardedAd = qg.createRewardedVideoAd({
            adUnitId: posId,
        });
        const rwdADWaiting = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, false);
            this._onRwdAdSuc = null;
        };
        const rwdAdFail = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, false);
            this._onRwdAdSuc = null;
        };
        const rwdAdSuc = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, true);
            this._onRwdAdSuc = null;
        };
        rewardedAd.onError(err => {
            console.log("激励视频广告加载失败", err);
            rwdADWaiting();
        });
        rewardedAd.onLoad(() => {
            console.log('激励视频广告加载完成-onload触发');
            rewardedAd.show();
        });
        rewardedAd.onClose((res) => {
            console.log('视频广告关闭回调');
            if (res == undefined) {
                console.log("正常播放结束，可以下发游戏奖励");
                rwdAdSuc();
            }
            else {
                console.log('用户点击了关闭广告按钮');
                if (res.isEnded) {
                    console.log('用户看完了');
                    rwdAdSuc();
                }
                else {
                    console.log("播放中途退出，不下发游戏奖励");
                    rwdAdFail();
                }
            }
        });
        this._rwdAd = rewardedAd;
    }
    /**
     * 加载banner广告
     */
    _loadBannerAd(posId, pos) {
        if (pos == "top") {
            console.error("top banner 暂不支持");
        }
        if (this._bannerAd) {
            this._bannerAd.destroy();
            this._bannerAd = null;
        }
        this._bannerAd = qg.createBannerAd({
            adUnitId: posId,
        });
        console.log(qg.getProvider());
        if (this._bannerAd) {
            this._bannerAd.onLoad((data) => {
                console.log(data, 'onload');
            });
            //监听 banner 广告尺寸变化事件
            this._bannerAd.onResize((data) => {
                console.log(data.width + "|" + data.height, 'onResize');
            });
            this._bannerAd.onError((data) => {
                console.log(data, 'onError');
                this._bannerAd = null;
            });
            this._bannerAd.show().then(() => {
                console.log(`banner 广告show成功,realWidth:${this._bannerAd.style.realWidth}, realHeight: ${this._bannerAd.style.realHeight}`);
            }, (err) => {
                console.log("banner 广告show失败:" + JSON.stringify(err));
            });
        }
    }
    /**
     * 加载插屏
     */
    _loadInterstitialAd(posId) {
        if (this._insertAd)
            return;
        this._insertAd = qg.createInterstitialAd({
            adUnitId: posId,
        });
        this._insertAd.onLoad(() => {
            console.log("插屏广告加载成功");
            this._insertAd.show().then((data) => {
                console.log('OPPO 小游戏插屏广告show成功', JSON.stringify(data));
                //OPPO 配置当前插屏显示成功后销毁banner
                this.hideBannerAd();
            }, (err) => {
                console.log('OPPO 小游戏插屏广告show失败', JSON.stringify(err));
            });
        });
        let clearCallBack = () => {
            this._insertAd.offShow();
            this._insertAd.offError();
            this._insertAd.offLoad();
        };
        this._insertAd.onError(((err) => {
            console.log("OPPO 小游戏插屏广告出错:" + err.code + err.msg);
            this._insertAd.offError();
            clearCallBack();
            this._insertAd.destroy();
            this._insertAd = null;
        }).bind(this));
        this._insertAd.onClose(() => {
            console.log("插屏广告关闭");
            this._insertAd.destroy();
            this._insertAd = null;
        });
    }
    get plat() {
        return GamePlat.oppo;
    }
}
PlatOPPO._instance = null;

class PlatVIVO extends PlatBase {
    constructor() {
        super(...arguments);
        this._onRwdAdSuc = null;
        this._nextShowAd = 0;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new PlatVIVO();
        }
        return this._instance;
    }
    showAD(onSuc, onNotSupport, posId) {
        this.showRewardAd({
            suc: () => {
                onSuc(true);
            },
            fail: () => {
                onSuc(false);
            },
            notSupport: () => {
                onNotSupport();
            },
            posId,
        });
    }
    showRewardAd(arg) {
        var _a, _b;
        if (this.curTime < this._nextShowAd) {
            (_a = arg.fail) === null || _a === void 0 ? void 0 : _a.call(arg, -1);
            this.popTip("广告拉取过于频繁");
            return;
        }
        this._nextShowAd = this.curTime + 3 * 1000;
        if (this._onRwdAdSuc != null) {
            (_b = arg.fail) === null || _b === void 0 ? void 0 : _b.call(arg, -1);
            console.log("showAD cancel, last call not end.");
            return;
        }
        this._onRwdAdSuc = (isSuc, errcode) => {
            if (isSuc) {
                arg.suc();
            }
            else {
                arg === null || arg === void 0 ? void 0 : arg.fail(errcode);
            }
        };
        if (!this._rwdAd || this._lastRwdPosId != arg.posId) {
            this._initRewardedAd(arg.posId);
        }
        else {
            this._rwdAd.load();
        }
    }
    /**
     * 确认平台准备完毕
     */
    checkPlatReady(onReady) {
        const update = qg.getUpdateManager();
        update.onUpdateReady(function (data) {
            console.log('onUpdateReady');
            qg.showDialog({
                title: '更新提示',
                message: '新版本已经准备好，是否重启应用？',
                success: function (data) {
                    update.applyUpdate(); //强制进行更新
                },
            });
        });
        update.onCheckForUpdate(function (data) {
            console.log('onCheckForUpdate');
        });
        update.onUpdateFailed(function (data) {
            console.log('onUpdateFailed');
        });
        onReady("Release");
    }
    showBannerAd(arg) {
        if (!this._bannerAd || arg.pos != this._lastBannerPos) {
            this._loadBannerAd(arg.posId, arg.pos);
        }
        else {
            this._bannerAd.show();
        }
    }
    hideBannerAd() {
        if (this._bannerAd) {
            var adhide = this._bannerAd.hide();
            adhide && adhide.then(() => {
                console.log("banner广告隐藏成功");
            }).catch(err => {
                console.log("banner广告隐藏失败", JSON.stringify(err));
                var addestroy = this._bannerAd.destroy();
                addestroy && addestroy.then(() => {
                    console.log("banner广告销毁成功");
                }).catch(err => {
                    console.log("banner广告销毁失败", JSON.stringify(err));
                });
                this._bannerAd = null;
            });
        }
    }
    showInterstitialAd(arg) {
        this._loadInterstitialAd(arg.posId);
    }
    vibrate(type) {
        if (type == "short") {
            qg.vibrateShort(); //（15 ms）
        }
        else {
            qg.vibrateLong(); //400 ms
        }
    }
    endGame() {
        qg.exitApplication();
    }
    _initRewardedAd(posId) {
        if (this._rwdAd) {
            this._rwdAd = null;
        }
        const rewardedAd = qg.createRewardedVideoAd({
            posId,
        });
        const rwdADWaiting = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, false, -1);
            this._onRwdAdSuc = null;
        };
        const rwdAdFail = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, false, 0);
            this._onRwdAdSuc = null;
        };
        const rwdAdSuc = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, true);
            this._onRwdAdSuc = null;
        };
        rewardedAd.onError(err => {
            console.log("激励视频广告加载失败", err);
            rwdADWaiting();
        });
        rewardedAd.onLoad((res) => {
            console.log('激励视频广告加载完成-onload触发', JSON.stringify(res));
            rewardedAd.show().then(() => {
                console.log('激励视频广告展示完成');
            }).catch((err) => {
                console.log('激励视频广告展示失败', JSON.stringify(err));
                rwdADWaiting();
            });
        });
        const func = (res) => {
            console.log('视频广告关闭回调');
            if (res && res.isEnded) {
                console.log("正常播放结束，可以下发游戏奖励");
                rwdAdSuc();
            }
            else {
                console.log("播放中途退出，不下发游戏奖励");
                rwdAdFail();
            }
        };
        rewardedAd.onClose(func);
        this._rwdAd = rewardedAd;
    }
    /**
     * 加载banner广告
     */
    _loadBannerAd(posId, pos) {
        if (this._bannerAd) {
            this._bannerAd.destroy();
            this._bannerAd = null;
        }
        const adProp = { adUnitId: posId, };
        if (pos == "bottom") {
            // style内无需设置任何字段，banner会在屏幕底部居中显示，
            // 没有style字段，banner会在上边显示
            adProp["style"] = {};
        }
        this._bannerAd = qg.createBannerAd(adProp);
        console.log(qg.getProvider());
        if (this._bannerAd) {
            this._bannerAd.onLoad((data) => {
                console.log(data, 'VIVO=====onload');
            });
            //监听 banner 广告尺寸变化事件
            this._bannerAd.onResize((data) => {
                console.log(data.width + "|" + data.height, 'onResize');
            });
            this._bannerAd.onError((data) => {
                console.log("VIVO 广告条加载失败! code : " + data.errCode + "; msg : " + data.errMsg);
            });
            this._bannerAd.show().then(() => {
                console.log(`VIVO小游戏banner 广告show成功,realWidth:${this._bannerAd.style.realWidth}, realHeight: ${this._bannerAd.style.realHeight}`);
            }, (err) => {
                console.log("VIVO小游戏banner 广告show失败:" + JSON.stringify(err));
                switch (err.code) {
                    case 30003:
                        console.log("新用户7天内不能曝光Banner，请将手机时间调整为7天后，退出游戏重新进入");
                        break;
                    case 30009:
                        console.log("10秒内调用广告次数超过1次，10秒后再调用");
                        break;
                    case 30002:
                        console.log("加载广告失败，重新加载广告");
                        break;
                    default:
                        // 参考 https://minigame.vivo.com.cn/documents/#/lesson/open-ability/ad?id=广告错误码信息 对错误码做分类处理
                        console.log("banner广告展示失败");
                        break;
                }
            });
        }
    }
    /**
     * 加载插屏
     */
    _loadInterstitialAd(posId) {
        this._insertAd = qg.createInterstitialAd({
            adUnitId: posId,
        });
        this._insertAd.onLoad(() => {
            console.log("VIVO小游戏插屏广告加载成功");
            this._insertAd.show().then((data) => {
                console.log('VIVO小游戏插屏广告show成功', JSON.stringify(data));
            }, (err) => {
                console.log('VIVO小游戏插屏广告show失败', JSON.stringify(err));
                switch (err.code) {
                    case 30003:
                        console.log("新用户7天内不能曝光Banner，请将手机时间调整为7天后，退出游戏重新进入");
                        break;
                    case 30009:
                        console.log("10秒内调用广告次数超过1次，10秒后再调用");
                        break;
                    case 30002:
                        console.log("加载广告失败，重新加载广告");
                        break;
                    default:
                        // 参考 https://minigame.vivo.com.cn/documents/#/lesson/open-ability/ad?id=广告错误码信息 对错误码做分类处理
                        console.log("banner广告展示失败");
                        break;
                }
            });
        });
        this._insertAd.onClose(() => {
            console.log("VIVO小游戏插屏广告关闭");
            this._insertAd.destroy();
            this._insertAd = null;
        });
    }
    get plat() {
        return GamePlat.vivo;
    }
    get uma() {
        return qg.uma;
    }
}
PlatVIVO._instance = null;

class PlatWX extends PlatBase {
    constructor() {
        super(...arguments);
        this._sysInfo = null;
        this._nextShowAd = 0;
        this._videoAd = null;
        this._lastRwdPosId = null;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new PlatWX();
        }
        return this._instance;
    }
    get sysInfo() {
        if (this._sysInfo)
            return this._sysInfo;
        this._sysInfo = wx.getSystemInfoSync();
        return this._sysInfo;
    }
    login(onLogin, uid) {
        onLogin();
        // 获取微信界面大小
        let screenWidth = this.sysInfo.screenWidth;
        let screenHeight = this.sysInfo.screenHeight;
        wx.login({
            success(res) {
                if (res.code) {
                    let code = res.code;
                    console.log("登陆成功,获取到code", code);
                }
                else {
                    console.log('登录失败！' + res.errMsg);
                }
                var button = wx.createUserInfoButton({
                    type: 'text',
                    text: '',
                    style: {
                        left: 0,
                        top: 0,
                        width: screenWidth,
                        height: screenHeight,
                        lineHeight: 40,
                        backgroundColor: '#00000000',
                        color: '#ffffff',
                        textAlign: 'center'
                    }
                });
                button.onTap((res) => {
                    if (res.errMsg == "getUserInfo:ok") {
                        console.log("授权用户信息");
                        //获取到用户信息
                        wx.getUserInfo({
                            lang: "zh_CN",
                            success: function (res) {
                                let userInfo = res.userInfo;
                                console.log(userInfo);
                            },
                            fail: function () {
                                console.log("获取失败");
                                return false;
                            }
                        });
                        //清除微信授权按钮
                        button.destroy();
                    }
                    else {
                        //清除微信授权按钮
                        button.destroy();
                        console.log("授权失败");
                    }
                });
            },
        });
    }
    showAD(onSuc, onNotSupport, posId) {
        this.showRewardAd({
            suc: () => {
                onSuc(true);
            },
            fail: () => {
                onSuc(false);
            },
            notSupport: () => {
                onNotSupport();
            },
            posId,
        });
    }
    showRewardAd(arg) {
        var _a, _b, _c;
        if (!this.isOverMinVersion("2.0.4")) {
            console.log("当前版本不支持视频广告!");
            (_a = arg.notSupport) === null || _a === void 0 ? void 0 : _a.call(arg);
            return;
        }
        if (this.curTime < this._nextShowAd) {
            (_b = arg.fail) === null || _b === void 0 ? void 0 : _b.call(arg, -1);
            console.log("广告拉取过于频繁");
            return;
        }
        this._nextShowAd = this.curTime + 3 * 1000;
        if (this._onRwdAdSuc != null) {
            (_c = arg.fail) === null || _c === void 0 ? void 0 : _c.call(arg, -1);
            console.log("showRwdAd cancel, last call not end.");
            return;
        }
        this._onRwdAdSuc = arg.suc;
        this._onRwdAdFail = arg.fail;
        if (!this._videoAd || this._lastRwdPosId != arg.posId) {
            this._lastRwdPosId = arg.posId;
            this._initRewardedAd(arg.posId);
        }
        this._videoAd.show();
    }
    vibrate(type) {
        console.log("vibrate", type);
        if (type == "short") {
            //使手机发生较短时间的振动（15 ms）。仅在 iPhone 7 / 7 Plus 以上及 Android 机型生效
            wx.vibrateShort({ success(res) { }, fail(res) { } });
        }
        else {
            //@ts-ignore
            wx.vibrateLong({ success(res) { }, fail(res) { } }); //400 ms
        }
    }
    _initRewardedAd(posId) {
        let autoplay = true;
        const rewardedAd = wx.createRewardedVideoAd({
            adUnitId: posId,
        });
        const rwdADFail = () => {
            var _a;
            (_a = this._onRwdAdFail) === null || _a === void 0 ? void 0 : _a.call(this, -1);
            this._onRwdAdSuc = this._onRwdAdFail = null;
        };
        const rwdAdCancel = () => {
            var _a;
            (_a = this._onRwdAdFail) === null || _a === void 0 ? void 0 : _a.call(this, 0);
            this._onRwdAdSuc = this._onRwdAdFail = null;
        };
        const rwdAdSuc = () => {
            this._onRwdAdSuc();
            this._onRwdAdSuc = this._onRwdAdFail = null;
        };
        rewardedAd.onError(err => {
            console.log("激励视频广告加载失败", err);
            rwdADFail();
            this._videoAd = null;
        });
        rewardedAd.onLoad(() => {
            console.log('激励视频广告加载完成-onload触发');
            if (autoplay) {
                rewardedAd.show();
                autoplay = false;
            }
        });
        rewardedAd.onClose((res) => {
            console.log('视频广告关闭回调');
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                console.log("正常播放结束，可以下发游戏奖励");
                rwdAdSuc();
            }
            else {
                // 播放中途退出，不下发游戏奖励
                console.log("播放中途退出，不下发游戏奖励");
                rwdAdCancel();
            }
        });
        this._videoAd = rewardedAd;
    }
    isOverMinVersion(minVersion) {
        let curVersion = this.sysInfo.SDKVersion;
        return this._compareVersion(curVersion, minVersion) >= 0;
    }
    /**
     * 确认平台准备完毕
     */
    checkPlatReady(onReady) {
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        });
        if (this.isOverMinVersion("1.9.90")) {
            const updateManager = wx.getUpdateManager();
            updateManager.onCheckForUpdate(function (res) {
                // 请求完新版本信息的回调
                console.log(res.hasUpdate);
            });
            updateManager.onUpdateReady(function () {
                wx.showModal({
                    title: '更新提示',
                    content: '新版本已经准备好，是否重启应用？',
                    success: function (res) {
                        if (res.confirm) {
                            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                            updateManager.applyUpdate();
                        }
                    }
                });
            });
            updateManager.onUpdateFailed(function () {
                // 新版本下载失败
            });
        }
        onReady("Release");
    }
    _compareVersion(v1, v2) {
        v1 = v1.split('.');
        v2 = v2.split('.');
        const len = Math.max(v1.length, v2.length);
        while (v1.length < len) {
            v1.push('0');
        }
        while (v2.length < len) {
            v2.push('0');
        }
        for (let i = 0; i < len; i++) {
            const num1 = parseInt(v1[i]);
            const num2 = parseInt(v2[i]);
            if (num1 > num2) {
                return 1;
            }
            else if (num1 < num2) {
                return -1;
            }
        }
        return 0;
    }
    get plat() {
        return GamePlat.wx;
    }
    get uma() {
        return wx.uma;
    }
}

class PlatWeb extends PlatBase {
    static getInstance() {
        if (!this._instance) {
            this._instance = new PlatWeb();
        }
        return this._instance;
    }
    get uma() {
        return {
            trackEvent(eventId, params) {
                console.log('[uma]trackEvent', eventId, params);
            },
        };
    }
    get plat() {
        return GamePlat.web;
    }
}

function hwlog(...args) {
    console.log("hwlog", ...args);
}
class PlatHW extends PlatBase {
    constructor() {
        super(...arguments);
        this._nextShowAd = 0;
        this._onRwdAdSuc = null;
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new PlatHW();
        }
        return this._instance;
    }
    showAD(onSuc, onNotSupport, posId) {
        this.showRewardAd({
            suc: () => {
                onSuc(true);
            },
            fail: () => {
                onSuc(false);
            },
            notSupport: () => {
                onNotSupport();
            },
            posId,
        });
    }
    showRewardAd(arg) {
        var _a, _b, _c;
        hwlog("showRewardAd", arg.posId);
        if (!this._CheckVersion(1075)) {
            (_a = arg.notSupport) === null || _a === void 0 ? void 0 : _a.call(arg);
            return;
        }
        if (this.curTime < this._nextShowAd) {
            (_b = arg.fail) === null || _b === void 0 ? void 0 : _b.call(arg, -1);
            this.popTip("广告拉取过于频繁");
            return;
        }
        this._nextShowAd = this.curTime + 3 * 1000;
        if (this._onRwdAdSuc != null) {
            (_c = arg.fail) === null || _c === void 0 ? void 0 : _c.call(arg, -1);
            hwlog("showAD cancel, last call not end.");
            return;
        }
        this._onRwdAdSuc = (isSuc, errcode) => {
            if (isSuc) {
                arg.suc();
            }
            else {
                arg === null || arg === void 0 ? void 0 : arg.fail(errcode);
            }
        };
        if (!this._rwdAd || this._lastRwdPosId != arg.posId) {
            this._initRewardedAd(arg.posId);
        }
        else {
            this._rwdAd.load();
        }
    }
    /** 登录 */
    login(onLogin, uid) {
        const param = {
            forceLogin: this.huaweiParam.forceLogin,
            appid: this.huaweiParam.appId,
            success: function (data) {
                // 登录成功后，可以存储帐号信息。             
                hwlog("login success", data);
                onLogin(0, data);
            },
            fail: function (data, code) {
                hwlog("login fail", data, code);
                onLogin(code, data);
            }
        };
        if (this._CheckVersion(1070)) {
            qg.gameLoginWithReal(param);
        }
        else {
            qg.gameLogin(param);
        }
    }
    /**
     * 确认平台准备完毕
     */
    checkPlatReady(onReady) {
        qg.getSystemInfo({
            success: (info) => {
                if (info.platformVersionCode) {
                    this._curPlatformVersionCode = info.platformVersionCode;
                }
                else {
                    this._curPlatformVersionCode = 1056;
                }
            },
            fail: () => {
                this._curPlatformVersionCode = 1056;
            },
            complete() {
                onReady("Release");
            }
        });
        // const update = qg.getUpdateManager()
        // update.onUpdateReady(function (data) {
        //     hwlog('onUpdateReady')
        //     qg.showDialog({
        //         title: '更新提示',
        //         message: '新版本已经准备好，是否重启应用？',
        //         success: function (data) {
        //             update.applyUpdate()//强制进行更新
        //         },
        //     })
        // })
        // update.onCheckForUpdate(function (data) {
        //     hwlog('onCheckForUpdate')
        // })
        // update.onUpdateFailed(function (data) {
        //     hwlog('onUpdateFailed')
        // })
    }
    showBannerAd(arg) {
        hwlog("showBannerAd", arg.pos, arg.pos);
    }
    hideBannerAd() {
        hwlog("hideBannerAd");
    }
    showInterstitialAd(arg) {
        hwlog("showInterstitialAd", arg);
    }
    vibrate(type) {
        if (type == "short") {
            qg.vibrateShort(); //（15 ms）
        }
        else {
            qg.vibrateLong(); //400 ms
        }
    }
    endGame() {
        qg.exitApplication({
            success: function () {
                hwlog("exitApplication success");
            },
            fail: function () {
                hwlog("exitApplication fail");
            },
            complete: function () {
                hwlog("exitApplication complete");
            }
        });
    }
    _initRewardedAd(posId) {
        if (this._rwdAd) {
            this._rwdAd = null;
        }
        const rewardedAd = qg.createRewardedVideoAd({
            adUnitId: posId,
        });
        const rwdADWaiting = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, false, -1);
            this._onRwdAdSuc = null;
        };
        const rwdAdFail = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, false, 0);
            this._onRwdAdSuc = null;
        };
        const rwdAdSuc = () => {
            var _a;
            (_a = this._onRwdAdSuc) === null || _a === void 0 ? void 0 : _a.call(this, true);
            this._onRwdAdSuc = null;
        };
        rewardedAd.offError();
        rewardedAd.offLoad();
        rewardedAd.offClose();
        rewardedAd.onError(err => {
            hwlog("激励视频广告加载失败 " + err.errCode + " " + err.errMsg);
            rwdADWaiting();
        });
        rewardedAd.onLoad(() => {
            hwlog('激励视频广告加载完成-onload触发');
            rewardedAd.show();
        });
        rewardedAd.onClose((res) => {
            hwlog('视频广告关闭回调');
            if (res && res.isEnded) {
                hwlog("正常播放结束，可以下发游戏奖励");
                rwdAdSuc();
            }
            else {
                hwlog("播放中途退出，不下发游戏奖励");
                rwdAdFail();
            }
        });
        rewardedAd.load();
        this._rwdAd = rewardedAd;
    }
    /**
     * 加载banner广告
     */
    _loadBannerAd(posId, pos) {
        hwlog("_loadBannerAd", posId);
    }
    /**
     * 加载插屏
     */
    _loadInterstitialAd(posId) {
        hwlog("_loadInterstitialAd", posId);
    }
    /**
     * 检查版本 >= version
     * @param version
     */
    _CheckVersion(version) {
        return this._curPlatformVersionCode >= version;
    }
    get plat() {
        return GamePlat.huawei;
    }
    get uma() {
        return qg.uma;
    }
}
PlatHW._instance = null;

function ttlog(...args) {
    console.log("ttLog", ...args);
}
class PlatTT extends PlatBase {
    constructor() {
        super(...arguments);
        this._onRwdAdSuc = null;
        this._ttRecordState = "idle";
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new PlatTT();
        }
        return this._instance;
    }
    get ttRecord() {
        if (!this._ttRecord) {
            this._ttRecord = tt.getGameRecorderManager();
            this._ttRecord.onStop((res) => {
                var _a;
                (_a = this._onTTRecordStop) === null || _a === void 0 ? void 0 : _a.call(this, res);
            });
        }
        return this._ttRecord;
    }
    showAD(onSuc, onNotSupport, posId) {
        this.showRewardAd({
            suc: () => {
                onSuc(true);
            },
            fail: () => {
                onSuc(false);
            },
            notSupport: () => {
                onNotSupport();
            },
            posId,
        });
    }
    showRewardAd(arg) {
        var _a, _b;
        if (this._onRwdAdSuc != null) {
            (_a = arg.fail) === null || _a === void 0 ? void 0 : _a.call(arg, -1);
            console.log("showAD cancel, last call not end.");
            return;
        }
        if (tt.canIUse("createRewardedVideoAd")) {
            this._onRwdAdSuc = (isSuc, errcode) => {
                this._onRwdAdSuc = null;
                if (isSuc) {
                    arg.suc();
                }
                else {
                    arg === null || arg === void 0 ? void 0 : arg.fail(errcode);
                }
            };
            if (!this._rwdAd) {
                this._rwdAd = tt.createRewardedVideoAd({
                    adUnitId: arg.posId,
                });
                this._rwdAd.onClose((res) => {
                    //这里监听广告的close 事件
                    if (res.isEnded) {
                        // do something
                        this._onRwdAdSuc(true);
                    }
                    else {
                        this._onRwdAdSuc(false, 0);
                    }
                });
            }
            this._rwdAd.show().catch(err => {
                ttlog("rwdErr 2", err);
                this._onRwdAdSuc(false, -1);
            });
        }
        else {
            (_b = arg.notSupport) === null || _b === void 0 ? void 0 : _b.call(arg);
        }
    }
    /**
     * 确认平台准备完毕
     */
    checkPlatReady(onReady) {
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
    vibrate(type) {
        if (type == "short") {
            tt.vibrateShort();
        }
        else {
            tt.vibrateLong();
        }
    }
    endGame() {
        tt.exitMiniProgram({
            isFullExit: true
        });
    }
    /**
     * 开始录屏
     */
    startRecord(options) {
        if (this._ttRecordState == "idle") {
            ttlog("startRecord");
            this.ttRecord.start(options);
            this._ttRecordState = "recording";
        }
        else {
            ttlog("startRecord fail, state:", this._ttRecordState);
        }
    }
    /**
     * 暂停录屏
     */
    pauseRecord() {
        if (this._ttRecordState != "recording") {
            ttlog("pauseRecord fail, state:", this._ttRecordState);
            return;
        }
        ttlog("pauseRecord");
        this.ttRecord.pause();
        this._ttRecordState = "paused";
    }
    /**
     * 恢复录屏
     */
    resumeRecord() {
        if (this._ttRecordState != "paused") {
            ttlog("resumeRecord fail, state:", this._ttRecordState);
            return;
        }
        ttlog("resumeRecord");
        this.ttRecord.resume();
        this._ttRecordState = "recording";
    }
    /**
     * 结束录屏
     */
    stopRecord(onStop) {
        if (this._ttRecordState != "recording" && this._ttRecordState != "paused") {
            ttlog("stopRecord fail, state:", this._ttRecordState);
            onStop("");
            return;
        }
        this._onTTRecordStop = (res) => {
            this._onTTRecordStop = null;
            ttlog("stopRecord res:", res);
            onStop(res);
        };
        ttlog("stopRecord");
        this.ttRecord.stop();
        this._ttRecordState = "idle";
    }
    /**
     * 分享录屏
     * @param options
     */
    shareRecord(options) {
        if (options.vidPath) {
            tt.shareAppMessage({
                channel: "video",
                extra: {
                    videoPath: options.vidPath,
                    hashtag_list: options.hashtag_list,
                }
            });
        }
    }
    get plat() {
        return GamePlat.tt;
    }
    get uma() {
        return tt.uma;
    }
}
PlatTT._instance = null;

class Plat {
    static get inst() {
        if (Plat.forceUsePlatBase)
            return Plat.forceUsePlatBase;
        if (Plat.forceUsePlatWeb)
            return PlatWeb.getInstance();
        if (DEV)
            return PlatWeb.getInstance();
        if (WECHAT) {
            return PlatWX.getInstance();
        }
        else if (NATIVE && sys.os === sys.OS.ANDROID) {
            return PlatAnd.getInstance();
        }
        else if (NATIVE && sys.os === sys.OS.IOS) {
            return PlatIOS.getInstance();
        }
        else if (VIVO) {
            return PlatVIVO.getInstance();
        }
        else if (XIAOMI) {
            return PlatMi.getInstance();
        }
        else if (OPPO) {
            return PlatOPPO.getInstance();
        }
        else if (HUAWEI) {
            return PlatHW.getInstance();
        }
        else if (BYTEDANCE) {
            return PlatTT.getInstance();
        }
        else {
            return PlatWeb.getInstance();
        }
    }
    static get isAndroid() {
        return NATIVE && sys.os === sys.OS.ANDROID;
    }
    static get isIos() {
        return NATIVE && sys.os === sys.OS.IOS;
    }
}
Plat.forceUsePlatWeb = false;
Plat.forceUsePlatBase = null;

export { AndLayoutGravity, Channel, GamePlat, Plat, PlatAnd, PlatBase, PlatHW, PlatIOS, PlatMi, PlatOPPO, PlatTT, PlatVIVO, PlatWX, PlatWeb };
