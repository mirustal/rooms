package routes

import (
	"context"
	"room_app/app/models"

	"github.com/gofiber/fiber/v2"
)

type createRoomRequestDTO struct {
	RoomData models.Room `json:"room_data"`
}

func createRoom(c *fiber.Ctx) error {
	println("Handle CreateRoom")

	queryInfo := new(createRoomRequestDTO)
	if err := c.BodyParser(&queryInfo); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid body",
		})
	}

	queryInfo.RoomData.Members = []models.Member{ {ID: getUserId(c), Role: "admin"} }
	queryInfo.RoomData.ID = ""

	err := models.ValidateRoom(&queryInfo.RoomData)

	if err != nil {
		return err
	}

	roomId, err := storage.CreateRoom(context.Background(), queryInfo.RoomData)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "error on creating room",
		})
	}

	room, err := storage.FindOneRoomById(context.Background(), roomId)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "error on finding created room",
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"room": room,
	})
}
