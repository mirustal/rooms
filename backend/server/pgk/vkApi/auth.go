package vkapi

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"net/url"
	"room_app/pgk/errors"
	"sort"
	"strconv"
	"strings"
)

const vk_service_token string = ""
const vk_secure_key string = ""

type queryParameter struct {
	Key   string
	Value string
}

const SignInvalid = "подпись невалидна"

func Authorize(launchParams string) (userId int64, err error) {
	var (
		// Отфильтрованные параметры запуска. Мы используем именно
		// слайс по той причине, что позже нам будет необходимым этот слайс
		// отсортировать по возрастанию ключа параметра.
		query []queryParameter
		// Подпись, которая была сгенерирована сервером ВКонтакте и основана на
		// параметрах из query.
		sign string
	)

	userId = -1

	// Разделяем параметры запуска на вхождения, разделенные знаком "&".
	for _, part := range strings.Split(launchParams, "&") {
		var keyAndValue = strings.Split(part, "=")
		var key = keyAndValue[0]
		var value string

		if len(keyAndValue) > 1 {
			value = keyAndValue[1]
		}

		// Мы обрабатываем только те ключи, которые начинаются с префикса "vk_".
		// Все остальные ключи в создании подписи не участвуют.
		if strings.HasPrefix(key, "vk_") {
			query = append(query, queryParameter{key, value})
			if key == "vk_user_id" {
				i, err := strconv.ParseInt(value, 10, 64)
				if err != nil {
					return -1, errors.AuthErrorWithDesc(fmt.Sprintf("Can't parse user id: %v", value))
				}
				userId = i
			}
		} else if key == "sign" {
			// Если ключ равен "sign", то в значении записана подпись параметров
			// запуска.
			sign = value
		}
	}

	if userId == -1 {
		return -1, errors.AuthErrorWithDesc("UserId is incorrect or unset")
	}

	// В случае, если подпись параметров не удалось найти, либо параметров с
	// префиксом "vk_" передано не было, мы считаем параметры запуска невалидными.
	if sign == "" || len(query) == 0 {
		return -1, errors.AuthErrorWithDesc(SignInvalid)
	}

	// Сортируем параметры запуска по порядку их возрастания.
	sort.SliceStable(query, func(a int, b int) bool {
		return query[a].Key < query[b].Key
	})

	// Далее снова превращаем параметры запуска в единую строку.
	var queryString = ""

	for idx, param := range query {
		if idx > 0 {
			queryString += "&"
		}
		queryString += param.Key + "=" + url.PathEscape(param.Value)
	}

	// Далее нам необходимо вычислить хэш SHA-256.
	var hashCreator = hmac.New(sha256.New, []byte(vk_secure_key))
	hashCreator.Write([]byte(queryString))

	var hash = base64.URLEncoding.EncodeToString(hashCreator.Sum(nil))

	// Далее по правилам создания параметров запуска ВКонтакте, необходимо
	// произвести ряд замен символов.
	hash = strings.ReplaceAll(hash, "+", "-")
	hash = strings.ReplaceAll(hash, "/", "_")
	hash = strings.ReplaceAll(hash, "=", "")

	if sign != hash {
		return -1, errors.AuthErrorWithDesc(SignInvalid)
	}

	return userId, nil
}
