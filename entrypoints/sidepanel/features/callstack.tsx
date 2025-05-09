import { ArrowUpIcon, LayersIcon, Trash2Icon } from "lucide-react";
import { useAtom, useAtomValue } from "jotai";

import { callStackAtom, convertedToNameCallStackAtom } from "../atoms/app";
import { SuspenseBoundary } from "../components/suspense-boundary";
import { ErrorConsumer, KnownError } from "../components/ErrorConsumer";
import { Loading } from "../components";
import { Card, CardHeader } from "../components/card";

function CallStackViewerContent() {
  const convertedCallStack = useAtomValue(convertedToNameCallStackAtom);

  return (
    <table className="w-full border-collapse">
      <thead className="sticky top-0 left-0 w-full">
        <tr>
          <th className="th-callstack">#</th>
          <th className="th-callstack">name</th>
          <th className="th-callstack">step</th>
        </tr>
      </thead>
      <tbody>
        {convertedCallStack.map((node, idx) => (
          <tr className="tr-callstack">
            <td className="td-callstack">{idx}</td>
            <td className="td-callstack">{node.callerName}</td>
            <td className="td-callstack">{node.step}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ClearButton() {
  const [callstack, setCallStack] = useAtom(callStackAtom);

  const flush = useCallback(() => {
    setCallStack([]);
  }, [setCallStack]);

  const popCallStack = useCallback(() => {
    setCallStack((cs) => cs.slice(1));
  }, [setCallStack]);

  return callstack.length === 0 ? null : (
    <>
      <button className="text-blue-500 dark:text-blue-400" onClick={flush}>
        Clear
        <Trash2Icon strokeWidth={2} />
      </button>
      <button
        className="text-blue-500 dark:text-blue-400"
        onClick={popCallStack}
      >
        Pop
        <ArrowUpIcon strokeWidth={2} />
      </button>
    </>
  );
}

export function CallStackViewer() {
  const callstack = useAtomValue(callStackAtom);

  return (
    <Card>
      <CardHeader title="CallStack" icon={<LayersIcon />}>
        <ClearButton />
      </CardHeader>
      {callstack.length === 0 ? (
        <KnownError error={callStackEmptyError()} />
      ) : (
        <section className="w-full flex-auto basis-auto overflow-scroll">
          <SuspenseBoundary
            intentional
            error={ErrorConsumer}
            loading={<Loading />}
          >
            <CallStackViewerContent />
          </SuspenseBoundary>
        </section>
      )}
    </Card>
  );
}

