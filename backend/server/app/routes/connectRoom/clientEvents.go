package connectroom

import (
	"encoding/json"
)

type clientEvent struct {
	data   clientEventData
	source *roomUser
}

type clientEventData struct {
	Init     *struct{} `json:"init,omitempty"`
	PushLink *struct {
		ChannelId int    `json:"channelId"`
		Link      string `json:"link"`
	} `json:"pushlink"`
	Lock *struct {
		ChannelId int `json:"channelId"`
	} `json:"lock"`
}

func newClientEvent(rawData string, user *roomUser) (*clientEvent, error) {
	var eventData clientEventData
	err := json.Unmarshal([]byte(rawData), &eventData)
	if err != nil {
		return nil, err
	}
	return &clientEvent{eventData, user}, nil
}
