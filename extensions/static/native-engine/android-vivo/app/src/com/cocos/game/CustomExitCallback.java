package com.cocos.game;

import com.vivo.unionsdk.open.VivoExitCallback;

public class CustomExitCallback implements VivoExitCallback {
    @Override
    public void onExitCancel() {

    }

    @Override
    public void onExitConfirm() {
        AppActivity.doRunOnUiThread(()-> {
            android.os.Process.killProcess(android.os.Process.myPid());
        });
    }
}
