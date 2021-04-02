const log = text => document.getElementById("log").textContent += text + "\n";
const BRIDGEURL = "ws://127.0.0.1:8081/";

log("everything loaded!");
log(`trying to connect to bridge at ${BRIDGEURL}`);

let ws = new WebSocket(BRIDGEURL);
ws.onmessage = (event) => {
    const data = event.data.toString().trimRight();
    log("-> " + data);
    log("<- " + data);
    ws.send(event.data);
}
ws.onopen = () => {
    log("connected to bridge!");
}
ws.onclose = () => {
    log("disconnected from bridge!");
}
