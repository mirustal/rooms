import {
  SimpleCell,
  Avatar,
  IconButton,
} from "@vkontakte/vkui";
import { Locales } from "../../../locales/locales";
import {
  Icon24ArrowRightCircleOutline,
  Icon16FavoriteOutline,
  Icon16Favorite,
} from "@vkontakte/icons";

export default function RoomView({ info, enterRoom, searchValue, updateRooms  }) {
  if (searchValue && !info.name.toLowerCase().includes(searchValue.toLowerCase())) {
    return null
  }
  return (
      <SimpleCell
          before={
            <>
              <IconButton style={{ marginRight: 10 }} onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  info.setFavourite(!info.isFavourite); 
                  updateRooms();
                }}>
                {info.isFavourite ? <Icon16Favorite /> : <Icon16FavoriteOutline />}
              </IconButton>
              <Avatar src={info.avatar} />
            </>
          }
          subtitle={Locales.Rooms.ServerParticipants(info.members.length, 0)}
          after={
            <IconButton style={{ marginRight: 2 }} onClick={enterRoom}>
              <Icon24ArrowRightCircleOutline width={24} height={24} />
            </IconButton>
          }
          onClick={enterRoom}
      >
        {info.name}
      </SimpleCell>
  );
}
