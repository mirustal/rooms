export const Locales = {
    AppName: 'Комнаты',
    Rooms: {
        Favourite: 'Избранные',
        Search: 'Поиск',
        ServerParticipants: (participantsCount, currentOnlineCount) => {
            if (participantsCount % 100 > 9 && participantsCount % 100 < 20) return `${participantsCount} участников`
            if (participantsCount % 10 == 1) return `${participantsCount} участник`
            if (participantsCount % 10 > 1 && participantsCount % 10 < 5) return `${participantsCount} участника`
            return `${participantsCount} участников`
        },
        CreateRoom: "Создать комнату",
        JoinRoom: "Присоединиться к комнате",
        RoomsListIsEmpty: "Тебя ещё нет ни в одной комнате",
        Favourite: "Избранное"
    },
    Channels: {
        CreateChannel: "Создать канал"
    },
    ActionSheetName: {
        EditRoom: "Редактировать комнату",
        ShareRoom: "Поделиться комнатой",
        DeleteRoom: "Удалить комнату",
        ExitRoom: "Выйти из комнаты"
    },
    Modals: {
        JoinRoom: {
            Header: "Присоединиться к комнате",
            InputPlaceHolder: "ID Комнаты",
            JoinButton: "Присоединиться"
        },
        CreateRoom: {
            Header: "Новая комната",
            NameInputPlaceHolder: "Название комнаты",
            AvatarURLInputHolder: "Ссылка на аватар",
            CreateButton: "Создать",
            clearTemplate: "Пустой шаблон",
            defaultTemplate: "Готовый шаблон",
        },
        CreateChannel: {
            Header: "Новый канал",
            NameInputPlaceHolder: "Название канала",
            CreateButton: "Создать",
        },

        RenameChannel: {
            Header: "Изменить название канала",
            NameInputPlaceHolder: "Новое название канала",
            renameButton: "Переименовать",

        }


    },
    Alerts: {
        ErrorTitle: "Ошибка",
        ConfirmDeleteRoomTitle: "Удалить комнату",
        ConfirmExitRoomTitle: "Покинуть комнату",
        Delete:"Удалить",
        Exit:"Выйти",
        Cancel:"Отменить",
        TipTitle: "Совет"
    },
    Errors: {
        FailedJoinRoom: "Не удалось присоединиться к комнате",
        FailedCreateRoom: "Не удалось создать комнату",
        FailedCreateChannel: "Не удалось создать канал",
        FailedEnterRoom: "Не удалось войти в комнату",
    },
    Hints: {
        CreateRoom: "Создай комнату и пригласи в нее своих друзей!",
        RefreshChannel: "Если не удается подключится к каналу, то используйте эту кнопку \"Обновить\"",
        DontKillCall: "Не используйте завершение звонка для всех - это сделает канал недоступным для всех до тех пор, пока вы или другой администратор комнаты не обновите его кнопкой 'Обновить' в правой части строчки канала"
    }
}

