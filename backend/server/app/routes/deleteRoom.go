package routes

import (
	"context"
	"room_app/pgk/errors"

	"github.com/gofiber/fiber/v2"
)

type deleteRoomRequestDTO struct {
	RoomId string `json:"room_id"`
}

func deleteRoom(c *fiber.Ctx) error {
	println("Handle DeleteRoom")

	queryInfo := new(deleteRoomRequestDTO)
	if err := c.BodyParser(queryInfo); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid body",
		})
	}

	isUserAdmin, err := isUserAdmin(queryInfo.RoomId, getUserId(c))
	if err != nil {
		return err
	}
	if !isUserAdmin {
		return errors.NoRightsError()
	}

	err = storage.DeleteRoom(context.Background(), queryInfo.RoomId)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "room not delete",
		})
	}

	return c.Status(200).JSON(fiber.Map{})
}
