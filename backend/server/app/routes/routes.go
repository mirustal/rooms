package routes

import (
	"context"
	"room_app/app/queries"
	"room_app/pgk/errors"
	vkapi "room_app/pgk/vkApi"
	"room_app/platform/database"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

var storage queries.Storage

func Init(app *fiber.App) {
	db, err := database.NewClient(context.Background())
	if err != nil {
		panic(err)
	}
	storage = database.NewStorage(db)

	roomGroup := app.Group("/rooms")

	roomGroup.Use(authorize)
	roomGroup.Use(recover.New())

	roomGroup.Post("/get", getRooms)
	roomGroup.Post("/join", joinRoom)
	roomGroup.Post("/create", createRoom)
	roomGroup.Post("/delete", deleteRoom)
	updateRoomHandler := newUpdateRoomHandler()
	roomGroup.Post("/update", updateRoomHandler.updateRoom)
	roomGroup.Post("/uploadImage", uploadImageRoom)
}

func authorize(ctx *fiber.Ctx) error {
	headers := ctx.GetReqHeaders()

	var token string
	if val, ok := headers["Authorization"]; ok {
		token = val
	} else {
		return errors.AuthError()
	}

	userId, err := vkapi.Authorize(token)
	if err != nil {
		return err
	}

	ctx.Locals("user", userId)
	return ctx.Next()
}

func getUserId(c *fiber.Ctx) int64 {
	return c.Locals("user").(int64)
}
