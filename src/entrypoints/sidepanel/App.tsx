import { Header } from "./layouts";
import {
  CallStackViewer,
  NotifyStrip,
  ProgramViewer,
  Test262Viewer,
} from "./features";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/entrypoints/sidepanel/components/resizable";

export default function App() {
  return (
    <section className="relative flex h-full w-full flex-col divide-y divide-neutral-300 dark:divide-neutral-700">
      <Header />
      <ResizablePanelGroup
        direction="vertical"
        className="flex min-h-0 w-full flex-auto flex-col items-stretch justify-start"
      >
        <ResizablePanel
          className="relative flex min-h-0 w-full flex-col divide-y divide-neutral-300 overflow-hidden dark:divide-neutral-700"
          minSize={5}
        >
          <ProgramViewer />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          className="relative flex w-full flex-col divide-y divide-neutral-300 overflow-hidden"
          minSize={5}
        >
          <Test262Viewer />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          className="relative flex min-h-0 w-full flex-1 flex-col divide-y divide-neutral-300 overflow-hidden dark:divide-neutral-700"
          minSize={5}
        >
          <CallStackViewer />
        </ResizablePanel>
      </ResizablePanelGroup>
      <NotifyStrip />
    </section>
  );
}
