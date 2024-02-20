set GOOS=linux
set GOARCH=amd64
go build -o server main.go
scp server root@77.232.129.50:/home/rooms/server
pause