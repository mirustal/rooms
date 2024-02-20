import React, { useContext, useState } from "react";
import {
  View,
  Panel,
  Group,
  PanelHeader,
  PanelHeaderBack,
  CellButton,
  Div,
  PanelHeaderContent,
  PanelHeaderButton,
} from "@vkontakte/vkui";
import { ModalIds, Views } from "../../../model/views";
import ChannelView from "./ChannelView";
import { Icon16Dropdown, Icon24Add, Icon28AddOutline } from "@vkontakte/icons";
import AlterActionSheet from "./AlterActionSheet";
import { AlertManagerContext } from "../../contexts/AlertProvider";
import useAdminStatus from "./hooks/AdminStatus";
import { ModalManager } from "../../Modals";
import { Locales } from "../../../locales/locales";
import { roomOperation } from "./utils/roomOperation";
import { openBaseWithAction } from "../../Snackbar";
import { getVkUserId } from "../../../bridge/bridgeLib";

export default function Channels({ roomManager, returnBack }) {
  const [editModeActive, setEditModeActive] = useState(false);
  const userIsAdmin = useAdminStatus(roomManager.room);
  const alerts = useContext(AlertManagerContext);
  const roomOper = roomOperation(roomManager, alerts);
  const [channels, setChannels] = useState(roomManager.channels)
  const [snackbar, setSnackbar] = useState(null)
  const vkUserId = getVkUserId();
  const [contextOpened, setContextOpened] = React.useState(false);
  const toggleContext = () => {
    setContextOpened((prev) => !prev);
  };



  const toggleEditMode = () => {
    setEditModeActive(!editModeActive);
    openBaseWithAction(snackbar, setSnackbar, editModeActive);
  }

  const showModal = (modalId, props) => {
    ModalManager.showModal(modalId, props);
  };

  return roomManager.room ? (
    <View id={Views.Rooms.id} activePanel={Views.Rooms.panels.list.id}>
      <Panel id={Views.Rooms.panels.list.id}>
        <PanelHeader before={<PanelHeaderBack onClick={returnBack} />} after={
                <PanelHeaderButton>
                  <Icon28AddOutline />
                </PanelHeaderButton>
              }>
            <PanelHeaderContent
              aside={
                <Icon16Dropdown
                  style={{
                    transform: `rotate(${contextOpened ? '180deg' : '0'})`,
                  }}
                />
              }
              onClick={toggleContext}
            >
              {roomManager.room.name}
            </PanelHeaderContent>
        </PanelHeader>
        {AlterActionSheet({
              roomInfo:roomManager.room,
              returnBack:() => returnBack(),
              handleActiveEditMode: toggleEditMode,
              userIsAdmin:userIsAdmin,
              deleteMember: () => roomOper.deleteMember(vkUserId),
              deleteRoom: () => roomOper.deleteRoom(roomManager.room.id, returnBack),
              contextOpened: contextOpened,
              toggleContext: toggleContext
        })}
        <Group>
          {roomManager.room.channels.map((channel, index) => (
            <ChannelView
              key={channel.id}
              channelIndex={index}
              channel={channel}
              renameToChannel={() => showModal(ModalIds.RenameChannel, {
                renameChannelId: channel.id,
                renameChannel: roomOper.renameChannel,
              })}
              deleteToChannel={() => {roomOper.deleteChannel(channel.id);
                                      setChannels(roomManager.room.channels)
                    }}
              editModeActive={editModeActive}
              refreshChannel={() => roomOper.refreshChannel(channel.id)}
              userIsAdmin={userIsAdmin}
            />
          ))}
          {userIsAdmin && (
            <CellButton
              onClick={() => showModal(ModalIds.CreateChannel, {
                createChannel: roomOper.createChannel
              })
              }
              centered
              before={<Icon24Add />}
            >
              {Locales.Channels.CreateChannel}
            </CellButton>
          )}
        </Group>
        <>
        {snackbar}
        </>
      </Panel>
    </View>
  ) : null;
}

