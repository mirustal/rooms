import { Views } from "../model/views";
import { Root } from "@vkontakte/vkui";
import Rooms from "./views/Rooms/Rooms";
import Channels from "./views/Channels/Channels";
import { useContext, useEffect, useState } from "react";
import {joinRoomOnStart, showAd } from "../bridge/bridgeLib";
import { RoomManager } from "./views/Rooms/RoomManager";
import { AlertManagerContext, ErrorAlert } from "./contexts/AlertProvider";
import { Locales } from "../locales/locales";




export default function Main() {
  const [activeView, setActiveView] = useState(Views.Servers.id);
  const [activeRoomInfo, setRoomInfo] = useState(null);
  const alertsManager = useContext(AlertManagerContext)

  const handleUpdateRoom = (updateRoom) => {
    setRoomInfo(updateRoom)
  }

  const enterRoom = function (roomInfo) {
    if (!roomInfo.members){
      alertsManager.showAlert(ErrorAlert({message: Locales.Errors.FailedEnterRoom, alertManager: alertsManager}))
      return
    }
    showAd();
    handleUpdateRoom(roomInfo);
    setActiveView(Views.Rooms.id);
  };


  useEffect(() => {
    if (joinRoomOnStart !== undefined)
      enterRoom(joinRoomOnStart)
  }, []);

  return (
    <Root activeView={activeView}>
      <Rooms id={Views.Servers.id} enterRoom={enterRoom}/>
      <Channels
        id={Views.Rooms.id}
        roomManager= {new RoomManager(activeRoomInfo, handleUpdateRoom)}
        returnBack={() => setActiveView(Views.Servers.id)}
      />
    </Root>
  );
}
