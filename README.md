# browser-http-server

An HTTP server, that runs... in the browser\*.

\*requires natively running bridge, browsers can't do TCP

## currently implemented features

- [x] Parsing HTTP requests
- [x] Responding to HTTP requests
- [x] Technically it can serve images and other media
- [ ] Simultaneously handling multiple clients
- [ ] Detecting invalid requests and responding accordingly

## how to use

First, run `npm i` to install dependencies.

To start the bridge (we'll need it later), run:

```text
npm start
```

Now, start python's http.server:

```text
python3 -m http.server 8000
```

> note: don't use port 8080 or 8081

Then, open `http://127.0.0.1:8000/`. This will start the server. *I know, it's getting complicated.*
You should see a "connected to bridge" message.

Now you can open `http://127.0.0.1:8080/`, which will display a Hello World served from your browser, and displayed... also... in... your browser.

As weird as that may sound, it totally works. Somehow.

You can also use curl:

```text
curl http://127.0.0.1:8080/ -v
```

You should see all the headers displayed, followed by `<h1>Hello World!</h1>`.

## how it works

The bridge we started allows the browser to listen on TCP ports. It basically acts as a kind of "pipe", that on one side accepts TCP connections, and communicates with the browser through a websocket on the other side.

Here's what a communication between the two sides might look like:

```text
// -> = bridge to browser
// <- = browser to bridge

-> {"type":"msg","data":"connected"} // client connects
-> {"type":"data","data":[97,97,97,97]} // client sends "aaaa"
<- {"type":"data","data":[65,65,65,65]} // server responds with "AAAA"
-> {"type":"msg","data":"disconnected"} // client disconnects
```

As you can see, these "packets" are JSON objects. This allows the bridge to communicate messages like a client disconnecting to the browser. Additionally, the browser can also send commands to the bridge, but this feature is currently not used anywhere.

When a client connects and sends some data, that data is sent to the bridge, which forwards it over to the browser.

The data gets to the browser, it's parsed, and a response is created, which is then sent back to the bridge, which sends it to the client.

## contributing?

If anyone wants to improve this utterly useless gimmick, pull requests are very welcome.
