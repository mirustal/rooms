package routes

import (
	"encoding/json"
	"fmt"
	"io"

	"github.com/gofiber/fiber/v2"
)

const (
	accessToken           = "a4caff63a4caff63a4caff637ba7df3cfdaa4caa4caff63c1d9c100d846681e403aa6b2" 
	uploadServerMethodURL = ""          
	apiVersion            = "5.131"        
	imageType = "160x160"                                                           
)




type VkGetAppImageUploadServer struct {
	Response struct {
		UploadURL string `json:"upload_url"`
	} `json:"response"`
}

type VkUploadImage struct {
		Hash string `json:"hash"`
		Image string `json:"image"`
}

type VkSaveAppImage struct {
	Response struct {
		Id string `json:"id"`
		TypeImage string `json:"type"`
		Images []struct {
			Url string `json:"url"`
			Width int `json:"width"`
			Height int `json:"height"`
		} `json:images`
	} `json:"response"`
}


func getUrlUploadServer(c *fiber.Ctx) (string, error) {

	getUrlServerUpload := fmt.Sprintf("https://api.vk.com/method/appWidgets.getAppImageUploadServer?image_type=%s&access_token=%s&v=%s",imageType, accessToken,  apiVersion)
	
	agent := fiber.Post(getUrlServerUpload)
	agent.Body(c.Body())
	_, body, errs := agent.Bytes()
    if len(errs) > 0 {
        return "", c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "errs": errs,
        })
    }

	response := new(VkGetAppImageUploadServer)
	if err := json.Unmarshal(body, &response); err != nil {
		return "", c.Status(400).JSON(fiber.Map{
			"error": "cannot parse JSON response",
		})
	}

	return response.Response.UploadURL, nil
}

func uploadImageServer(bytesImage []byte, fileName string, urlUploadImage string, c *fiber.Ctx) (VkUploadImage, error) {
	var response VkUploadImage
	agent := fiber.AcquireAgent()
	args := fiber.AcquireArgs()


	file := fiber.AcquireFormFile()
	file.Content = bytesImage
	file.Fieldname = "image"
	file.Name = fileName


	args.Set("Content-Type", "multipart/form-data")
	agent.FileData(file)
	agent.MultipartForm(args)
	req := agent.Request()
	req.Header.SetMethod(fiber.MethodPost)
	req.SetRequestURI(urlUploadImage)


	if err := agent.Parse(); err != nil {
		panic(err)
	}
	

	_, body, errs := agent.Bytes()
    if len(errs) > 0 {
        return response, c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "errs": errs,
        })
    }

	if err := json.Unmarshal(body, &response); err != nil {
		return response, c.Status(400).JSON(fiber.Map{
			"error": "cannot parse JSON response",
		})
	}

	return response, nil
}

func saveAppImage(responseServer VkUploadImage, c *fiber.Ctx) (VkSaveAppImage, error) {
	getUploadImage := fmt.Sprintf("https://api.vk.com/method/appWidgets.saveAppImage?access_token=%s&v=%s", accessToken, apiVersion)
	
	var responseSaveAppImage VkSaveAppImage
	agent := fiber.AcquireAgent()
	args := fiber.AcquireArgs()
	args.Set("Content-Type", "multipart/form-data")
	args.Set("hash", responseServer.Hash)
	args.Set("image", responseServer.Image)
	agent.MultipartForm(args)
	req := agent.Request()
	req.Header.SetMethod(fiber.MethodPost)
	req.SetRequestURI(getUploadImage)
	

	if err := agent.Parse(); err != nil {
		panic(err)
	}
	

	_, body, errs := agent.Bytes()
    if len(errs) > 0 {
        return responseSaveAppImage, c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "errs": errs,
        })
    }


	if err := json.Unmarshal(body, &responseSaveAppImage); err != nil {
		return responseSaveAppImage, c.Status(400).JSON(fiber.Map{
			"error": "cannot parse JSON response",
		})
	}

	return responseSaveAppImage, nil
}



func uploadImageRoom(c *fiber.Ctx) error {

	file, err := c.FormFile("image")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "cannot retrieve the file from the form",
		})
	}

	// fileName, err := c.FormFile("fileName")
	// if err != nil {
	// 	return c.Status(400).JSON(fiber.Map{
	// 		"error": "cannot retrieve the file from the form",
	// 	})
	// }

	fileName := file.Filename


	fileData, err := file.Open()
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "cannot open the file",
		})
	}
	defer fileData.Close()


	imageData, err := io.ReadAll(fileData)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "cannot read the file",
		})
	}

	uploadUrl, err := getUrlUploadServer(c)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "error get url",
		})
	}

	responseServerUploadImage, err := uploadImageServer(imageData, fileName, uploadUrl, c)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "not upload image on server",
		})
	}

	responseSaveAppImage, err := saveAppImage(responseServerUploadImage, c)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"error": "not save app image",
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"response": responseSaveAppImage.Response,
	})
} 

