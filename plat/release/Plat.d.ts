interface UMA {
    /**
     * params为object类型时，属性值仅支持字符串和数值两种类型;
     * 请在App.onLaunch之后调用事件。
     * 参数eventId和事件标签都不能为null，也不能为空字符串"", 参数eventId长度不能超过128个字符，参数label长度不能超过256个字符。
     * 以下保留字段，不能作为event id 及key的名称：
     * id、ts、du、token、device_name、device_model 、device_brand、country、city、channel、province、appkey、app_version、access、launch、pre_app_version、terminate、no_first_pay、is_newpayer、first_pay_at、first_pay_level、first_pay_source、first_pay_user_level、first_pay_version、page、path、openid、unionid、scene
     * @param eventId 
     * @param params 
     */
    trackEvent(eventId: string, params: object | string)
    stage: {
        /**
         * 关卡开始
         * @param arg 参数
         * @param arg.stageId 关卡ID
         * @param arg.stageName 关卡名称
         */
        onStart(arg: {
            stageId: string,
            stageName: string,
        }): void;
        /**
         * 关卡结束
         * @param arg 参数
         * @param arg.stageId 关卡ID
         * @param arg.stageName 关卡名称
         * @param arg.event 关卡结束结果
         * @param arg._um_sdu 关卡耗时(毫秒)。友盟sdk会在根据本地关卡缓存数据，计算关卡的耗时自动上报；如果希望自己统计耗时，也可以自行统计上报，上报格式为数值型，单位为毫秒
         */
        onEnd(arg: {
            stageId: string
            stageName: string
            event: string
            _um_sdu?: number
        });
        /**
         * 关卡中的自定义事件
         * @param arg 参数
         * @param arg.stageId 关卡ID
         * @param arg.stageName 关卡名称
         * @param arg.event 自定义事件名称
         * @param arg.params 自定义事件参数
         * @param arg.params.itemName 道具名称
         * @param arg.params.itemId 道具ID
         * @param arg.params.itemCount 道具数量
         * @param arg.params.itemMoney 道具金额
         * @param arg.params.desc 自定义事件描述
         */
        onRunning(arg: {
            stageId: string,
            stageName: string,
            event: string,
            params: {
                itemName: string,
                itemId?: string,
                itemCount?: number,
                itemMoney?: number,
                desc?: string,
            }
        });
    },
    level: {
        /**
         * 初始化上报
         * @param levelId 等级id
         * @param levelName 等级名称
         */
        onInitLevel(levelId: string, levelName: number);
        /**
         * 升级
         * @param levelId 等级id
         * @param levelName 等级名称
         */
        onSetLevel(levelId: string, levelName: number);
    },
}
declare let qg: {
    uma: UMA
    [key: string]: any
}
declare let wx: {
    uma: UMA
    [key: string]: any
}
declare let tt: {
    uma: UMA
    [key: string]: any
}
declare interface Window {
    uma: UMA,
    channel: string,
    packageVersion: number,
}
// Generated by dts-bundle v0.7.3

declare module 'gnplat-cc' {
    import PlatAnd from "_____gnplat-cc/PlatAnd";
    import PlatBase, { AndLayoutGravity, Channel, GamePlat } from "_____gnplat-cc/PlatBase";
    import PlatIOS from "_____gnplat-cc/PlatIOS";
    import PlatMi from "_____gnplat-cc/PlatMi";
    import PlatOPPO from "_____gnplat-cc/PlatOPPO";
    import PlatVIVO from "_____gnplat-cc/PlatVIVO";
    import PlatWX from "_____gnplat-cc/PlatWX";
    import PlatWeb from "_____gnplat-cc/PlatWeb";
    import PlatHW from "_____gnplat-cc/PlatHW";
    import PlatTT from "_____gnplat-cc/PlatTT";
    class Plat {
        static forceUsePlatWeb: boolean;
        static forceUsePlatBase: PlatBase;
        static get inst(): PlatBase;
        static get isAndroid(): boolean;
        static get isIos(): boolean;
    }
    export { Plat, PlatAnd, PlatBase, PlatIOS, PlatMi, PlatOPPO, PlatVIVO, PlatWX, PlatWeb, PlatHW, PlatTT, GamePlat, Channel, AndLayoutGravity, };
}

