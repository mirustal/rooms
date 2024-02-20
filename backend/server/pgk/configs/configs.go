package configs

import (
	"sync"

	"github.com/ilyakaznacheev/cleanenv"
)

type ConfigFiber struct {
	Type   string `yaml:"type"`
	BindIp string `yaml:"bind_ip"`
	Port   string `yaml:"port"`
}

type ConfigMongoDB struct {
	Host       string `json:"host"`
	Port       string `json:"port"`
	Database   string `json:"database"`
	Collection string `json:"collection"`
}

type Config struct {
	IsDebug *bool `yaml:"is_debug"`
	Listen  ConfigFiber
	MongoDB ConfigMongoDB
}

var instance *Config
var once sync.Once

func GetConfig() *Config {
	once.Do(func() { // singleTon
		instance = &Config{}
		if err := cleanenv.ReadConfig("./config.yml", instance); err != nil {
			cleanenv.GetDescription(instance, nil)
		}
	})
	return instance
}
