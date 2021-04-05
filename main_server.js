const log = text => {console.log(text); document.getElementById("log").value += text + "\n";}
const strfy = JSON.stringify;

const BRIDGEURL = "ws://127.0.0.1:8081/";

const parseHeader = ln => [ln.slice(0, ln.indexOf(": ")), ln.slice(ln.indexOf(": ")+2)];

class HTTPHeader{
    constructor(name, value){
        this.name = name;
        this.value = value;
    }
    toString(){
        return `${this.name}: ${this.value}`;
    }
}
class HTTPHeaders{
    constructor(values=null){
        this.entries = [];
        if(values) values.entries().forEach(([k, v]) => {
            this.entries.push(new HTTPHeader(k, v));
        });
    }
    set(k, v){
        const foundheader = this.entries.find(h => h.name === k);
        if(foundheader){
            foundheader.value = v;
        }else{
            this.entries.push(new HTTPHeader(k, v));
        }
    }
    toString(){
        return this.entries.join("\r\n");
    }
}

class HTTPRequest{
    headers = new HTTPHeaders();
    constructor(reqData){
        this.raw = reqData;
        const lines = this.raw.split(/\r?\n/).filter(a => a.length > 0);
        this.reqLine = lines.shift();
        this.method = this.reqLine.split(" ")[0];
        this.path = this.reqLine.split(" ")[1];
        this.verStr = this.reqLine.split(" ")[2];
        for(const ln of lines){
            const [name, value] = parseHeader(ln);
            this.headers.set(name, value);
        }
    }
}

class HTTPResponse{
    headers = new HTTPHeaders();
    constructor(data, code=200, mimeType="text/plain", headers=null){
        this.body = data;
        this.type = mimeType;
        this.code = code; this.reason = "";
        this.verStr = "HTTP/1.0";
        this.date = new Date();
        this._updateHeaders();
        if(headers) headers.entries.forEach(h => this.headers.set(h.name, h.value));
    }
    _updateHeaders(){
        this.headers.set("Date", this.date.toUTCString());
        this.headers.set("Server", navigator.userAgent);
        this.headers.set("Content-Length", this.body.length);
        this.headers.set("Content-Type", this.type);
    }
    toString(){
        this._updateHeaders();
        const lines = [];
        lines.push(`${this.verStr} ${this.code} ${this.reason}`);
        lines.push(this.headers.toString()); lines.push("");
        lines.push(this.body);
        return lines.join("\r\n");
    }
}

const handler = r => {
    return new HTTPResponse(`Hello World!\npath: ${r.path}\n`, 200, "text/plain");
}

log("* everything loaded!");
log(`* trying to connect to bridge at ${BRIDGEURL}`);

let ws = new WebSocket(BRIDGEURL);
ws.onmessage = event => {
    const data = JSON.parse(event.data);
    if(data.type === "data"){
        data.data = new TextDecoder().decode(new Uint8Array(data.data));
        log("-> " + data.data);
        const r = new HTTPRequest(data.data);
        log(`* method: ${r.method} path: ${r.path} version ${r.verStr}`);
        log("* headers:");
        r.headers.entries.forEach(h => log(h.toString()));
        const response = handler.apply(this, [r]);
        response.verStr = r.verStr;
        log("* response:");
        log(`* code: ${response.code} type: ${response.type} version ${response.verStr}`);
        log("<- " + response.toString());
        ws.send(JSON.stringify({
            type: "data",
            data: Array.from(new TextEncoder().encode(response.toString()))
        }))
    }else if(data.type === "msg"){
        switch(data.data){
            case "connect":
                log("* client connected!");
                break;
            case "disconnect":
                log("* client disconnected");
                break;
        }
    }
    
}
ws.onopen = () => log("* connected to bridge, waiting for data!");
ws.onclose = () => log("* disconnected from bridge!");
