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
        console.log(`server: ${JSON.stringify(data)}`);
        if(tcpClient) tcpClient.write(data);
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
    socket.on("data", (data) => {
        console.log(`client: ${JSON.stringify(data)}`);
        if(wsClient) wsClient.send(data);
    });
    socket.on("close", () => {
        tcpClient = null;
        console.log("tcp closed");
    });
});
tcpServer.listen(8080, "0.0.0.0");

console.log("running!");
