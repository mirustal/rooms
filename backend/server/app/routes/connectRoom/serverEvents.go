package connectroom

import (
	"encoding/json"
	"github.com/gofiber/contrib/websocket"
	"room_app/app/models"
)

type serverEvent struct {
	RoomUpdated    *models.Room       `json:"roomUpdated,omitempty"`
	ChannelsInit   []channelStateData `json:"channelsInit,omitempty"`
	ChannelUpdated *channelStateData  `json:"channelUpdated,omitempty"`
	LockResult     *int               `json:"lockResult,omitempty"`
}

type channelStateData struct {
	ChannelId int    `json:"channelId"`
	IsLocked  bool   `json:"isLocked"`
	Locker    *int64 `json:"locker,omitempty"`
	JoinLink  string `json:"joinLink"`
}

func (e *serverEvent) toMessage() (msgType int, msg []byte) {
	data, _ := json.Marshal(e)
	return websocket.TextMessage, data
}

func getLockerPtr(channel *channelState) *int64 {
	var locker *int64
	if channel.locker.user != nil {
		locker = &channel.locker.user.id
	}
	return locker
}

func getChannelStateData(channelId int, state channelState) *channelStateData {
	return &channelStateData{
		ChannelId: channelId,
		IsLocked:  state.isLocked(),
		Locker:    getLockerPtr(&state),
		JoinLink:  state.joinLink.value,
	}
}

func newInitRoomEvent(channels map[int]*channelState) *serverEvent {
	channelsData := make([]channelStateData, len(channels))

	i := 0
	for id := range channels {
		channelsData[i] = *getChannelStateData(id, *channels[id])
		i++
	}

	return &serverEvent{
		ChannelsInit: channelsData,
	}
}

func newRoomUpdatedEvent(room *models.Room) *serverEvent {
	return &serverEvent{RoomUpdated: room}
}

func newChannelUpdatedEvent(channelId int, data channelState) *serverEvent {
	return &serverEvent{
		ChannelUpdated: getChannelStateData(channelId, data),
	}
}

func newLockResultEvent(isLocked bool) *serverEvent {
	res := 0
	if isLocked {
		res = 1
	}

	return &serverEvent{LockResult: &res}
}
