package database

import (
	"context"
	"room_app/app/models"
	app "room_app/app/queries"
	"slices"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type db struct {
	rooms  *mongo.Collection
	states *mongo.Collection
}

func (d *db) CreateRoom(ctx context.Context, room models.Room) (string, error) {
	result, err := d.rooms.InsertOne(ctx, room)
	if err != nil {
		return "", nil
	}

	oid, _ := result.InsertedID.(primitive.ObjectID)

	return oid.Hex(), nil
}

func (d *db) UpdateRoom(ctx context.Context, room models.Room) error {
	objectId, _ := primitive.ObjectIDFromHex(room.ID)
	filter := bson.M{"_id": objectId}
	update := bson.M{
		"roomname":  room.RoomName,
		"avatarurl": room.AvatarURL,
		"channels":  room.Channels,
		"members":   room.Members,
	}

	_, err := d.rooms.ReplaceOne(ctx, filter, update)
	if err != nil {
		return err
	}
	return nil
}

func (d *db) FindOneRoomById(ctx context.Context, strIdRoom string) (result models.Room, err error) {

	objIdRoom, _ := primitive.ObjectIDFromHex(strIdRoom)
	filter := bson.D{{"_id", objIdRoom}}

	err = d.rooms.FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return result, nil
		}
	}
	return result, err
}

func (d *db) FindRoomsByIds(ctx context.Context, strIdsRoom []string) (rooms []models.Room, err error) {
	objectIds := strToObjectId(strIdsRoom)

	filter := bson.M{"_id": bson.M{"$in": objectIds}}
	cursor, err := d.rooms.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	rooms = []models.Room{}
	for cursor.Next(ctx) {
		var room models.Room
		cursor.Decode(&room)
		rooms = append(rooms, room)
	}
	if err := cursor.Err(); err != nil {
		return nil, err
	}

	return rooms, err
}

func (d *db) JoinRoom(ctx context.Context, newMember models.Member, strIdRoom string) (err error) {
	findRoom, err := d.FindOneRoomById(ctx, strIdRoom)
	if err != nil {
		return err
	}

	members := findRoom.Members
	if slices.ContainsFunc(members, func(m models.Member) bool { return m.ID == newMember.ID }) {
		return nil
	}

	members = append(members, newMember)

	objIdRoom, _ := primitive.ObjectIDFromHex(strIdRoom)
	filter := bson.D{{"_id", objIdRoom}}
	update := bson.D{{"$set", bson.D{{"members", members}}}}

	_, err = d.rooms.UpdateOne(ctx, filter, update)

	if err != nil {
		if err == mongo.ErrNoDocuments {
			return err
		}
	}

	return err
}

func (d *db) DeleteRoom(ctx context.Context, strIdRoom string) error {

	objIdRoom, _ := primitive.ObjectIDFromHex(strIdRoom)
	filter := bson.D{{"_id", objIdRoom}}
	_, err := d.rooms.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}
	return nil
}

func (d *db) StoreRoomState(ctx context.Context, state models.RoomState) error {
	_, err := d.states.InsertOne(ctx, state)
	filter := bson.D{{"_id", state.ID}}
	res, err := d.states.ReplaceOne(ctx, filter, state)
	if err != nil {
		return err
	}
	if res.MatchedCount == 0 {
		_, err := d.states.InsertOne(ctx, state)
		if err != nil {
			return err
		}
	}
	return err
}

func (d *db) TryGetRoomState(ctx context.Context, roomId string) (room *models.RoomState, ok bool) {
	filter := bson.D{{"_id", roomId}}
	room = new(models.RoomState)
	err := d.states.FindOne(ctx, filter).Decode(room)
	if err != nil {
		return nil, false
	}
	return room, true
}

func NewStorage(database *mongo.Database) app.Storage {
	return &db{
		rooms: database.Collection("rooms"),
	}
}

func strToObjectId(strIdsRoom []string) []primitive.ObjectID {
	var objectIds []primitive.ObjectID
	for _, strId := range strIdsRoom {
		objectId, _ := primitive.ObjectIDFromHex(strId)
		objectIds = append(objectIds, objectId)
	}
	return objectIds
}
