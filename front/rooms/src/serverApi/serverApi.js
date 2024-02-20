import { getAccessToken, clearTheStorage, getFromStorage, getLaunchParams, getVkUserId, pushToStorage, createJoinCallLink } from "../bridge/bridgeLib";
import { VkStorageKeys } from "../bridge/storageKeys";
import { ServerApiUrl } from "../config";

export class RoomInfo {
    constructor(id, name, avatar, members, channels) {
        this.id = id;
        this.name = name;
        this.avatar = avatar;
        this.members = members;
        this.channels = channels;
        this.isFavourite = false;
    }

    setFavourite(isFav) {
        if (isFav === this.isFavourite) return

        this.isFavourite = isFav;

        if (isFav) {
            getFromStorage(VkStorageKeys.FavouriteRooms).then(favRooms => pushToStorage(VkStorageKeys.FavouriteRooms, favRooms + ',' + this.id))
        } else {
            getFromStorage(VkStorageKeys.FavouriteRooms).then(favRooms => pushToStorage(VkStorageKeys.FavouriteRooms, favRooms.replaceAll(this.id, "").replaceAll(",,","")))
        }
    }
}

async function requestServer(request, data) {
    let response = undefined;
    let authToken = window.location.search.slice(1)
    await fetch(`${ServerApiUrl}/${request}`, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            "Authorization": authToken
        },
        body: JSON.stringify(data)
    })
        .then(data => data.json())
        .then((json) => response = json)
        .catch(error => {
            console.error(error);
            alert(error)
        })
    console.log(request, " response:\n", response)
    return response;
}

async function requestServerFile(request, data) {
    let response = undefined;
    let authToken = window.location.search.slice(1)
    await fetch(`${ServerApiUrl}/${request}`, {
        method: "post",
        headers: {
            "Authorization": authToken
        },
        body: data
    })
        .then(data => data.json())
        .then((json) => response = json)
        .catch(error => {
            console.error(error);
            alert(error)
        })
    console.log(request, " response:\n", response)
    return response;
}

export async function getJoinedRoomInfos() {
    let ids = await getFromStorage(VkStorageKeys.JoinedRooms);
    ids = ids.split(',').filter(x => x !== '');

    let rooms = [];
    let response = await requestServer("rooms/get", { room_ids: ids });
    if (response.rooms) rooms = response.rooms.map(x => Object.assign(new RoomInfo, x));
    let favIds = (await getFromStorage(VkStorageKeys.FavouriteRooms)).split(',').filter(x => x !== '');
    for (let room of rooms) {
        if (favIds.includes(room.id)) {
            room.isFavourite = true;
        }
    }
    return rooms;
}

export async function joinRoom(id) {
    getFromStorage(VkStorageKeys.JoinedRooms).then(joinedRooms => pushToStorage(VkStorageKeys.JoinedRooms, joinedRooms + ',' + id))
    let response = await requestServer("rooms/join", { room_id: id });
    return response.room;
}

export async function createRoom(newRoom) {
    console.log("server_api room", newRoom)
    newRoom.addMember((await getLaunchParams()).vk_user_id)
    await fillJoinLinks(newRoom)
    
    getFromStorage(VkStorageKeys.JoinedRooms).then(joinedRooms => pushToStorage(VkStorageKeys.JoinedRooms, joinedRooms + ',' + newRoom.id))
    let response = await requestServer("rooms/create", { room_data: newRoom });
    return response.room;
}

export async function deleteRoom(id) {
    let response = await requestServer("rooms/delete", { room_id: id });
    return response.room;
}

async function fillJoinLinks(room) {
    console.log("filling in joinlinks", room)
    for (let index = 0; index < room.channels.length; index++) {
        let element = room.channels[index];
        if (!element.joinlink) await createJoinCallLink(x => element.joinlink = x)
    }
    console.log("room with links", room)
}

export async function editChannel(room) {
    console.log("edit channel", room)
    await fillJoinLinks(room)
    let response = await requestServer("rooms/update", {room_data: room})
    return response.room
}

export async function uploadImage(imageData) {
    let response = await requestServerFile("rooms/uploadImage",  imageData)
    return response.response
}
