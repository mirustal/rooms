package queries

import (
	"context"
	app "room_app/app/models"
)

type Storage interface {
	CreateRoom(ctx context.Context, room app.Room) (string, error)
	FindRoomsByIds(ctx context.Context, strIdsRoom []string) ([]app.Room, error)
	FindOneRoomById(ctx context.Context, strIdRoom string) (app.Room, error)
	DeleteRoom(ctx context.Context, strIdsRoom string) error
	JoinRoom(ctx context.Context, newMember app.Member, strRoomId string) error
	UpdateRoom(ctx context.Context, room app.Room) error

	StoreRoomState(ctx context.Context, state app.RoomState) error
	TryGetRoomState(ctx context.Context, roomId string) (room *app.RoomState, ok bool)
}
