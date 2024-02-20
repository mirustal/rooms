package main

import (
	"fmt"
	"room_app/app/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	routes.Init(app)

	if err := app.ListenTLS(":1337", "/etc/letsencrypt/live/yasentech.ru/fullchain.pem", "/etc/letsencrypt/live/yasentech.ru/privkey.pem"); err != nil {
		fmt.Printf("Oops... Server is not running! Reason: %v", err)
	}

	// if err := app.Listen(":1337"); err != nil {
	// 	fmt.Printf("Oops... Server is not running! Reason: %v", err)
	// }
}
