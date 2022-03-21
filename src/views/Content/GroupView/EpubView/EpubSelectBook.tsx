import React from 'react';
import classNames from 'classnames';
import { action } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { format } from 'date-fns';
import { Popover, Tooltip } from '@mui/material';
import { ArrowDropDown } from '@mui/icons-material';

import BookContentIcon from 'boxicons/svg/regular/bx-book-content.svg?react';
import BookOpenIcon from 'boxicons/svg/regular/bx-book-open.svg?fill';

import { EpubBook, epubService } from '~/service/epub';
import { nodeService } from '~/service/node';


interface Props {
  className?: string
  onSelect?: (v: EpubBook) => unknown
  currentBookTrxId?: string
}

export const EpubSelectBook = observer((props: Props) => {
  const state = useLocalObservable(() => ({
    open: false,

    get books() {
      const item = epubService.state.bookMap.get(nodeService.state.activeGroupId);
      return item ?? [];
    },
  }));
  const buttonRef = React.useRef<HTMLDivElement>(null);

  const handleSelectFile = (v: EpubBook) => {
    props.onSelect?.(v);
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
      <BookContentIcon width="24" height="24" />
      <div
        className="flex flex-center border-b border-gray-33 pb-[3px] pl-1 text-16 cursor-pointer select-none"
        onClick={handleOpen}
      >
        切换书籍
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
            <div
              className="flex items-center gap-x-2 hover:bg-gray-f2 cursor-pointer p-2 relative"
              onClick={() => handleSelectFile(v)}
              key={i}
            >
              <div className="flex-col flex-1">
                <div>
                  {v.title}
                </div>
                <div className="text-gray-af">
                  上传于：{format(v.date, 'yyyy-MM-dd hh:mm:ss')}
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
          ))}
        </div>
      </div>
    </Popover>
  </>);
});