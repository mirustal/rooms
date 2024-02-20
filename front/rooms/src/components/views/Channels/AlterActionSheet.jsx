import React, { useContext } from "react";
import {
  Icon28DeleteOutline,
  Icon28DoorArrowRightOutline,
  Icon28EditOutline,
  Icon28ShareOutline,
} from "@vkontakte/icons";

import { PanelHeaderContext, SimpleCell } from "@vkontakte/vkui";
import {
  getFromStorage,
  pushToStorage,
  shareInviteLink,
} from "../../../bridge/bridgeLib";
import { Locales } from "../../../locales/locales";
import { VkStorageKeys } from "../../../bridge/storageKeys";
import {
  AlertManagerContext, AreYouShureAlert,
} from "../../contexts/AlertProvider";

function AlterActionSheet({ roomInfo, returnBack, handleActiveEditMode, userIsAdmin, deleteRoom, deleteMember, contextOpened, toggleContext }) {
  const alertManager = useContext(AlertManagerContext);

  const handleExitRoom = async () => {
    toggleContext()
    alertManager.showAlert(AreYouShureAlert({alertManager: alertManager, onYes: async () => {
      const idFromStorage = await getFromStorage(VkStorageKeys.JoinedRooms);
      const updatedString = idFromStorage.replace(new RegExp("," + roomInfo.id, 'g'), "");
      pushToStorage(VkStorageKeys.JoinedRooms, updatedString);
      returnBack();
      deleteMember();
    }, yesTitle: Locales.Alerts.Exit, noTitle: Locales.Alerts.Cancel, title: Locales.Alerts.ConfirmExitRoomTitle}))
  };

  const handleShareRoom = async () => {
    await shareInviteLink(roomInfo.id);
  };
 

  return (
    <PanelHeaderContext opened={contextOpened} onClose={toggleContext}>
      <SimpleCell
        before={<Icon28ShareOutline />}
        onClick={handleShareRoom}
        data-mode="all"
      >
        {Locales.ActionSheetName.ShareRoom}
      </SimpleCell>
      {userIsAdmin && (
        <SimpleCell
          before={<Icon28EditOutline />}
          onClick={handleActiveEditMode}
          data-mode="all"
        >
          {Locales.ActionSheetName.EditRoom}
        </SimpleCell>
      )}
      {
        userIsAdmin ? (
          <SimpleCell
            before={<Icon28DeleteOutline  fill="red"/>}
            onClick={() => {
              toggleContext();
              alertManager.showAlert(AreYouShureAlert(
                {alertManager: alertManager, 
                  onYes: () => {deleteRoom(); returnBack()},
                  yesTitle: Locales.Alerts.Delete, 
                  noTitle: Locales.Alerts.Cancel, 
                  title: Locales.Alerts.ConfirmDeleteRoomTitle}))}}
            
            data-mode="all"
          >
            {Locales.ActionSheetName.DeleteRoom}
          </SimpleCell>
        ) : (
          <SimpleCell
            before={<Icon28DoorArrowRightOutline />}
            onClick={handleExitRoom}
            data-mode="all"
          >
            {Locales.ActionSheetName.ExitRoom}
          </SimpleCell>
        )
      }
    </PanelHeaderContext>
  )
}

export default AlterActionSheet;
