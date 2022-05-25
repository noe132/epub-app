import { nodeService } from './node';
import { quorumService } from './quorum';
import { epubService } from './epub';
import { readerSettingsService } from './readerSettings';
import { updateService } from './update';
import { trxAckService } from './trxAck';
import { profileService } from './profile';
import { escService } from './esc';

export * from './bus';
export * from './db';
export * from './dialog';
export * from './epub';
export * from './esc';
export * from './i18n';
export * from './loading';
export * from './node';
export * from './profile';
export * from './quorum';
export * from './readerSettings';
export * from './tooltip';
export * from './trxAck';
export * from './update';

export const initService = () => {
  if (process.env.NODE_ENV === 'development') {
    Object.entries({
      nodeService,
      quorumService,
      epubService,
      updateService,
    }).forEach(([k, v]) => {
      (window as any)[k] = v;
    });
  }

  const disposes = [
    nodeService.init(),
    quorumService.init(),
    readerSettingsService.init(),
    epubService.init(),
    updateService.init(),
    trxAckService.init(),
    escService.init(),
  ];

  return () => disposes.forEach((v) => v());
};

export const initServiceAfterDB = () => {
  const disposes = [
    profileService.init(),
  ];

  return () => disposes.forEach((v) => v());
};
