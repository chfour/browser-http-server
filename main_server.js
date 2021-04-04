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

log("* everything loaded!");
log(`* trying to connect to bridge at ${BRIDGEURL}`);

let ws = new WebSocket(BRIDGEURL);
ws.onmessage = (event) => {
    const data = event.data.toString();
    log("-> " + data);
    const r = new HTTPRequest(data);
    log(`* method: ${r.method} path: ${r.path} version ${r.verStr}`);
    log("* headers:")
    r.headers.entries.forEach(h => log(`${h.name}: ${h.value}`));
}
ws.onopen = () => log("* connected to bridge, waiting for data!");
ws.onclose = () => log("* disconnected from bridge!");
