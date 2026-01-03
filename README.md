[![Chrome Web Store](https://badgen.net/chrome-web-store/v/nlfpedidieegejndiikebcgclhggaocd)](https://chromewebstore.google.com/detail/nlfpedidieegejndiikebcgclhggaocd)

# ECMAScript Visualizer

**ECMAScript Visualizer** is a Chrome extension that provides example programs for each step of the ECMAScript/JavaScript specification [(ECMA-262)](https://tc39.es/ecma262), powered by [ESMeta](https://github.com/es-meta/esmeta).

## Manual Installation Guide (Chrome)

Download the repository and enter the directory:

```
git clone https://github.com/es-meta/ecma-visualizer
cd ecma-visualizer
```

Then, run the following command to build the visualizer:

```bash
$ npm install && npm run build
```

And follow the instructions below to install the visualizer extension:

1. Open the Chrome browser and enter `chrome://extensions/`.
2. Turn on the Developer mode on the top right corner.
3. Click the Load unpacked button and select the `ecma-visualizer/.output/chrome-mv3` directory.

The chrome extension currently works on ES2025 web page: https://tc39.es/ecma262/2025/.

## Other Browsers

While other browsers like Firefox and Edge are not officially supported, the project includes polyfills and can be built targeting those browsers. You can try the following steps:

```bash
$ npm install
$ npx tsc -b && npx wxt build -b firefox   # for Firefox
$ npx tsc -b && npx wxt build -b edge      # for Microsoft Edge
```

The built extension will be located in the `.output` directory. To install the extension, refer to your browser’s documentation on loading unpacked extensions. Note that compatibility may vary.
