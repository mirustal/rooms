package routes

import (
	"context"
	"room_app/app/models"
	"room_app/pgk/errors"
	"slices"

	"github.com/gofiber/fiber/v2"
)

type updateRoomRequestDTO struct {
	RoomData models.Room `json:"room_data"`
}

type updateRoomHandler struct {
	onRoomUpdated []func(room *models.Room)
}

func newUpdateRoomHandler() *updateRoomHandler {
	return &updateRoomHandler{
		onRoomUpdated: make([]func(room *models.Room), 0),
	}
}

func (h *updateRoomHandler) executeOnRoomUpdated(room *models.Room) {
	for _, f := range h.onRoomUpdated {
		f(room)
	}
}

func (h *updateRoomHandler) updateRoom(c *fiber.Ctx) error {
	println("Handle UpdateRoom")

	queryInfo := new(updateRoomRequestDTO)
	if err := c.BodyParser(queryInfo); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "invalid body",
		})
	}

	err := models.ValidateRoom(&queryInfo.RoomData)
	if err != nil {
		return err
	}

	isUserAdmin, err := isUserAdmin(queryInfo.RoomData.ID, getUserId(c))
	if err != nil {
		return err
	}
	if !isUserAdmin {
		return errors.NoRightsError()
	}

	err = storage.UpdateRoom(context.Background(), queryInfo.RoomData)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "change room fail",
		})
	}

	go h.executeOnRoomUpdated(&queryInfo.RoomData)
	return c.Status(200).JSON(fiber.Map{})
}

func isUserAdmin(roomId string, userId int64) (bool, error) {
	roomData, err := storage.FindOneRoomById(context.Background(), roomId)
	if err != nil {
		return false, errors.RoomNotExistsError()
	}
	return slices.ContainsFunc(roomData.Members, func(m models.Member) bool { return m.ID == userId && m.Role == "admin" }), nil
}
