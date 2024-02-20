package database

import (
	"context"
	"fmt"
	"room_app/pgk/configs"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var db_mongo *mongo.Database

/*
Connects the client and the database
Input:
content.Background(), Config
Output:
Link to mongo.Database instance, error
*/
func NewClient(ctx context.Context) (db *mongo.Database, err error) {
	cfg := configs.GetConfig()
	host, port, database := cfg.MongoDB.Host, cfg.MongoDB.Port, cfg.MongoDB.Database
	mongoDBURL := fmt.Sprintf("mongodb://%s:%s", host, port)
	clientOptions := options.Client().ApplyURI(mongoDBURL)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect MongoDB")
	}
	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB")
	}
	db_mongo = client.Database(database)

	return db_mongo, nil
}

func GetDBCollection(name_collection string) *mongo.Collection {
	return db_mongo.Collection(name_collection)
}

func CloseDB() error {
	return db_mongo.Client().Disconnect(context.Background())
}
