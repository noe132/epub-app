import { modalService } from '../modal';
import { InternalProps, Props } from './QuoteDetail';

export const quoteDetail = (props: Props) => {
  const item = modalService.createModal();
  const internalProps: InternalProps = {
    destroy: item.destoryModal,
  };
  item.addModal('quoteDetail', {
    ...props,
    ...internalProps,
  });
};
