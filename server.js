import fs from 'fs';
import express from "express";

const app = express()
const port = 5000

// to send user chat data and credentials
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// to render pages
app.set('view-engine','ejs')

app.listen(port)
app.use(express.static('public'));
app.use('/chat_data', express.static('chat_data'));

app.get("/", (req,res)=>{
    res.render('home.ejs') 
})

// let syncMatrix = JSON.parse(fs.readFileSync("chat_storage/sync_matrix.json"))
let chatAddress = JSON.parse(fs.readFileSync("chat_storage/chat_address.json"))

// console.log(syncMatrix)

function getChatAddress(current_user, other_user){
    const chat_data_dir = "chat_storage/chat_data/"
    const [user1, user2] = [current_user, other_user].sort();
    return `${chat_data_dir}${user1}_${user2}.json`
}

app.post("/sync-chat-data", (req,res)=>{
    const req_data = req.body
    console.log("request data" , req_data)

    function getChatData(req_data){
        const current_user = req_data.current_user
        const other_user = req_data.other_user
        const client_sync_list = req_data.sync_data

        

        function filterData(chat_metadata, sync_list){
            let messages_data = chat_metadata["messages"].data
            let deleted_messages_data = chat_metadata["deleted-messages"].data
            let messages_start_idx = 0
            let deleted_msgs_start_idx = 0
            let messages_end_idx = messages_data.length - 1
            let deleted_msgs_end_idx = deleted_messages_data.length -1 

            while(messages_start_idx <= messages_end_idx){
                if(messages_data[messages_start_idx].timestamp > sync_list["messages"])
                    break
                messages_start_idx += 1
            }
            
            while(deleted_msgs_start_idx <= deleted_msgs_end_idx){
                if(deleted_messages_data[deleted_msgs_start_idx].timestamp >sync_list["deleted-messages"])
                    break
                deleted_msgs_start_idx += 1
            }

            chat_metadata["messages"].data = chat_metadata["messages"].data.slice(messages_start_idx)
            chat_metadata["deleted-messages"].data = chat_metadata["deleted-messages"].data.slice(deleted_msgs_start_idx)
            
            console.log("unsynced filtered data :", chat_metadata)
            
            return chat_metadata
        }

        function serverLastSync(){
            const [user1, user2] = [current_user, other_user].sort();
            return syncMatrix[user1-1][user2-1]
        }

        
        // console.log("chat data address :", getChatAddress(req_data))
        const chat_metadata = JSON.parse(fs.readFileSync(getChatAddress(current_user, other_user), 'utf8'))
        console.log("full data: ", chat_metadata)
        return  filterData(chat_metadata, client_sync_list)
    }

    res.json(getChatData(req_data))

    // const chat_data = JSON.parse(fs.readFileSync("chat_data/" + address, 'utf8'))
    // console.log(chat_data)
    // res.json({chat_data})
})

app.post("/update-chat", (req, res)=>{
    console.log("req data:", req.body)
    
    const req_messages_metadata = req.body.sync_data["messages"]
    const file_location = getChatAddress(req.body.current_user, req.body.other_user)
    const chat_data = JSON.parse(fs.readFileSync(file_location, "utf8"))

    const server_update_time = Date.now()
    req_messages_metadata.data.forEach(msg => {msg.timestamp = server_update_time})
    chat_data["messages"].data = chat_data["messages"].data.concat(req_messages_metadata.data)
    chat_data["messages"].sync = server_update_time

    // !!! do the similar step above for deleting messages !!!

    fs.writeFileSync(file_location, JSON.stringify(chat_data))
    res.json({sync : server_update_time})

    console.log("updated the data:", chat_data)
})

app.post("/send-message", (req, res)=>{
    console.log("message:" ,req.body.message)
})