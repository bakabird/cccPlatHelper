
import { BuildPlugin, IBuildResult, IBuildTaskOption, ISettings } from '../@types';


export const load: BuildPlugin.load = function () {
    console.debug('cocos-build-template load');
};

export const unload: BuildPlugin.load = function () {
    console.debug('cocos-build-template unload');
};

export enum GameEnv {
    Taptap = "Taptap",
    Oppo = "Oppo",
    Vivo = "Vivo",
    Mi = "Mi",
    YYB = "YYB",
}

interface IPluginExportOptions {
    platform: string
}

export namespace PlatHelp {
    export interface IOptions {
        umEnable: boolean,
        umId: string,
        umDebug: boolean,
        umUseOpenId: boolean,

        BR_BELOW_AND: string,
        and_enable: boolean,
        and_env: GameEnv;
        and_enableAd: boolean,
        PROTOCOL_URL: string,
        PRIVATE_URL: string,
        OPPO_APP_ID: string,
        OPPO_APP_KEY: string,
        OPPO_APP_SECRET: string,
        MI_APP_ID: string,
        MI_APP_KEY: string,
        MI_APP_NAME: string,
        CSJ_APP_ID: string,
        CSJ_APP_NAME: string,
        TAPTAP_CLIENT_ID: string,
        CSJ_BANNER_WIDTH: string,
        CSJ_BANNER_HEIGHT: string,
        VIVO_APP_ID: string,
        VIVO_AD_MEDIA_ID: string,
    }
    export interface ITaskOptions extends IBuildTaskOption {
        packages: {
            'plat-helper': IOptions;
            'build-plugin-exportconfig': IPluginExportOptions;
            android: {
                orientation: {
                    portrait: boolean,
                    upsideDown: boolean,
                    landscapeRight: boolean,
                    landscapeLeft: boolean,
                }
            }
        };
    }
    interface _ISettings extends ISettings {
        screen: {
            designResolution: {
                height: number,
                width: number,
            }
        }
    }
    export interface IResult extends IBuildResult {
        settings?: _ISettings,
    }
}

export function checkAndEnable(option: PlatHelp.ITaskOptions) {
    return option.platform == "android" && option.packages['plat-helper'].and_enable
}

const verify_rule_map = {
    ruleOppo: {
        message: 'Oppo环境下必填，非Oppo环境下必须为空',
        func(val: any, option: PlatHelp.ITaskOptions) {
            if (!checkAndEnable(option)) return true
            if (typeof val != "string") return false;
            const curEnv = option.packages['plat-helper'].and_env
            return (curEnv == GameEnv.Oppo && val != "") ||
                (curEnv != GameEnv.Oppo && val == "");
        }
    },
    ruleMi: {
        message: 'Mi环境下必填，非Mi环境下必须为空',
        func(val: any, option: PlatHelp.ITaskOptions) {
            if (!checkAndEnable(option)) return true
            if (typeof val != "string") return false;
            const curEnv = option.packages['plat-helper'].and_env
            return (curEnv == GameEnv.Mi && val != "") ||
                (curEnv != GameEnv.Mi && val == "");
        }
    },
    ruleTapTap: {
        message: 'Taptap环境下必填，非Taptap环境下必须为空',
        func(val: any, option: PlatHelp.ITaskOptions) {
            if (!checkAndEnable(option)) return true
            if (typeof val != "string") return false;
            const curEnv = option.packages['plat-helper'].and_env
            return (curEnv == GameEnv.Taptap && val != "") ||
                (curEnv != GameEnv.Taptap && val == "");
        }
    },
    ruleVivo: {
        message: 'Vivo环境下必填，非Vivo环境下必须为空',
        func(val: any, option: PlatHelp.ITaskOptions) {
            if (!checkAndEnable(option)) return true
            if (typeof val != "string") return false;
            const curEnv = option.packages['plat-helper'].and_env
            return (curEnv == GameEnv.Vivo && val != "") ||
                (curEnv != GameEnv.Vivo && val == "");
        }
    },
    ruleYYb: {
        message: '应用宝环境下必填，非应用宝环境下必须为空',
        func(val: any, option: PlatHelp.ITaskOptions) {
            if (!checkAndEnable(option)) return true
            if (typeof val != "string") return false;
            const curEnv = option.packages['plat-helper'].and_env
            return (curEnv == GameEnv.YYB && val != "") ||
                (curEnv != GameEnv.YYB && val == "");
        }
    },
    ruleAndEnable: {
        message: '必须填写',
        func(val: any, option: PlatHelp.ITaskOptions) {
            if (!checkAndEnable(option)) return true
            return typeof val == "string" && val != "";
        }
    },
}


