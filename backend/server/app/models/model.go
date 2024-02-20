package models

type Room struct {
	ID        string    `json:"id" bson:"_id,omitempty"`
	RoomName  string    `json:"name" bson:"roomname"`
	AvatarURL string    `json:"avatar" bson:"avatarurl"`
	Members   []Member  `json:"members" bson:"members"`
	Channels  []Channel `json:"channels" bson:"channels"`
}

type Channel struct {
	ID          int    `json:"id" bson:"_id"`
	ChannelName string `json:"name" bson:"channelname"`
	JoinLink string `json:"joinlink" bson:"joinlink"`
}

type Member struct {
	ID   int64  `json:"id" bson:"_id"`
	Role string `json:"role" bson:"role"`
}

type RoomState struct {
	ID       string                  `json:"id" bson:"_id"`
	Channels map[int]ChannelState `json:"channels" bson:"channels"`
}

type ChannelState struct {
	ID       int    `json:"id" bson:"_id"`
	JoinLink string `json:"joinlink" bson:"joinlink"`
}
