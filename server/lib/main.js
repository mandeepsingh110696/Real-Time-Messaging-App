const WebSocket = require('ws');

const server  = new WebSocket.Server({port:8081},
    ()=>{
        console.log("Server running at port 8081")
    })
const users = new Set();
const recentMessages = [];

const sendMessage = (message) => {
     for(const user of users){
        user.socket.send(JSON.stringify(message));
     }
}
server.on("connection",(socket)=>{
    const useRef = {
        socket:socket,
        lastActiveAt: Date.now()
    }
    users.add(useRef);

    socket.on("message",(message)=>{
        // 1. When a message is received...
        try{
            // 2. ...attempt to parse it,
            const parsedMessage =  JSON.parse(message);

            // 3. then ensure that it is a valid message
            if(typeof parsedMessage.sender !== "string" || typeof parsedMessage.body !== "string"){
                console.log("Invalid message recieved",message);
                return;
            }

            
            const recentMessagesCount = recentMessages.filter((message)=> message.sender === parsedMessage.sender).length

            if(recentMessagesCount >=30){
                socket.close(4000,"Flooding chat");
                return;
            }
           // 4. and if it is, send it!
            const validatedMessage = {
                 sender: parsedMessage.sender,
                 body: parsedMessage.body,
                 sentAt: Date.now()
            }

            sendMessage(validatedMessage);
            useRef.lastActiveAt = Date.now();
            recentMessages.push(validatedMessage);
            setInterval(() => recentMessages.shift(),60000)
        }catch(err){
            // 1b. If the message wasn't valid JSON, JSON.parse would throw an error, which we catch here
            console.log('Error parsing message', err)
        }


    })

    socket.on("close",(code,reason)=>{
        console.log(`user closes connection with ${code} and ${reason}`)
        users.delete(useRef);
    })
})

setInterval(()=>{
    const now = Date.now();
    for(const user of users){
        if(user.lastActiveAt < now - 300000){
            user.socket.close(4000,"Inactivity");
        }
    }
},10000)