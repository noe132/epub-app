import './processLock';
import './setupLog';
import './invokes';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import ElectronStore from 'electron-store';
import { initialize, enable } from '@electron/remote/main';

import { sleep } from './utils';
import { MenuBuilder } from './menu';
import { initQuorum } from './quorum';
import { createTray } from './tray';
import { initUpdate } from './updater';
import { appIcon } from './icon';
import { mainLang } from './lang';

initialize();

const isDevelopment = process.env.NODE_ENV === 'development';
// const isProduction = !isDevelopment;

const store = new ElectronStore();

const main = () => {
  const state = {
    win: null as null | BrowserWindow,
    canQuit: false,
  };
  ElectronStore.initRenderer();
  const createWindow = async () => {
    if (isDevelopment) {
      process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
      // wait 3 second for webpack to be up
      await sleep(3000);
    }

    state.win = new BrowserWindow({
      width: 1600,
      height: 900,
      minWidth: 768,
      minHeight: 780,
      icon: appIcon,
      webPreferences: {
        contextIsolation: false,
        // enableRemoteModule: true,
        nodeIntegration: true,
        webSecurity: !isDevelopment,
        webviewTag: true,
      },
    });

    enable(state.win.webContents);

    const port = process.env.PORT || 31521;
    if (isDevelopment) {
      state.win.loadURL(`http://localhost:${port}/index.html`);
    } else {
      state.win.loadFile('dist/index.html');
    }

    const menuBuilder = new MenuBuilder({
      win: state.win,
      prepareQuit,
    });
    menuBuilder.buildMenu();

    state.win.on('close', async (e) => {
      if (state.canQuit) {
        return;
      }
      e.preventDefault();
      state.win?.hide();
      if (process.platform === 'win32') {
        const notice = !store.get('not-notice-when-close');
        if (!notice) {
          return;
        }
        try {
          const res = await dialog.showMessageBox({
            type: 'info',
            buttons: [mainLang.lang.confirm],
            title: mainLang.lang.minimize,
            message: mainLang.lang.minimizeTip,
            checkboxLabel: mainLang.lang.dontShowAgain,
          });
          if (res?.checkboxChecked) {
            store.set('not-notice-when-close', true);
          }
        } catch {}
      }
    });

    sleep(3000).then(() => {
      initUpdate({
        setCanQuit: prepareQuit,
      });
    });
  };

  app.on('before-quit', (e) => {
    if (!state.canQuit) {
      e.preventDefault();
    }
  });

  app.on('window-all-closed', () => {});

  app.on('second-instance', () => {
    if (state.win) {
      if (!state.win.isVisible()) state.win.show();
      if (state.win.isMinimized()) state.win.restore();
      state.win.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      state.win?.show();
    }
  });

  try {
    initQuorum();
  } catch (err) {
    console.error('Quorum err: ');
    console.error(err);
  }

  ipcMain.on('inspect-picker', () => {
    const w = state.win as any;
    if (!w || !isDevelopment) {
      return;
    }
    if (w.webContents.isDevToolsOpened()) {
      w.devToolsWebContents.executeJavaScript('DevToolsAPI.enterInspectElementMode()');
    } else {
      w.webContents.once('devtools-opened', () => {
        w.devToolsWebContents.executeJavaScript('DevToolsAPI.enterInspectElementMode()');
      });
      w.openDevTools();
    }
  });

  const prepareQuit = () => {
    state.canQuit = true;
  };

  ipcMain.on('prepare-quit', prepareQuit);

  app.whenReady().then(() => {
    if (isDevelopment) {
      console.log('Starting main process...');
    }
    createWindow();
    if (process.platform !== 'darwin') {
      createTray({
        getWin: () => state.win,
        quit: () => {
          prepareQuit();
          app.quit();
        },
      });
    }
  });
};

if (app.hasSingleInstanceLock()) {
  main();
}

process.on('unhandledRejection', (reason, promise) => {
  console.log('unhandledRejection');
  console.log(reason);
  console.log(promise);
});
