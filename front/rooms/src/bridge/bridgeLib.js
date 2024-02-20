import bridge from "@vkontakte/vk-bridge";
import { AppId, base64Yasen } from "../config";
import { joinRoom } from "../serverApi/serverApi";
import { VkStorageKeys } from "./storageKeys";
import { imageTemplate, joinRoomImg, yasenImg } from "../Base64Image";

export var joinRoomOnStart = undefined
const Scopes = {
    friends: "friends",
    photos: "photos",
    audio: "audio",
    video: "video",
    stories: "stories",
    pages: "pages",
    menu: "menu",
    status: "status",
    notes: "notes",
    messages: "messages",
    wall: "wall",
    ads: "ads",
    offline: "offline",
    docs: "docs",
    groups: "groups",
    notifications: "notifications",
    stats: "stats",
    email: "email",
    market: "market",
    phone_number: "phone_number"
}

export async function getAccessToken() {
    let accessToken = undefined
    let scopes = Array.from(arguments)
    if (scopes.length > 0) scopes = scopes.join(",")
    else scopes = ''

    await bridge.send('VKWebAppGetAuthToken',
        {
            app_id: AppId,
            scope: scopes
        })
        .then(data => {
            if (data.access_token) accessToken = data.access_token
        })
        .catch(error => {
            console.log(error)
        })
    return accessToken
}

var cachedStorage = {}
var launchParams = undefined

export function pushToStorage(key, value) {
    cachedStorage[key] = value;
    bridge.send('VKWebAppStorageSet', {
        key: key,
        value: value
    })
        .then((data) => {
            if (data.result) console.log(`pushed to storage '${key}' with value:\n${value}`)
            else console.error(`failed to push to storage '${key}' with value:\n${value}`)
        })
        .catch((error) => {
            console.log(error);
        });
}



export function clearTheStorage(key) {
        bridge.send('VKWebAppStorageSet', {
            key: key,
            value: ""
        })
            .then((data) => {
                if (data.result) {
                    console.log('you storage clear')
                }
            })
            .catch((error) => {
                "storogae not clear"
                console.log(error);
            });
}

export async function getFromStorage(key) {
    if (key in cachedStorage) {
        return cachedStorage[key]
    }
    let value = undefined;
    await bridge.send('VKWebAppStorageGet', {
        keys: [key]
    })
        .then((data) => {
            if (data.keys) {
                value = data.keys[0].value;
            }
        })
        .catch((error) => {
            console.log(error);
        });
    return value;
}

export async function getLaunchParams() {
    await bridge.send('VKWebAppGetLaunchParams')
        .then((data) => {
            if (data.vk_app_id) {
                launchParams = data
            }
        })
        .catch((error) => {
            console.log(error);
        });
    return launchParams;
}

export async function getVkUserId() {
    launchParams = await getLaunchParams()
    return launchParams.vk_user_id
}

function getCustomParams() {
    const hashString = window.location.hash.substring(1);

    const pairs = hashString.split('&');

    const params = {};

    pairs.forEach(pair => {
        const [key, value] = pair.split('=');
        params[key] = decodeURIComponent(value);
    });

    return params;
}

export async function createInviteURL(room_id) {
    const baseAppUrl = "https://vk.com/app";
    const vk_app_id = (await getLaunchParams()).vk_app_id
    const invitationLink = `${baseAppUrl}${vk_app_id}#room_id=${room_id}`;
    return invitationLink
}

export async function shareInviteLink(room_id) {
    bridge.send('VKWebAppShare', {
        link: await createInviteURL(room_id)
        })
        .then((data) => { 
          if (data.result) {
            copyToClipboard(invitationLink)
          }
        })
        .catch((error) => {
          console.log(error);
        });
}


export async function copyToClipboard(text) {
    bridge
        .send("VKWebAppCopyText", {
            text: text,
        })
        .then((data) => {
            if (data.result) {
                console.log("successfully copied");
            }
        })
        .catch((error) => {
            console.log(error);
        });
}



export async function initializeApp() {
    await bridge.send("VKWebAppInit");
    bridge.send('VKWebAppGetAds')
    checkAds();
    showSlidec(imageTemplate);
    var customParams = getCustomParams()

    if (customParams.room_id) {
        joinRoomOnStart = await joinRoom(customParams.room_id)
    }

}

export function showAd(skipCounter = false) {
    if (!skipCounter) {
        let counter = localStorage.getItem("ads_show_counter")

        if (counter == null) counter = 1
        else counter = Number(counter)

        localStorage.setItem("ads_show_counter", `${counter + 1}`)
        if (counter == 1) return;
        if (counter % 3 == 0) return;
    }

    bridge.send("VKWebAppShowNativeAds", {
        ad_format: 'interstitial'
    })
}

async function checkAds() {
    while (true) {
        await new Promise(resolve => setTimeout(resolve, 10000))
        
        bridge.send("VKWebAppCheckNativeAds", {
            ad_format: 'interstitial'
        })
    }
}

export async function createJoinCallLink(onCreated) {
    await bridge.send('VKWebAppCallStart')  
        .then((data) => { 
        if (data.result) {
            onCreated(data.join_link)
        }
        })
        .catch((error) => {
        // Ошибка
        console.log(error);
        });
}

export function joinCall(joinlink, onError) {
    bridge.send('VKWebAppCallJoin', {
        join_link: joinlink
        })
        .catch((error) => {
            onError()
            console.log(error);
        });
}

export async function showSlidec(imageTemplate) {
    
    const storageData = await getFromStorage(VkStorageKeys.ViewHint)
    if (storageData) {
        return
    }

    bridge.send('VKWebAppShowSlidesSheet', {
        slides: [
            {
                media: {
                  blob:  imageTemplate["yasenImg"],
                  type: 'image'
                },
                title: 'Добро пожаловать в Комнаты!',
                subtitle: 'Комнаты - это место, в котором ты с простотой можешь создать комфортное место для общения!'
              },
          {
            media: {
                blob:  imageTemplate["joinRoomImg"],
                type: 'image'
              },
              title: 'Общайся!',
              subtitle: 'Заходи в комнаты, созданным другими пользователями!'
          },
          {
            media: {
              blob:  imageTemplate["createRoomImg"],
              type: 'image'
            },
            title: 'Создай свою комнату!',
            subtitle: 'Просто кликни по кнопке внизу экнара!'
          },
          {
            media: {
              blob:  imageTemplate["inviteFriends"],
              type: 'image'
            },
            title: 'Позови друзей!',
            subtitle: 'Тапни по названию комнаты и поделись комнатой с друзьями!'
          },
          {
            media: {
                blob:  imageTemplate["joinChannelImg"],
                type: 'image'
              },
              title: 'Начни общаться!',
              subtitle: 'Чтобы подключиться к звонку, достаточно нажать на нужный тебе канал!'
          },
          {
            media: {
                blob:  imageTemplate["yasenImg"],
                type: 'image'
              },
              title: 'Удачи!',
              subtitle: 'Вот и все, что тебе нужно знать о Комнатах, отличных тебе посиделок и приятных бесед!'
          }

         ]})
        .then((data) => { 
          if (data.result) {
            // Слайды показаны
            pushToStorage(VkStorageKeys.ViewHint, "1")
          }
        })
        .catch((error) => {
          // Ошибка
          console.log(error);
        });
}