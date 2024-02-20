package routes

import (
	"context"

	"github.com/gofiber/fiber/v2"
)

type getRoomsRequestDTO struct {
	RoomIds []string `json:"room_ids"`
}

func getRooms(c *fiber.Ctx) error {
	println("Handle GetRooms")

	queryInfo := new(getRoomsRequestDTO)
	if err := c.BodyParser(queryInfo); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid body",
		})
	}

	dataRooms, _ := storage.FindRoomsByIds(context.Background(), queryInfo.RoomIds)

	return c.Status(200).JSON(fiber.Map{
		"rooms": dataRooms,
	})
}
