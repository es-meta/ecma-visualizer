import { Header } from "./layouts";
import ProgramViewer from "./features/ProgramViewer";
import CallStackViewer from "./features/CallStackViewer";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/entrypoints/sidepanel/components/resizable";
import { LoaderCircle } from "lucide-react";
import Test262Viewer from "./features/Test262Viewer";
import { SuspenseBoundary } from "./components/suspense-boundary";

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
          <SuspenseBoundary
            unexpected
            loading={<LoaderCircle className="animate-spin" />}
            error={({ error }) => <aside>{String(error)}</aside>}
          >
            <ProgramViewer />
          </SuspenseBoundary>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          className="relative flex w-full flex-col divide-y divide-neutral-300 overflow-hidden"
          minSize={5}
        >
          <SuspenseBoundary
            unexpected
            loading={<LoaderCircle className="animate-spin" />}
            error={({ error }) => <aside>{String(error)}</aside>}
          >
            <Test262Viewer />
          </SuspenseBoundary>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel
          className="relative flex min-h-0 w-full flex-1 flex-col divide-y divide-neutral-300 overflow-hidden dark:divide-neutral-700"
          minSize={5}
        >
          <SuspenseBoundary
            unexpected
            loading={<LoaderCircle className="animate-spin" />}
            error={({ error }) => <aside>{String(error)}</aside>}
          >
            <CallStackViewer />
          </SuspenseBoundary>
        </ResizablePanel>
      </ResizablePanelGroup>
    </section>
  );
}
