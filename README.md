# hypervision

`hypervision` is a p2p livestreaming tool. It lets you broadcast both audio and video to an infinite number of users.

When viewers connect, they distribute the stream amongst each other. This allows the broadcast to scale to large audiences without incurring the bandwidth costs usually associated with live streaming.

`hypervision` is built on top of [hypercore](https://github.com/mafintosh/hypercore) & [hyperdiscovery](https://github.com/karissa/hyperdiscovery), both of which help facilitate the p2p networking which connects broadcasters and viewers together.

![hypervision screenshot](screenshot.png)

## Installation
```
git clone git://github.com/mafintosh/hypervision.git
cd hypervision

npm install
npm run rebuild
npm start
```

## License

MIT
