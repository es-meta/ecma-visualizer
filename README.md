[![Chrome Web Store](https://badgen.net/chrome-web-store/v/nlfpedidieegejndiikebcgclhggaocd)](https://chromewebstore.google.com/detail/nlfpedidieegejndiikebcgclhggaocd)

# ECMAScript Visualizer

**ECMAScript Visualizer** is a Chrome extension that provides example programs for each step of the ECMAScript/JavaScript specification [(ECMA-262)](https://tc39.es/ecma262), powered by [ESMeta](https://github.com/es-meta/esmeta).

## Manual Installation Guide

Download the repository and enter the directory:

```
git clone https://github.com/es-meta/ecma-visualizer
cd ecma-visualizer
```

Then, run the following command to build the visualizer:

```
npm install && npm run build
```

And follow the instructions below to install the visualizer extension:

1. Open the Chrome browser and enter `chrome://extensions/`.
2. Turn on the Developer mode on the top right corner.
3. Click the Load unpacked button and select the `ecma-visualizer/dist` directory.

The chrome extension currently works on ES2024 web page: https://tc39.es/ecma262/2024/.
