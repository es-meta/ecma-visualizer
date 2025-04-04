import Visualizer from "./visualizer/Visualizer.tsx";
import { Dialog, DialogPanel, Field, Label, Select } from "@headlessui/react";
import { ReactNode, useState } from "react";
import { Settings } from "lucide-react";
import useStorage from "./visualizer/hooks/useStorage.ts";
import { Loading } from "./components/Loading.tsx";
import { Error } from "./components/Error.tsx";

const logo = chrome.runtime.getURL("images/logo.jpeg");

export type Response = {
  secId: string;
  step: string;
};

const App = () => {
  const [width, setWidth] = useState<number>(700);
  const { loading, error, storage } = useStorage();

  return (
    <section
      className="relative flex h-full flex-col divide-y divide-neutral-300 bg-[#f5f5f5] shadow-[-4px_0_4px_rgba(0,0,0,0.1)]"
      style={{ width: width }}
    >
      <VisualizerHeader width={width} setWidth={setWidth} />
      {loading ? (
        <Loading />
      ) : error ? (
        <Error error={error} />
      ) : (
        <Visualizer storage={storage} />
      )}
    </section>
  );
};

const VisualizerHeader = ({
  width,
  setWidth,
}: {
  width: number;
  setWidth: React.Dispatch<React.SetStateAction<number>>;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="z-[999] flex flex-row items-center justify-between bg-white px-4 py-2 text-sm">
      <div className="flex flex-row items-center gap-2">
        <img src={logo} className="h-6 w-6" />
        <div className="text-base font-extrabold">ESMeta</div>
        <div className="text-base font-normal">ECMA Visualizer</div>
      </div>
      <div className="flex flex-row items-center gap-2">
        <A href={import.meta.env.VITE_ESMETA_URL}>
          <GitHubIcon />
          ESMeta
        </A>
        <A href={import.meta.env.VITE_ECMAVISUALIZER_URL}>
          <GitHubIcon />
          ECMA Visualizer
        </A>
        <Settings
          className="h-5 w-5 cursor-pointer"
          onClick={() => setIsOpen(true)}
        />
        <Dialog
          open={isOpen}
          onClose={() => setIsOpen(false)}
          className="relative z-50"
        >
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="flex flex-col gap-4 rounded-sm border bg-white p-12 shadow-lg">
              <Field className="flex flex-row items-center gap-2 text-lg">
                <Label>Width</Label>
                <Select
                  name="width"
                  value={width}
                  className="text-base"
                  onChange={(e) => setWidth(Number(e.target.value))}
                >
                  <option value={500}>500px</option>
                  <option value={700}>700px</option>
                  <option value={900}>900px</option>
                  <option value={1100}>1100px</option>
                  <option value={1300}>1300px</option>
                </Select>
              </Field>

              <Field className="flex flex-col gap-1 text-lg">
                <Label>Resource URL</Label>
                <a className="text-sm" href={import.meta.env.VITE_RESOURCE_URL}>
                  {import.meta.env.VITE_RESOURCE_URL}
                </a>
              </Field>

              <Field className="flex flex-col gap-1 text-lg">
                <Label>Double Debugger URL</Label>
                <a
                  className="text-sm"
                  href={import.meta.env.VITE_DOUBLE_DEBUGGER_URL}
                >
                  {import.meta.env.VITE_DOUBLE_DEBUGGER_URL}
                </a>
              </Field>

              <button
                className="ml-auto cursor-pointer rounded-md px-2 py-1 hover:bg-blue-500 hover:text-white"
                onClick={() => setIsOpen(false)}
              >
                confirm
              </button>
            </DialogPanel>
          </div>
        </Dialog>
      </div>
    </header>
  );
};

const A = ({ href, children }: { href: string; children: ReactNode }) => {
  return (
    <a
      href={href}
      target="_blank"
      className="font-500 flex cursor-pointer flex-row items-center gap-1 rounded-lg p-2 text-xs !text-black transition-all hover:bg-neutral-100 hover:text-black hover:no-underline active:scale-90"
    >
      {children}
    </a>
  );
};

const GitHubIcon = () => {
  return (
    <svg
      aria-disabled
      fill="currentColor"
      width={14}
      height={14}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
};

export default App;