function produceVariable(key: string, rule: string) {
    return {
        label: key,
        description: verify_rule_map[rule].message,
        default: '',
        render: {
            ui: "ui-input",
        },
        verifyRules: [rule]
    }
}


// CSJ_APP_ID="5342222"
// CSJ_APP_NAME="ZEROSS"
// TAPTAP_CLIENT_ID="12321"
const plat_option = {
    umEnable: {
        label: '[友盟]启用',
        default: false,
        render: {
            ui: 'ui-checkbox',
        },
    },
    umId: {
        label: '[友盟]友盟id',
        default: "",
        render: {
            ui: 'ui-input',
        },
    },
    umDebug: {
        label: '[友盟]调试模式',
        default: false,
        render: {
            ui: 'ui-checkbox',
        },
    },
    umUseOpenId: {
        label: '[友盟]是否使用openId模式',
        default: false,
        render: {
            ui: 'ui-checkbox',
        },
    },
    BR_BELOW_AND: {
        label: "· · · · · · ·",
        default: "<---下面参数仅在打安卓包时生效--->",
        render: {
            ui: 'ui-input',
            attributes: {
                disabled: true,
            },
        },
    },
    and_enable: {
        label: "[安卓]启用",
        default: false,
        render: {
            ui: "ui-checkbox",
        },
    },
    and_env: {
        label: "环境",
        render: {
            ui: "ui-select",
            attributes: {
                placeholder: "选择对应环境",
            },
            items: [
                GameEnv.Taptap, GameEnv.Oppo, GameEnv.Mi,
                GameEnv.Vivo, GameEnv.YYB,
            ].map(e => ({
                value: e,
                label: e,
            }))
        }
    },
    and_enableAd: {
        label: "开启广告",
        description: "目前仅应用宝可关闭广告。",
        default: true,
        render: {
            ui: "ui-checkbox",
        },
    },
    PROTOCOL_URL: {
        label: "用户协议URL",
        default: '',
        render: {
            ui: "ui-input",
        },
        verifyRules: ["ruleAndEnable"]
    },
    PRIVATE_URL: {
        label: "隐私声明URL",
        default: '',
        render: {
            ui: "ui-input",
        },
        verifyRules: ["ruleAndEnable"]
    },
    /**
     * OPPO 配置
     */
    OPPO_APP_ID: produceVariable("OPPO_APP_ID", "ruleOppo"),
    OPPO_APP_KEY: produceVariable("OPPO_APP_KEY", "ruleOppo"),
    OPPO_APP_SECRET: produceVariable("OPPO_APP_SECRET", "ruleOppo"),
    /**
     * MI 配置
     */
    MI_APP_ID: produceVariable("MI_APP_ID", "ruleMi"),
    MI_APP_KEY: produceVariable("MI_APP_KEY", "ruleMi"),
    MI_APP_NAME: produceVariable("MI_APP_NAME", "ruleMi"),
    /**
     * TAPTAP 配置
     */
    TAPTAP_CLIENT_ID: produceVariable("TAPTAP_CLIENT_ID", "ruleTapTap"),
    CSJ_APP_ID: produceVariable("穿山甲APP_ID(taptap必填)", "ruleTapTap"),
    CSJ_APP_NAME: produceVariable("穿山甲APP_NAME(taptap必填)", "ruleTapTap"),
    CSJ_BANNER_WIDTH: produceVariable("穿山甲Banner宽度(taptap必填)", "ruleTapTap"),
    CSJ_BANNER_HEIGHT: produceVariable("穿山甲Banner高度(taptap必填)", "ruleTapTap"),
    /**
     * VIVO 配置
     */
    VIVO_APP_ID: produceVariable("VIVO_APP_ID", "ruleVivo"),
    VIVO_AD_MEDIA_ID: produceVariable("VIVO_AD_MEDIA_ID", "ruleVivo"),
};

export const configs: BuildPlugin.Configs = {
    '*': {
        hooks: './hooks',
        options: plat_option,
        verifyRuleMap: verify_rule_map,
    },
};

export const assetHandlers: BuildPlugin.AssetHandlers = './asset-handlers';