declare module '_____gnplat-cc/PlatAnd' {
    import PlatBase, { ADCallback, AndLayoutGravity, Channel, GamePlat } from "_____gnplat-cc/PlatBase";
    export default class PlatAnd extends PlatBase {
        static getInstance(): PlatAnd;
        logCatch(...args: any[]): void;
        constructor();
        login(onLogin: Function, uid: string): void;
        showAD(onSuc: ADCallback, onNotSupport: Function, posId: string): void;
        showBannerAd(arg: {
            posId: string;
            pos: "top" | "bottom";
        }): void;
        hideBannerAd(): void;
        showTemplateAd(arg: {
            posId: string;
            onAdClose: (errcode?: number) => void;
            widthMode: "Dip" | "MatchParent" | "WrapContent";
            force: boolean;
            widthDp?: number;
            gravity?: AndLayoutGravity;
            debug?: boolean;
        }): void;
        hideTemplateAd(): void;
        showRewardAd(arg: {
            suc: () => void;
            fail?: (errcode: number) => void;
            notSupport?: () => void;
            posId: string;
        }): void;
        showInterstitialAd(arg: {
            posId: string;
            onAdClose?: (errcode?: number) => void;
        }): void;
        endGame(): void;
        enterGameCenter(): void;
        checkPlatReady(onReady: (env: "Debug" | "Release") => void): void;
        get plat(): GamePlat;
        get uma(): UMA;
        get channel(): Channel;
        get packageVersion(): number;
    }
}

declare module '_____gnplat-cc/PlatBase' {
    import { PlatHWParam } from "_____gnplat-cc/PlatHW";
    export type ADCallback = (isSuc: boolean) => void;
    export enum GamePlat {
        web = "web",
        wx = "wx",
        vivo = "vivo",
        oppo = "oppo",
        ios = "ios",
        and = "and",
        mi = "mi",
        huawei = "huawei",
        tt = "tt"
    }
    export enum Channel {
        Taptap = "Taptap",
        Oppo = "Oppo",
        Vivo = "Vivo",
        Mi = "Mi",
        YYB = "YYB",
        Default = "Default"
    }
    export enum AndLayoutGravity {
        Top = 1,
        Bottom = 2,
        Left = 4,
        Right = 8,
        CenterVertical = 16,
        CenterHorizontal = 32,
        Center = 48
    }
    export type Plat_ShareRecordOption = {
        vidPath?: string;
        hashtag_list?: Array<string>;
    };
    export default class PlatBase {
        protected popTip: (tip: string) => void;
        protected isLandsacpe: boolean;
        protected huaweiParam: PlatHWParam;
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
        init(option: {
            popTip: (tip: string) => void;
            isLandsacpe: boolean;
            AdCfg: any;
            usePlatWeb?: {
                [key in GamePlat]?: boolean;
            };
            replacePlat?: {
                [key in GamePlat]?: {
                    new(): PlatBase;
                };
            };
            huaweiParam?: PlatHWParam;
        }): void;
        /** 登录 */
        login(onLogin: Function, uid: string): void;
        /**
            * 屏幕震动
            * @param type 震动类型
            */
        vibrate(type: "long" | "short"): void;
        /**
            * @deprecated 准备废弃。推荐使用 showReawrdAd。
            * 广告展示
            * @param {ADCallback} onSuc
            * @param {Function} onNotSupport 当前平台不支持广告展示时调用
            * @param {String} posId - 广告位id。如不需要传null即可
            */
        showAD(onSuc: ADCallback, onNotSupport: () => void, posId: string): void;
        /**
            * 播放激励广告
            * @param arg 参数
            * @param arg.suc 播放成功回调
            * @param arg.fail 播放失败回调 errcode 0：广告播放中途退出 -1：广告加载中
            * @param arg.notSupport 平台不支持回调
            * @param arg.posId 广告位id。建议配置在 AdCfg 中，如不需要传null即可
            */
        showRewardAd(arg: {
            suc: () => void;
            fail?: (errcode: number) => void;
            notSupport?: () => void;
            posId: string;
        }): void;
        /**
            * 播放Banner广告
            * @param arg - 参数
            * @param arg.posId - 广告位id。建议配置在 AdCfg 中，如不需要传null即可
            * @param arg.pos - 广告位置
            * @param arg.wxArg - [可选] 微信平台参数
            * @param arg.wxArg.width - 广告条宽度,屏幕的百分比,取值范围0-1;
            * @param arg.wxArg.bottom - 广告条距离屏幕底部的高度,单位是像素;
            */
        showBannerAd(arg: {
            posId: string;
            pos: "top" | "bottom";
            wxArg?: {
                width: number;
                bottom: number;
            };
        }): void;
        /**
            * 隐藏当前的Banner广告
            */
        hideBannerAd(): void;
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
        showTemplateAd(arg: {
            posId: string;
            onAdClose: (errcode?: number) => void;
            widthMode: "Dip" | "MatchParent" | "WrapContent";
            force: boolean;
            widthDp?: number;
            gravity?: AndLayoutGravity;
            debug?: boolean;
        }): void;
        /**
            * 隐藏当前的Banner广告
            */
        hideTemplateAd(): void;
        /**
            * 播放插屏广告
            * @param arg - 参数
            * @param arg.posId - 广告位id。建议配置在 AdCfg 中，如不需要传null即可
            */
        showInterstitialAd(arg: {
            posId: string;
            onAdClose?: (errcode?: number) => void;
        }): void;
        /**
            * 退出游戏
            */
        endGame(): void;
        /**
            * 进入游戏中心
            */
        enterGameCenter(): void;
        /**
            * 设置加载页进度
            * @param {number} pro - progress 0-99 当前进度
            */
        setLoadingProgress(pro: number): void;
        /**
            * 隐藏游戏加载页面
            */
        loadingComplete(): void;
        /**
            * 确认平台准备完毕
            */
        checkPlatReady(onReady: (env: "Debug" | "Release") => void): void;
        /**
            * 开始录屏
            */
        startRecord(options: {
            duration?: number;
            isMarkOpen?: boolean;
            locTop?: number;
            locLeft?: number;
            frameRate?: number;
        }): void;
        /**
            * 暂停录屏
            */
        pauseRecord(): void;
        /**
            * 恢复录屏
            */
        resumeRecord(): void;
        /**
            * 结束录屏
            */
        stopRecord(onStop: (res: any) => void): void;
        /**
            * 分享录屏
            * @param options
            * @param {string} options.vidPath - 录屏的地址
            */
        shareRecord(options: Plat_ShareRecordOption): void;
        get uma(): UMA;
        protected get curTime(): number;
        get plat(): GamePlat;
        get channel(): Channel;
        /**
            * 包版本：一般是原生平台使用
            */
        get packageVersion(): number;
    }
}

