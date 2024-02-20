package connectroom

import (
	"context"
	"fmt"
	"github.com/gofiber/contrib/websocket"
	"room_app/app/models"
	"room_app/platform/database"
)

type RoomsConnectionHandler struct {
	rooms map[string]*roomHolder
}

func New() *RoomsConnectionHandler {
	return &RoomsConnectionHandler{
		rooms: make(map[string]*roomHolder),
	}
}

func (h *RoomsConnectionHandler) Handle(conn *websocket.Conn) {
	defer conn.Close()

	id := conn.Params("id", "")
	roomHolder, err := h.getOrCreateRoom(id)
	if err != nil {
		fmt.Printf("error on connecting to room %v: %v", id, err)
		conn.Close()
		return
	}

	err = roomHolder.hold(conn)
	if err != nil {
		fmt.Printf("error while communicating with room %v: %v", id, err)
	}
}

func (h *RoomsConnectionHandler) OnRoomUpdated(room *models.Room) {
	if val, ok := h.rooms[room.ID]; ok {
		err := val.update(room)
		if err != nil {
			fmt.Printf("error on updating room: %v", err)
		}
		return
	}
}

func (h *RoomsConnectionHandler) removeRoom(id string) {
	fmt.Printf("room %v is empty. deleting", id)
	delete(h.rooms, id)
}

func (h *RoomsConnectionHandler) getOrCreateRoom(id string) (*roomHolder, error) {
	if val, ok := h.rooms[id]; ok {
		println("found room ", id)
		return val, nil
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	db, err := database.NewClient(ctx)
	if err != nil {
		return nil, err
	}

	storage := database.NewStorage(db)

	room, err := storage.FindOneRoomById(ctx, id)
	if err != nil {
		return nil, err
	}

	state, ok := storage.TryGetRoomState(context.Background(), room.ID)

	fmt.Printf("creating new room holder %v", id)
	var holder *roomHolder
	if ok {
		fmt.Printf("found room state in db for room %v", id)
		holder = newRoomHolderFromCache(&room, *state, h.removeRoom)
	} else {
		holder = newRoomHolder(&room, h.removeRoom)
	}

	h.rooms[id] = holder
	return holder, nil
}
