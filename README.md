# hypervision

`hypervision` is a desktop application that lets you both watch and broadcast p2p live streams.

When users connect to a stream, they distribute the data they receive amongst each other. This bypasses the need for a central server, and the huge amount of bandwidth required to deliver the same data to every user.

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