declare module '_____gnplat-cc/PlatIOS' {
    import PlatBase, { ADCallback, GamePlat } from "_____gnplat-cc/PlatBase";
    export default class PlatIOS extends PlatBase {
        static getInstance(): any;
        logCatch(...args: any[]): void;
        constructor();
        login(onLogin: Function, uid: string): void;
        showAD(onSuc: ADCallback, onNotSupport: Function, posId: string): void;
        showBannerAd(arg: {
            posId: string;
            pos: "top" | "bottom";
        }): void;
        hideBannerAd(): void;
        showRewardAd(arg: {
            suc: () => void;
            fail?: (errcode: number) => void;
            notSupport?: () => void;
            posId: string;
        }): void;
        showInterstitialAd(arg: {
            posId: string;
        }): void;
        endGame(): void;
        enterGameCenter(): void;
        checkPlatReady(onReady: (env: "Debug" | "Release") => void): void;
        get plat(): GamePlat;
        get uma(): UMA;
        get packageVersion(): number;
    }
}

declare module '_____gnplat-cc/PlatMi' {
    import PlatBase, { ADCallback, GamePlat } from "_____gnplat-cc/PlatBase";
    export default class PlatMi extends PlatBase {
        static getInstance(): PlatMi;
        get sysInfo(): any;
        endGame(): void;
        showAD(onSuc: ADCallback, onNotSupport: Function, posId: string): void;
        showRewardAd(arg: {
            suc: () => void;
            fail?: (errcode: number) => void;
            notSupport?: () => void;
            posId: string;
        }): void;
        showBannerAd(arg: {
            posId: string;
            pos: "top" | "bottom";
            wxArg?: {
                width: number;
                bottom: number;
            };
        }): void;
        hideBannerAd(): void;
        /**
            * 确认平台准备完毕
            */
        checkPlatReady(onReady: (env: "Debug" | "Release") => void): void;
        showInterstitialAd(arg: {
            posId: string;
        }): void;
        get plat(): GamePlat;
        get uma(): UMA;
    }
}

declare module '_____gnplat-cc/PlatOPPO' {
    import PlatBase, { ADCallback, GamePlat } from "_____gnplat-cc/PlatBase";
    export default class PlatOPPO extends PlatBase {
        static getInstance(): PlatOPPO;
        showAD(onSuc: ADCallback, onNotSupport: Function, posId: string): void;
        showRewardAd(arg: {
            suc: () => void;
            fail?: (errcode: number) => void;
            notSupport?: () => void;
            posId: string;
        }): void;
        showBannerAd(arg: {
            posId: string;
            pos: "top" | "bottom";
            wxArg?: {
                width: number;
                bottom: number;
            };
        }): void;
        hideBannerAd(): void;
        showInterstitialAd(arg: {
            posId: string;
        }): void;
        vibrate(type: "long" | "short"): void;
        /**
            * 确认平台准备完毕
            */
        checkPlatReady(onReady: (env: "Debug" | "Release") => void): void;
        endGame(): void;
        setLoadingProgress(pro: number): void;
        loadingComplete(): void;
        get plat(): GamePlat;
    }
}

