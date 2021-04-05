# browser-http-server

An HTTP server, that runs... in the browser\*.

*\*requires natively running bridge, browsers can't do TCP*

## currently implemented features

- [x] Parsing HTTP requests
- [x] Responding to HTTP requests
- [x] Technically it can serve images and other media
- [ ] Simultaneously handling multiple clients
- [ ] Detecting invalid requests and responding accordingly

## how to use

First, run `npm i` to install dependencies.

To start the bridge (we'll need it later), run:

```
npm start
```

Now, start python's http.server:

```
python3 -m http.server 8000
```

> note: don't use port 8080 or 8081

Then, open `http://127.0.0.1:8000/`. This will start the server. *I know, it's getting complicated.*
You should see a "connected to bridge" message.

Now you can open `http://127.0.0.1:8080/`, which will display a Hello World served from your browser, and displayed... also... in... your browser.

As weird as that may sound, it totally works. Somehow.

You can also use curl:

```
curl http://127.0.0.1:8080/ -v
```

You should see all the headers displayed, followed by `<h1>Hello World!</h1>`.

## contributing?

If anyone wants to improve this utterly useless gimmick, pull requests are very welcome.
