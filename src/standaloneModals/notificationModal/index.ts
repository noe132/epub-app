import { modalService } from '../modal';
import type { InternalProps, Props } from './NotificationModal';

export const notificationModal = (props: Props) => {
  const item = modalService.createModal();
  const internalProps: InternalProps = {
    destroy: item.destoryModal,
  };
  item.addModal('notificationModal', {
    ...props,
    ...internalProps,
  });
};
