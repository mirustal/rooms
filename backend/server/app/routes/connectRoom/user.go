package connectroom

import (
	"fmt"
	"github.com/gofiber/contrib/websocket"
)

type roomUser struct {
	id                 int64
	conn               *websocket.Conn
	eventsHandler      iClientEventsHandler
	onUserDisconnected func(*roomUser)
}

func newRoomUser(userId int64, conn *websocket.Conn, eventsHandler iClientEventsHandler, onUserDisconnected func(*roomUser)) *roomUser {
	println("Connection established")
	return &roomUser{
		id:                 userId,
		conn:               conn,
		eventsHandler:      eventsHandler,
		onUserDisconnected: onUserDisconnected,
	}
}

func (u *roomUser) listen() error {
	defer u.onUserDisconnected(u)

	var (
		msg []byte
		err error
	)
	for {
		if _, msg, err = u.conn.ReadMessage(); err != nil {
			fmt.Println("error on getting message:", err)
			return err
		}

		event, err := newClientEvent(string(msg), u)
		if err != nil {
			fmt.Println("error parsing message:", err)
			return err
		}

		err = u.eventsHandler.handle(event)
		if err != nil {
			err = u.conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("{\"error\": \"%v\"}", err)))
			if err != nil {
				return err
			}
		}
	}
}

func (u *roomUser) writeEvent(event *serverEvent) error {
	return u.conn.WriteMessage(event.toMessage())
}
