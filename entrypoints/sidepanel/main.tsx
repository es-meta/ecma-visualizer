import { createRoot } from "react-dom/client";
import "./globals.css";
import App from "./App";
import { Provider } from "jotai";
import { AtomSynchronizer } from "./atoms/effect";
import { jotaiStore } from "./atoms/store";

createRoot(document.getElementById("root")!).render(
  <Provider store={jotaiStore}>
    <App />
    <AtomSynchronizer />
  </Provider>,
);
