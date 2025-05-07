import React from "react";
import clsx from "clsx";
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
          <TH>#</TH>
          <TH>name</TH>
          <TH>step</TH>
        </tr>
      </thead>
      <tbody>
        {convertedCallStack.map((node, idx) => (
          <TR>
            <TD>{idx}</TD>
            <TD>{node.callerName}</TD>
            <TD>{node.step}</TD>
          </TR>
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

/* aux */

const TR = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <tr
      className={clsx(
        "h-fit py-2 odd:bg-neutral-50 odd:dark:bg-neutral-950",
        className,
      )}
    >
      {children}
    </tr>
  );
};

const TD = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <td
      className={clsx(
        "h-fit border-r border-neutral-300 py-1 text-center text-sm dark:border-neutral-700",
        className,
      )}
    >
      {children}
    </td>
  );
};

const TH = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <th
      className={clsx(
        "border-r border-neutral-300 py-1 text-center text-sm font-medium dark:border-neutral-700",
        className,
      )}
    >
      {children}
    </th>
  );
};
