import * as chatFunctions from './chatStorage.js'

const currentUserMsgBoxTemplate = document.querySelector("[message-box]")
const messagesContainer = document.querySelector(".messages-container")
const sendButton = document.querySelector("#send-msg-button")
const messageTextArea = document.querySelector("#message")

function createUserMsgBox(message, time){
    const newMsgBox = currentUserMsgBoxTemplate.content.cloneNode(true).children[0]
    newMsgBox.querySelector("p").innerHTML = message + " ~ " + time
    return newMsgBox 
}

async function updateSentMessageToServer(message_object){
    return new Promise((resolve, reject)=>{
        const input = {
            // !!! this is user id, update this later when the variable is introduced !!!
            "current_user" : "1",
            "other_user" : "2",
            "sync_data" : {
                "messages" :{
                    "data" : [message_object],
                    "sync" : message_object.timestamp
                },
                "deleted-messages" : {
                    "data" : [],
                    "sync" : null
                },
            }  
        }
        console.log("data sent to server:", input)
        fetch("./update-chat", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(input) 
        })
        .then(response => {
            if(response.ok){
                // ## update the ui on the client to indicate message has been sent
                return response.json()
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .then(data => {
            console.log("message sent to server, recent sync :", data)
            resolve(data.sync)
        })
    })
}

async function sendMessage(message){
    const currentUserMsgBoxTemplate = document.querySelector("[message-box]")
    const messagesContainer = document.querySelector(".messages-container")
    const sendButton = document.querySelector("#send-msg-button")
    const messageTextArea = document.querySelector("#message")

    if(message === ""){
        console.warn("empty message")
        return
    }

    let messages_metadata = chatFunctions.getChatData()["messages"]
    let message_object = {
        // !!! this is user id, update this later when the variable is introduced !!!
        id : "1",
        timestamp : Date.now(),
        message : message
    }

    console.log("sent message:", message_object)
    messages_metadata.data.push(message_object)
    messages_metadata.sync = message_object.timestamp

    const server_synced_time = await updateSentMessageToServer(message_object)

    messages_metadata.sync = server_synced_time
    messages_metadata.data[messages_metadata.data.length - 1].timestamp = server_synced_time


}

sendButton.addEventListener("click", (e)=>{
    e.preventDefault()
    sendMessage(messageTextArea.value)
    messageTextArea.value = ""
    // const message = messageTextArea.value
    // const time = Date.now()
    // if(message === ""){
    //     console.warn("empty message")
    // }
    // else{
    //     messagesContainer.appendChild(createUserMsgBox(message, time))
    //     setTimeout(()=>{
    //          messageTextArea.value = ""
    //     }, 1000)
    //     //
    // }
})