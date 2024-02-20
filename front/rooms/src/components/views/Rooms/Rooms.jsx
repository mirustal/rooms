import {
  View,
  Panel,
  PanelHeader,
  Group,
  Header,
  IconButton,
  Input,
  Badge,
  PullToRefresh,
  List,
  ScreenSpinner,
  Tabbar,
  TabbarItem,
  CellButton,
  Div,
  Headline,
  Tooltip,
  Alert,
  Search,
  Title,
  Separator,
  Caption,
} from "@vkontakte/vkui";
import { ModalIds, Views } from "../../../model/views";
import { Locales } from "../../../locales/locales";
import {
  Icon16Search,
  Icon16CancelCircle,
  Icon28AddOutline,
  Icon28Users3Outline,
} from "@vkontakte/icons";
import React, { useContext, useEffect, useState } from "react";
import {
  getJoinedRoomInfos,
  joinRoom,
  createRoom,
} from "../../../serverApi/serverApi";
import RoomView from "./RoomView";
import { ModalManager } from "../../Modals";
import { AlertManagerContext, ErrorAlert } from "../../contexts/AlertProvider";
import { showAd } from "../../../bridge/bridgeLib";

export default function Rooms({ enterRoom, userIsAdmin}) {
  const [isFirstFetching, setFirstFetching] = useState(true);
  const [isFetching, setFetching] = useState(false);
  const [roomInfos, setRoomInfos] = useState([]);
  const [favRoomInfos, setFavRoomInfos] = useState([]);
  const alerts = useContext(AlertManagerContext);
  const [searchValue, setSearchValue] = useState("");

  const filterRooms = (rooms, searchValue) => {
    return rooms.filter(room => room.name.toLowerCase().includes(searchValue.toLowerCase()));
  };
  

  const onRefresh = React.useCallback(async () => {
    setFetching(true);
    await getJoinedRoomInfos().then((val) => {
      let newInfos =  [...val]
      newInfos = newInfos.sort((a,b) => a.isFavourite > b.isFavourite)
      setRoomInfos(newInfos)
      updateFavRooms(newInfos)
    });
    setFetching(false);
  }, []);

  useEffect(() => {
    onRefresh().then(() => setFirstFetching(false));
  }, []);

  const updateRooms = () => {
    setRoomInfos([...roomInfos])
    updateFavRooms(roomInfos)
  }

  const updateFavRooms = (infos) => {
    let newFavInfos = [...infos]
    console.log(newFavInfos)
    newFavInfos = newFavInfos.filter(x => x.isFavourite)
    console.log(newFavInfos)
    setFavRoomInfos(newFavInfos)
  }

  const joinRoomData = {
    loadRoom: function (id) {
      setFetching(true);
      joinRoom(id)
        .then((room) => {
          enterRoom(room);
          setFetching(false);
        })
        .catch((error) => {
          setFetching(false);
          alerts.showAlert(
            ErrorAlert({
              message: Locales.Errors.FailedJoinRoom,
              alertManager: alerts,
            })
          );
        });
    },
  };

  const createRoomData = {
    loadRoom: function (newRoom) {
      setFetching(true);
      createRoom(newRoom)
        .then((room) => {
          joinRoomData.loadRoom(room.id);
        })
        .catch((error) => {
          setFetching(false);
          alerts.showAlert(
            ErrorAlert({
              message: Locales.Errors.FailedCreateRoom,
              alertManager: alerts,
            })
          );
        });
      showAd(true);
    },
  };

  return (
    <View id={Views.Servers.id} activePanel={Views.Servers.panels.list.id}>
      <Panel id={Views.Servers.panels.list.id}>
        <PanelHeader>{Locales.AppName}</PanelHeader>
        {isFirstFetching && <ScreenSpinner></ScreenSpinner>}
        <PullToRefresh onRefresh={onRefresh} isFetching={isFetching}>
          {roomInfos.length > 0 ? (
            <Group style={{ paddingBottom: "40px"}} >
              <Search
                before={<Icon16Search />}
                placeholder="поиск комнаты"
                onChange={(e) => setSearchValue(e.target.value)}
                after={
                  <IconButton>
                    <Icon16CancelCircle />
                  </IconButton>
                }
                style={{
                  marginRight: 10,
                  marginLeft: 20,
                }}
              />
              {
                favRoomInfos.length > 0 ? (
                  <>
                  <Title level="3" style={{ marginBottom: 16, marginTop: 15, textAlign: "center" }}>
                  {Locales.Rooms.Favourite}
                  </Title>
                  <List>
              {
                filterRooms(roomInfos, searchValue).length > 0 ?
                  filterRooms(roomInfos, searchValue).map((x) => (
                  <RoomView
                      info={x}
                      key={x.id}
                      enterRoom={() => enterRoom(x)}
                      searchValue={searchValue}
                      updateRooms={updateRooms}
                      />
                      )) :
                      <Div style={{ textAlign: "center" }}>{Locales.Rooms.NoFavouritesFound}</Div>
                  }
                </List>
              <br></br>
              <Separator></Separator>
              <br></br>
              </>
                ) : (<></>)
              }
              <List>
              {
              filterRooms(roomInfos, searchValue).length > 0 ?
              filterRooms(roomInfos, searchValue).map((x) => (
              <RoomView
                      info={x}
                      key={x.id}
                      enterRoom={() => enterRoom(x)}
                      searchValue={searchValue}
                      updateRooms={updateRooms}
                      />
                      )) :
                      <Header
                      level="1"
                      weight="1"
                      style={{ textAlign: "center", marginTop: 30 }}
                    >
                      {Locales.Rooms.RoomsListIsEmpty}
                    </Header>
                  }
              </List>
            </Group>
          ) : (
            <Headline
              level="1"
              weight="1"
              style={{ textAlign: "center", marginTop: 30 }}
            >
              {Locales.Rooms.RoomsListIsEmpty}
            </Headline>
          )}
        </PullToRefresh>
        
        <Tabbar>
          <TabbarItem
            indicator={roomInfos.length == 0 && <Badge mode="prominent" />}
            text={Locales.Rooms.CreateRoom}
            onClick={() =>
              ModalManager.showModal(ModalIds.CreateRoom, createRoomData)
            }
          >
            <Tooltip
              isShown={roomInfos.length == 0}
              text={Locales.Hints.CreateRoom}
              offsetY={20}
            >
              <Icon28AddOutline />
            </Tooltip>
          </TabbarItem>
          <TabbarItem
            indicator={roomInfos.length == 0 && <Badge mode="prominent" />}
            text={Locales.Rooms.JoinRoom}
            onClick={() =>
              ModalManager.showModal(ModalIds.JoinRoom, joinRoomData)
            }
          >
            <Icon28Users3Outline />
          </TabbarItem>
        </Tabbar>
      </Panel>
    </View>
  );
}
