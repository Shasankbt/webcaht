import * as chatFunctions from './chatStorage.js'

const currentUserMsgBoxTemplate = document.querySelector("[message-box]")
const messagesContainer = document.querySelector(".messages-container")

async function loadChat(input){
    console.log('sending request for data', input)
    return new Promise((resolve, reject)=>{
        fetch("/sync-chat-data", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input),
        })
        .then(response => response.json())
        .then(data => {
            resolve(data)
        })
    })
}


function createUserMsgBox(message, time, user = "current-user"){
    const newMsgBox = currentUserMsgBoxTemplate.content.cloneNode(true).children[0]
    if(user === "other-user"){
        newMsgBox.classList.remove("current-user")
        newMsgBox.classList.add("other-user")
    }
    newMsgBox.querySelector("p").innerHTML = message + " ~ " + time
    return newMsgBox 
}

async function resyncChat(){
    const user_chat_data = chatFunctions.getChatData()
    console.log("inital data on client: ", user_chat_data)

    let data = {
        "current_user" : "1",
        "other_user" : "2",
        "sync_data" : {
            "messages" :user_chat_data["messages"].sync,
            "deleted-messages" : user_chat_data["deleted-messages"].sync,
        }
    }
    

    const unsynced_data = await loadChat(data)
    console.log("data from server:", unsynced_data)
    

    user_chat_data["messages"].sync = unsynced_data["messages"].sync
    user_chat_data["deleted-messages"].sync = unsynced_data["deleted-messages"].sync
    user_chat_data["messages"].data = user_chat_data["messages"].data.concat(unsynced_data["messages"].data)   
    user_chat_data["deleted-messages"].data = user_chat_data["deleted-messages"].data.concat(unsynced_data["deleted-messages"].data)   
    
    console.log("synced data to client:", user_chat_data)
    chatFunctions.storeChatData(user_chat_data)

    // unsynced_data.unsynced_data.forEach(message_data=>{
    //     messagesContainer.appendChild(createUserMsgBox(message_data.message, message_data.timestamp, "other-user"))
    // })
}

resyncChat()

