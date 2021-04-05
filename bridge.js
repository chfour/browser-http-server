const WebSocket = require("ws");
const net = require("net");

let wsClient = null;
let tcpClient = null;
const wsServer = new WebSocket.Server({ port: 8081 });
wsServer.on("connection", (ws) => {
    if(wsClient) return ws.close();
    console.log("ws connected");
    wsClient = ws;
    ws.on("message", (data) => {
        data = JSON.parse(data);
        if(data.type === "msg"){
            switch(data.data){
                case "close":
                    if(tcpClient) tcpClient.destroy();
                    break;
            }
        }else if(data.type === "data"){
            data.data = new TextDecoder().decode(new Uint8Array(data.data));
            if(tcpClient) tcpClient.write(data.data);
        }
        console.log(`server: ${data.type} / ${JSON.stringify(data.data)}`);
    });
    ws.on("close", () => {
        wsClient = null;
        console.log("ws closed");
    })
});

const tcpServer = net.createServer((socket) => {
    if(tcpClient || !wsClient) return socket.destroy();
    socket.setEncoding("utf-8");
    console.log("tcp connected");
    tcpClient = socket;
    if(wsClient) wsClient.send(JSON.stringify({
        type: "msg",
        data: "connect"
    }));
    socket.on("data", (data) => {
        console.log(`client: ${JSON.stringify(data)}`);
        if(wsClient) wsClient.send(JSON.stringify({
            type: "data",
            data: Array.from(new TextEncoder().encode(data))
        }));
    });
    socket.on("close", () => {
        tcpClient = null;
        console.log("tcp closed");
        if(wsClient) wsClient.send(JSON.stringify({
            type: "msg",
            data: "disconnect"
        }));
    });
});
tcpServer.listen(8080, "0.0.0.0");

console.log("running!");
