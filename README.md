./app
Здесь хранится все связанное с бизнесс логикой
	./controllers функционал контроллеров
	./logging логгер
	./models модели структур данных
	./queries интерфейсы для связи с платформой

./pkg
Здесь хранится функционал проекта. конфигурации, маршруты, тулзы, всем тут.
	./config обработка конфигурации сервера\бд
	./repository  хранение константных значенеий 
	./utils служебные функции для запуска сервера
	
./platform
Здесь хранится логика уровня платформы, создается реальный проект именно на этом уровне, т.е. настройка базы данных, экземляра сервера
	./database функции с обработкой запросов в базу данных 