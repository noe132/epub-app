import React from 'react';
import classNames from 'classnames';
import { action } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { NavItem } from 'epubjs';
import scrollIntoView from 'scroll-into-view-if-needed';
import { Divider, MenuItem, Popover, Tooltip } from '@mui/material';
import ListUlIcon from 'boxicons/svg/regular/bx-list-ul.svg?react';

interface Props {
  className?: string
  chapters: Array<NavItem>
  current: string
  onChapterClick?: (href: string) => unknown
}

export const EpubChaptersButton = observer((props: Props) => {
  const state = useLocalObservable(() => ({
    open: false,
  }));
  const buttonRef = React.useRef<HTMLDivElement>(null);

  const handleChapterClick = (href: string) => {
    props.onChapterClick?.(href);
    handleClose();
  };

  const handleClose = action(() => {
    state.open = false;
  });

  return (<>
    <Tooltip title="章节选择">
      <div
        className={classNames(
          'cursor-pointer',
          props.className,
        )}
        onClick={action(() => { state.open = true; })}
        ref={buttonRef}
      >
        <ListUlIcon
          width="28"
          height="28"
        />
      </div>
    </Tooltip>

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
      <div
        className="max-w-[600px] min-w-[250px]"
        style={{ maxHeight: `${Math.max(300, window.innerHeight - 300)}px` }}
      >
        <div className="flex flex-center text-20 text-gray-70 py-4">
          目录
        </div>
        {!!props.chapters.length && (
          <Divider className="!my-0 mx-4" />
        )}
        <EpubChapters
          open={state.open}
          chapters={props.chapters}
          current={props.current}
          onClick={handleChapterClick}
        />
        <div className="h-4" />
      </div>
    </Popover>
  </>);
});

interface EpubChaptersProps {
  className?: string
  chapters: Array<NavItem>
  open?: boolean
  current?: string
  onClick?: (href: string) => unknown
  inner?: boolean
  level?: number
  nonRoot?: boolean
}

const EpubChapters = (props: EpubChaptersProps) => {
  const rootBox = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (props.inner || !props.open) {
      return;
    }
    const current = rootBox.current!.querySelector('.current-chapter');
    if (!current) {
      return;
    }
    scrollIntoView(current, {
      scrollMode: 'if-needed',
    });
  }, [props.open]);

  return (
    <div
      className={classNames(props.className)}
      ref={rootBox}
    >
      {!props.chapters.length && !props.nonRoot && (
        <MenuItem className="">
          暂无章节
        </MenuItem>
      )}
      {props.chapters.map((v) => {
        const isCurrent = props.current === v.href.replace(/#.*/, '');
        return (
          <div key={v.id}>
            <MenuItem
              className={classNames(
                'pr-4 py-2 text-producer-blue',
                isCurrent && 'current-chapter font-bold',
                !isCurrent && 'text-gray-88',
              )}
              style={{
                paddingLeft: `${(props.level ?? 0) * 20 + 20}px`,
              }}
              onClick={() => props.onClick?.(v.href)}
            >
              <span className="truncate">
                {v.label.trim()}
              </span>
            </MenuItem>
            <Divider className="!my-0 mx-4" />
            {!!v.subitems && (
              <EpubChapters
                onClick={props.onClick}
                current={props.current}
                chapters={v.subitems}
                inner
                level={(props.level ?? 0) + 1}
                nonRoot
              />
            )}
          </div>
        );
      })}
    </div>
  );
};