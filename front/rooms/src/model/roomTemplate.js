import { getLaunchParams } from '../bridge/bridgeLib';

export class Room {
    constructor(channels) {
        this.name = "Новая комната";
        this.avatar = "https://i.pinimg.com/736x/5b/9a/50/5b9a50e8d6fda29d8a9ff8cc25b54a66.jpg";
        this.members = [];
        this.channels = channels;
    }


    setName(newName) {
        if (newName && newName.trim !== "")
            this.name = newName
    }


    setAvatar(newAvatar) {
        if (newAvatar && newAvatar.trim !== "")
            this.avatar = newAvatar
    }


    addMember(userID) {
        this.members.push({
            id: userID,
            role: "admin"
        })
    }
}

const EmptyRoomTemplate = [] 

const DefaultRoomTemplate = [
    {
        id: 1,
        name: "Общий"
    },
    {
        id: 2,
        name: "Игровой"
    },
    {
        id: 3,
        name: "Комната отдыха"
    },

]

export const Templates = {
    empty: () => new Room(EmptyRoomTemplate),
    default: () => new Room(DefaultRoomTemplate)
};

