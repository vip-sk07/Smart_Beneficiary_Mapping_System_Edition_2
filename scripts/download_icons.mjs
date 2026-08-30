import fs from 'node:fs';
import https from 'node:https';

const download = (url, path) => new Promise((resolve) => {
    https.get(url, (res) => {
        const fileStream = fs.createWriteStream(path);
        res.pipe(fileStream);
        fileStream.on('finish', () => fileStream.close(resolve));
    });
});

async function run() {
    console.log("Downloading icons...");
    await download('https://ui-avatars.com/api/?name=S&background=1a38f5&color=fff&size=192&font-size=0.6', './public/icon-192.png');
    await download('https://ui-avatars.com/api/?name=S&background=1a38f5&color=fff&size=512&font-size=0.6', './public/icon-512.png');
    console.log("Icons fetched to public directory.");
}

run();
