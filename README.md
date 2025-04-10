# ECMAScript Visualizer

**ECMAScript Visualizer** is a Chrome extension that provides example programs for each part of the ECMAScript/JavaScript specification [(ECMA-262)](https://tc39.es/ecma262). The example programs are served from [`ecma-visualizer-resources`](https://github.com/ku-plrg/ecma-visualizer-resources).

## Installation Guide

Download the repository and enter the directory:

```
git clone https://github.com/ku-plrg/ecma-visualizer
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

## Chrome Extension Release Guide

1. Go to the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Sign in to the developer account
3. Click the **Add new item** button
4. Click **Choose file** > your zip file > **Upload**
