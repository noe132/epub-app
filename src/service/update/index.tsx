import React from 'react';
import { action, observable } from 'mobx';
import { ipcRenderer, IpcRendererEvent } from 'electron';
import type { ProgressInfo, UpdateInfo } from 'electron-updater';
import { lang } from '~/utils';
import { dialogService } from '~/service/dialog';
import { tooltipService } from '~/service/tooltip';

const state = observable({
  manuallyChecking: false,
  updating: false,
  progress: null as null | ProgressInfo,
  updateDownloadedOpen: false,
});

const actions: any = {
  'update-not-available': action((_data: UpdateInfo) => {
    if (state.manuallyChecking) {
      tooltipService.show({
        content: lang.update.alreadyLatestVersion,
      });
    }
    state.manuallyChecking = false;
  }),
  'update-available': action((_data: UpdateInfo) => {
    state.manuallyChecking = false;
  }),
  'error': (_err: Error) => {

  },
  'download-progress': action((progress: ProgressInfo) => {
    state.progress = progress;
  }),
  'update-downloaded': async (data: UpdateInfo) => {
    if (state.updateDownloadedOpen) { return; }
    state.updateDownloadedOpen = true;
    const releaseNotes = typeof data.releaseNotes === 'string'
      ? data.releaseNotes
      : '';
    const result = await dialogService.open({
      content: (
        <div className="min-w-[224px]">
          <div className="font-bold text-16 pr-5">
            {lang.update.newVersionPublished(data.version)}
          </div>
          {releaseNotes && (
            <div className="pl-2 pr-2 pt-4 text-13 leading-normal">
              {releaseNotes.split(';').map((v, i) => (
                <p className="mt-2" key={i}>
                  {v}
                </p>
              ))}
            </div>
          )}
        </div>
      ),
      confirm: lang.update.reloadForUpdate,
      cancel: lang.update.doItLater,
    });
    state.updateDownloadedOpen = false;
    if (result === 'confirm') {
      ipcRenderer.send('rum-updater', {
        action: 'install',
      });
    }
  },
};

const init = () => {
  const handleUpdate = (_e: IpcRendererEvent, a: any) => {
    const { type, data } = a;
    if (type in actions) {
      actions[type](data);
    }
  };
  ipcRenderer.on('rum-updater', handleUpdate);

  return () => {
    ipcRenderer.off('rum-updater', handleUpdate);
  };
};

const checkUpdate = action(() => {
  if (process.env.NODE_ENV === 'development') {
    return;
  }
  state.manuallyChecking = true;
  ipcRenderer.send('rum-updater', {
    action: 'update',
  });
});

export const updateService = {
  state,
  init,

  checkUpdate,
};
