package connectroom

import (
	"context"
	"fmt"
	"room_app/app/models"
	"room_app/platform/database"
	"slices"

	"github.com/gofiber/contrib/websocket"
)

type roomHolder struct {
	room                *models.Room
	users               map[int64]*roomUser
	clientEventsHandler *clientEventsHandler

	onRoomIsEmpty func(id string)
}

func newRoomHolder(room *models.Room, onRoomIsEmpty func(id string)) *roomHolder {
	holder := &roomHolder{
		room:          room,
		users:         map[int64]*roomUser{},
		onRoomIsEmpty: onRoomIsEmpty,
	}
	holder.clientEventsHandler = newClientEventsHandler(holder)
	return holder
}

func newRoomHolderFromCache(room *models.Room, state models.RoomState, onRoomIsEmpty func(id string)) *roomHolder {
	holder := &roomHolder{
		room:          room,
		users:         map[int64]*roomUser{},
		onRoomIsEmpty: onRoomIsEmpty,
	}
	holder.clientEventsHandler = newClientEventsHandlerFromCache(holder, state)
	return holder
}

func (h *roomHolder) hold(conn *websocket.Conn) error {
	userId := conn.Locals("user").(int64)
	if _, ok := h.users[userId]; ok {
		return fmt.Errorf("user %v already registered in room %v", userId, h.room.ID)
	}
	if slices.ContainsFunc(h.room.Members, func(x models.Member) bool { return x.ID == userId }) == false {
		return fmt.Errorf("user %v is not member of room %v", userId, h.room.ID)
	}
	h.users[userId] = newRoomUser(userId, conn, h.clientEventsHandler, h.onUserDisconnected)
	return h.users[userId].listen()
}

func (h *roomHolder) update(room *models.Room) error {
	if room.ID != h.room.ID {
		return fmt.Errorf("wrong room id: %v != %v", room.ID, h.room.ID)
	}

	h.room = room
	h.clientEventsHandler.refreshChannels()
	return nil
}

func (h *roomHolder) onUserDisconnected(user *roomUser) {
	delete(h.users, user.id)
	if len(h.users) == 0 {
		db, _ := database.NewClient(context.Background())
		storage := database.NewStorage(db)
		defer database.CloseDB()

		storage.StoreRoomState(context.Background(), h.clientEventsHandler.getRoomState())

		h.clientEventsHandler.dispose()
		h.onRoomIsEmpty(h.room.ID)
	}
}

func (h *roomHolder) publish(event *serverEvent) {
	msgType, msg := event.toMessage()
	for _, user := range h.users {
		err := user.conn.WriteMessage(msgType, msg)
		if err != nil {
			println("Error on writing message to user:", err)
		}
	}
}