declare module '_____gnplat-cc/PlatVIVO' {
    import PlatBase, { ADCallback, GamePlat } from "_____gnplat-cc/PlatBase";
    export default class PlatVIVO extends PlatBase {
        static getInstance(): PlatVIVO;
        showAD(onSuc: ADCallback, onNotSupport: Function, posId: string): void;
        showRewardAd(arg: {
            suc: () => void;
            fail?: (errcode: number) => void;
            notSupport?: () => void;
            posId: string;
        }): void;
        /**
            * 确认平台准备完毕
            */
        checkPlatReady(onReady: (env: "Debug" | "Release") => void): void;
        showBannerAd(arg: {
            posId: string;
            pos: "top" | "bottom";
            wxArg?: {
                width: number;
                bottom: number;
            };
        }): void;
        hideBannerAd(): void;
        showInterstitialAd(arg: {
            posId: string;
        }): void;
        vibrate(type: "long" | "short"): void;
        endGame(): void;
        get plat(): GamePlat;
        get uma(): UMA;
    }
}

declare module '_____gnplat-cc/PlatWX' {
    import PlatBase, { ADCallback, GamePlat } from "_____gnplat-cc/PlatBase";
    export default class PlatWX extends PlatBase {
        static getInstance(): PlatWX;
        get sysInfo(): any;
        login(onLogin: Function, uid: string): void;
        showAD(onSuc: ADCallback, onNotSupport: Function, posId: string): void;
        showRewardAd(arg: {
            suc: () => void;
            fail?: (errcode: number) => void;
            notSupport?: () => void;
            posId: string;
        }): void;
        vibrate(type: "long" | "short"): void;
        isOverMinVersion(minVersion: string): boolean;
        /**
          * 确认平台准备完毕
          */
        checkPlatReady(onReady: (env: "Debug" | "Release") => void): void;
        get plat(): GamePlat;
        get uma(): UMA;
    }
}

declare module '_____gnplat-cc/PlatWeb' {
    import PlatBase, { GamePlat } from "_____gnplat-cc/PlatBase";
    export default class PlatWeb extends PlatBase {
        static getInstance(): any;
        get uma(): UMA;
        get plat(): GamePlat;
    }
}

declare module '_____gnplat-cc/PlatHW' {
    import PlatBase, { ADCallback, GamePlat } from "_____gnplat-cc/PlatBase";
    export type PlatHWParam = {
        appId: string;
        forceLogin: number;
    };
    export default class PlatHW extends PlatBase {
        static getInstance(): PlatHW;
        showAD(onSuc: ADCallback, onNotSupport: Function, posId: string): void;
        showRewardAd(arg: {
            suc: () => void;
            fail?: (errcode: number) => void;
            notSupport?: () => void;
            posId: string;
        }): void;
        /** 登录 */
        login(onLogin: Function, uid: string): void;
        /**
            * 确认平台准备完毕
            */
        checkPlatReady(onReady: (env: "Debug" | "Release") => void): void;
        showBannerAd(arg: {
            posId: string;
            pos: "top" | "bottom";
            wxArg?: {
                width: number;
                bottom: number;
            };
        }): void;
        hideBannerAd(): void;
        showInterstitialAd(arg: {
            posId: string;
        }): void;
        vibrate(type: "long" | "short"): void;
        endGame(): void;
        get plat(): GamePlat;
        get uma(): UMA;
    }
}

declare module '_____gnplat-cc/PlatTT' {
    import PlatBase, { ADCallback, GamePlat, Plat_ShareRecordOption } from "_____gnplat-cc/PlatBase";
    export default class PlatTT extends PlatBase {
        static getInstance(): PlatTT;
        showAD(onSuc: ADCallback, onNotSupport: Function, posId: string): void;
        showRewardAd(arg: {
            suc: () => void;
            fail?: (errcode: number) => void;
            notSupport?: () => void;
            posId: string;
        }): void;
        /**
            * 确认平台准备完毕
            */
        checkPlatReady(onReady: (env: "Debug" | "Release") => void): void;
        vibrate(type: "long" | "short"): void;
        endGame(): void;
        /**
            * 开始录屏
            */
        startRecord(options: {
            duration?: number;
            isMarkOpen?: boolean;
            locTop?: number;
            locLeft?: number;
            frameRate?: number;
        }): void;
        /**
            * 暂停录屏
            */
        pauseRecord(): void;
        /**
            * 恢复录屏
            */
        resumeRecord(): void;
        /**
            * 结束录屏
            */
        stopRecord(onStop: (res: any) => void): void;
        /**
            * 分享录屏
            * @param options
            */
        shareRecord(options: Plat_ShareRecordOption): void;
        get plat(): GamePlat;
        get uma(): UMA;
    }
}

