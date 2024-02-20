package routes

import (
	"context"
	"room_app/app/models"
	"room_app/pgk/errors"

	"github.com/gofiber/fiber/v2"
)

type joinRoomRequestDTO struct {
	RoomId string `json:"room_id"`
}

func joinRoom(c *fiber.Ctx) error {
	println("Handle JoinRoom")

	queryInfo := new(joinRoomRequestDTO)
	if err := c.BodyParser(&queryInfo); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid body",
		})
	}

	member := models.Member{
		ID:   getUserId(c),
		Role: "member",
	}

	err := storage.JoinRoom(context.Background(), member, queryInfo.RoomId)
	if err != nil {
		return c.Status(400).JSON(errors.RoomNotExistsRaw())
	}

	dataRoom, _ := storage.FindOneRoomById(context.Background(), queryInfo.RoomId)

	return c.Status(200).JSON(fiber.Map{
		"room": dataRoom,
	})
}
