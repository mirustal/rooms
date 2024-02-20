package connectroom

import (
	"room_app/app/models"
	"slices"
	"sync"
)

type channelState struct {
	locker *struct {
		sync.Mutex
		user *roomUser
	}
	joinLink *struct {
		sync.Mutex
		value string
	}
	lockChannelData *lockChannelHandlerData
}

func newChannelState() *channelState {
	return &channelState{
		locker: &struct {
			sync.Mutex
			user *roomUser
		}{},
		joinLink: &struct {
			sync.Mutex
			value string
		}{},
		lockChannelData: newLockChannelHandlerData(),
	}
}

type iClientEventsHandler interface {
	handle(event *clientEvent) error
}

type clientEventsHandler struct {
	roomHolder *roomHolder
	channels   map[int]*channelState
}

func (c channelState) isLocked() bool {
	return c.locker.user != nil
}

func (h *clientEventsHandler) getRoomState() models.RoomState {
	channels := map[int]models.ChannelState{}

	for key, val := range h.channels {
		channels[key] = models.ChannelState{
			ID:       key,
			JoinLink: val.joinLink.value,
		}
	}

	return models.RoomState{
		ID:       h.roomHolder.room.ID,
		Channels: channels,
	}
}

func newClientEventsHandler(roomHolder *roomHolder) *clientEventsHandler {
	channels := make(map[int]*channelState, len(roomHolder.room.Channels))
	for _, channel := range roomHolder.room.Channels {
		channels[channel.ID] = newChannelState()
	}
	return &clientEventsHandler{
		roomHolder: roomHolder,
		channels:   channels,
	}
}

func newClientEventsHandlerFromCache(roomHolder *roomHolder, state models.RoomState) *clientEventsHandler {
	channels := make(map[int]*channelState, len(roomHolder.room.Channels))
	for _, channel := range roomHolder.room.Channels {
		newState := newChannelState()
		newState.joinLink.value = state.Channels[channel.ID].JoinLink

		channels[channel.ID] = newState
	}
	return &clientEventsHandler{
		roomHolder: roomHolder,
		channels:   channels,
	}
}

func (h *clientEventsHandler) refreshChannels() {
	indexesToRemove := make([]int, 0)
	for i := range h.channels {
		if slices.ContainsFunc(h.roomHolder.room.Channels, func(c models.Channel) bool { return c.ID == i }) {
			continue
		}
		indexesToRemove = append(indexesToRemove, i)
	}

	for i := range indexesToRemove {
		delete(h.channels, i)
	}

	for _, channel := range h.roomHolder.room.Channels {
		if _, ok := h.channels[channel.ID]; !ok {
			h.channels[channel.ID] = newChannelState()
		}
	}

	h.roomHolder.publish(newRoomUpdatedEvent(h.roomHolder.room))
}

func (h *clientEventsHandler) handle(event *clientEvent) error {
	if event.data.Init != nil {
		return h.handleInit(event.source)
	}
	if event.data.Lock != nil {
		return h.handleLockChannel(event.source, event.data.Lock.ChannelId)
	}
	if event.data.PushLink != nil {
		return h.handlePushLink(event.source, event.data.PushLink.ChannelId, event.data.PushLink.Link)
	}

	return nil
}

func (h *clientEventsHandler) handleInit(source *roomUser) error {
	return source.writeEvent(newInitRoomEvent(h.channels))
}

func (h *clientEventsHandler) dispose() {
	h.roomHolder = nil
}
