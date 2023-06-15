import { action } from 'mobx';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { Dialog } from '@mui/material';

import { i18n, nodeService } from '~/service';
import { lang, ago } from '~/utils';

export interface Props {
  groupId: string
}

export const GroupInfo = observer((props: { destroy: () => unknown } & Props) => {
  const state = useLocalObservable(() => ({
    loading: true,
    open: true,
    owner: {} as any,
  }));

  const group = nodeService.state.groupMap[props.groupId];

  // const database = useDatabase();
  // const { activeGroupStore } = useStore();

  const handleClose = action(() => {
    state.open = false;
    setTimeout(action(() => {
      props.destroy();
    }), 2000);
  });

  // const status = {
  //   [GroupStatus.IDLE]: lang.group.idle,
  //   [GroupStatus.SYNCING]: lang.group.syncing,
  //   [GroupStatus.SYNC_FAILED]: lang.group.syncFailed,
  // };
  const width = i18n.state.lang === 'cn' ? 'w-20' : 'w-32';

  // React.useEffect(() => {
  //   (async () => {
  //     const db = database;
  //     const user = await PersonModel.getUser(db, {
  //       GroupId: group?.group_id,
  //       Publisher: group?.owner_pubkey,
  //     });
  //     state.owner = user;
  //     state.loading = false;
  //   })();
  // }, []);

  // const goToUserPage = async (publisher: string) => {
  //   handleClose();
  //   await sleep(300);
  //   activeGroupStore.setObjectsFilter({
  //     type: ObjectsFilterType.SOMEONE,
  //     publisher,
  //   });
  // };

  return (
    <Dialog
      open={state.open}
      onClose={handleClose}
    >
      <div className="bg-white rounded-0 p-6">
        <div className="pt-2 px-6 pb-5">
          <div className="text-18 font-bold text-gray-700 text-center pb-5">
            {lang.group.groupInfo}
          </div>
          <div className="p-6 text-gray-88 text-13 border border-gray-d8 rounded-0 shadow">
            <div className="flex items-center">
              <span className={width}>{lang.group.name}:&nbsp;</span>
              <span className="text-gray-4a opacity-90">
                {group?.group_name}
              </span>
            </div>
            <div className="mt-4 flex items-center">
              <span className={width}>ID:&nbsp;</span>
              <span className="text-gray-4a opacity-90">
                {group?.group_id}
              </span>
            </div>
            <div className="mt-4 flex items-center">
              <span className={width}>{lang.group.owner}:&nbsp;</span>
              <div className="text-gray-4a opacity-90">
                {group?.owner_pubkey}
              </div>
            </div>
            {/* <div className="mt-4 flex items-center">
              <span className={width}>{lang.group.highestBlockId}:&nbsp;</span>
              <span className="text-gray-4a opacity-90">
                {group?.currt_top_block}
              </span>
            </div> */}
            {/* <div className="mt-4 flex items-center">
              <span className={width}>{lang.owner}:&nbsp;</span>
              {!state.loading && (
                <div
                  className="opacity-90 cursor-pointer text-blue-500"
                  onClick={() => {
                    goToUserPage(state.owner.publisher);
                  }}
                >
                  {state.owner.profile.name}
                </div>
              )}
            </div> */}
            <div className="mt-4 flex items-center">
              <span className={width}>{lang.group.highestHeight}:&nbsp;</span>
              <span className="text-gray-4a opacity-90">
                {group?.currt_top_block}
              </span>
            </div>
            <div className="mt-4 flex items-center">
              <span className={width}>{lang.group.lastUpdated}:&nbsp;</span>
              <span className="text-gray-4a opacity-90">
                {ago(group?.last_updated ?? 0)}
              </span>
            </div>
            {/* TODO: group status */}
            {/* <div className="mt-4 flex items-center">
              <span className={width}>{lang.group.status}:&nbsp;</span>
              <span className="text-gray-4a opacity-90">
                <Tooltip title={group?.group_status} placement="right">
                  <span>
                    {status[group?.group_status]}
                  </span>
                </Tooltip>
              </span>
            </div> */}
          </div>
        </div>
      </div>
    </Dialog>
  );
});
