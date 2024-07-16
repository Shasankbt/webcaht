// Store chat data
function storeChatData(chatData) {
    localStorage.setItem('chatData', JSON.stringify(chatData));
}

// Retrieve chat data
function getChatData() {
    const data = localStorage.getItem('chatData');
    if(data === null){
        console.log("no initial data")
        return {
            "messages": {
                "data": [],
                "sync": 0
            },
            "deleted-messages": {
                "data": [],
                "sync": 0
            }
        }
    }
    return JSON.parse(data)
}

// Add a chat message
function addChatMessage(user, message, timestamp) {
    const chatData = getChatData();
    chatData[timestamp] = [user, message];
    storeChatData(chatData);
}

export {storeChatData, getChatData}