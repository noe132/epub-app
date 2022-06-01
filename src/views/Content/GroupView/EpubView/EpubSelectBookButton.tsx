
import React from 'react';
import classNames from 'classnames';
import { action } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { format } from 'date-fns';
import { Popover, Tooltip } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';
import BookOpenIcon from 'boxicons/svg/regular/bx-book-open.svg?fill';

import BookIcon from '~/assets/icon_book.svg?fill-icon';
import { BookCoverImgTooltip } from '~/components';
import { GroupBookItem, epubService, nodeService, readerSettingsService } from '~/service';


interface Props {
  className?: string
  onSelect?: (v: GroupBookItem) => unknown
  currentBookTrxId?: string
}

export const EpubSelectBookButton = observer((props: Props) => {
  const state = useLocalObservable(() => ({
    open: false,

    get groupItem() {
      return epubService.getGroupItem(nodeService.state.activeGroupId);
    },
    get books() {
      return this.groupItem.books;
    },
  }));
  const buttonRef = React.useRef<HTMLDivElement>(null);

  const handleSelectFile = (v: GroupBookItem) => {
    if (v.trxId !== props.currentBookTrxId) {
      props.onSelect?.(v);
    }
    handleClose();
  };

  const handleOpen = action(() => {
    state.open = true;
    loadBooks();
  });

  const handleClose = action(() => {
    state.open = false;
  });

  const loadBooks = async () => {
    // const books = await getAllEpubs(activeGroup.group_id);
    // runInAction(() => {
    //   state.books = books;
    // });
  };

  React.useEffect(() => {
    loadBooks();
  }, []);

  return (<>
    <div
      className={classNames(
        'flex items-center flex-none gap-x-2',
        props.className,
      )}
      ref={buttonRef}
    >
      <BookIcon
        className={classNames(
          'text-20',
          !readerSettingsService.state.dark && 'text-gray-88',
          readerSettingsService.state.dark && 'text-gray-af',
        )}
      />
      <div
        className={classNames(
          'flex flex-center border-b pb-[3px] pl-1 text-16 cursor-pointer select-none',
          !readerSettingsService.state.dark && 'text-gray-88 border-gray-88',
          readerSettingsService.state.dark && 'text-gray-af border-gray-af',
        )}
        onClick={handleOpen}
      >
        <span className="mr-2">切换书籍</span>
        <ArrowDropDown />
      </div>
    </div>

    <Popover
      classes={{ paper: 'mt-2' }}
      open={state.open}
      anchorEl={buttonRef.current}
      anchorOrigin={{
        horizontal: 'center',
        vertical: 'bottom',
      }}
      transformOrigin={{
        horizontal: 'center',
        vertical: 'top',
      }}
      onClose={handleClose}
      keepMounted
    >
      <div className="p-2 w-[350px]">
        <div className="overflow-y-auto max-h-[400px]">
          {!state.books.length && (
            <div className="flex flex-center py-2">
              暂无书籍
            </div>
          )}
          {state.books.map((v, i) => (
            <BookCoverImgTooltip
              groupId={nodeService.state.activeGroupId}
              bookTrx={v?.trxId ?? ''}
              key={i}
            >
              <div
                className="flex items-center gap-x-2 hover:bg-gray-f2 cursor-pointer p-2 relative"
                onClick={() => handleSelectFile(v)}
              >
                <div className="flex-col flex-1">
                  <div>
                    {v.fileInfo.title}
                  </div>
                  <div className="text-gray-af">
                    上传于：{format(v.time, 'yyyy-MM-dd hh:mm:ss')}
                  </div>
                </div>
                <Tooltip title="当前阅读">
                  <div
                    className={classNames(
                      'px-2',
                      v.trxId !== props.currentBookTrxId && 'opacity-0',
                    )}
                  >
                    <BookOpenIcon className="text-blue-400" />
                  </div>
                </Tooltip>
              </div>
            </BookCoverImgTooltip>
          ))}
        </div>
      </div>
    </Popover>
  </>);
});
