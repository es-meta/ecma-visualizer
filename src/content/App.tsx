import Visualizer from "./Visualizer/Visualizer.tsx";

const logo = chrome.runtime.getURL("images/logo.jpeg");

const App = () => {
  return (
    <section className="overflow-hidden flex flex-col flex-auto divide-neutral-300 divide-y fixed w-dvw h-[450px] bottom-0 left-0 z-[999] bg-[#f5f5f5] shadow-[0_-2px_4px_rgba(0,0,0,0.1)]">
      <VisualizerHeader />
      <Visualizer />
    </section>
  );
};

const VisualizerHeader = () => {
  return (
    <header className="bg-white text-sm py-3 px-4 gap-5 flex flex-row items-center">
      <div className="font-semibold text-lg flex flex-row gap-2 items-center grow-0 shrink-0 basis-auto">
        <img src={logo} className="h-6 w-6" />
        ECMAVisualizer
      </div>
      <div className="flex flex-row gap-2 items-center">
        <div className="text-neutral-500 hover:text-neutral-700 cursor-pointer">
          Docs
        </div>
        <div className="text-neutral-500 hover:text-neutral-700 cursor-pointer">
          Playground
        </div>
        <div className="text-neutral-500 hover:text-neutral-700 cursor-pointer">
          GitHub
        </div>
      </div>
    </header>
  );
};

export default App;
