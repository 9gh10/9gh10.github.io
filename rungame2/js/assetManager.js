export default class AssetManager {
    constructor() {
        this.assets = {};
        this.numAssetsLoaded = 0;
        this.numAssetsTotal = 0;
    }

    loadAsset(name, path) {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.src = path;
            image.onload = () => {
                this.assets[name] = image;
                this.numAssetsLoaded++;
                resolve(image);
            };
            image.onerror = (err) => {
                console.error(`Failed to load asset: ${name} at ${path}`);
                reject(err);
            };
        });
    }

    async loadAll(assetList) {
        this.numAssetsTotal = assetList.length;
        const promises = assetList.map(asset => this.loadAsset(asset.name, asset.path));
        await Promise.all(promises);
        console.log('All assets loaded.');
    }

    getAsset(name) {
        return this.assets[name];
    }
}