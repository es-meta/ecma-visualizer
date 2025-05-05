import React from "react";
import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { Layers, Eraser, Mouse } from "lucide-react";

// import useCallStack from "./hooks/useCallStack";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

import {
  secIdToFuncIdAtom,
  secIdToFuncNameAtom,
  selectionAtom,
  test262IdToTest262Atom,
  callStackAtom,
  convertedToNameCallStackAtom,
} from "../atoms/app";

function CallStackViewerContent() {
  const convertedCallStack = useAtomValue(convertedToNameCallStackAtom);

  const setCallStack = useSetAtom(callStackAtom);
  const popCallStack = useCallback(() => {
    setCallStack((cs) => [...cs.slice(0, -1)]);
  }, [setCallStack]);

  return (
    <table className="w-full border-collapse">
      <thead className="sticky top-0 left-0 w-full">
        <tr>
          <TH>#</TH>
          <TH>name</TH>
          <TH>step</TH>
          <TH>pop</TH>
        </tr>
      </thead>
      <tbody>
        {convertedCallStack.map((node, idx) => {
          const { callerName, step } = node;

          return (
            <TR>
              <TD className="px-2 text-sm">{idx}</TD>
              <TD>{callerName}</TD>
              <TD className="px-2">{step}</TD>
              <td className="px-2 text-center">
                {idx === 0 && (
                  <Trash2
                    size={15}
                    className="inline cursor-pointer text-neutral-300 hover:text-neutral-500"
                    onClick={popCallStack}
                  >
                    x
                  </Trash2>
                )}
              </td>
            </TR>
          );
        })}
      </tbody>
    </table>
  );
}

export const TR = ({
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

export const TD = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <td
      className={clsx(
        "h-fit border-r border-neutral-300 text-center text-sm dark:border-neutral-700",
        className,
      )}
    >
      {children}
    </td>
  );
};

export const TH = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <th
      className={clsx(
        "border-r border-neutral-300 text-center text-sm font-medium dark:border-neutral-700",
        className,
      )}
    >
      {children}
    </th>
  );
};

export default function CallStackViewer() {
  const secIdToFuncId = useAtomValue(secIdToFuncIdAtom);
  const secIdToFuncName = useAtomValue(secIdToFuncNameAtom);
  const test262IdToTest262 = useAtomValue(test262IdToTest262Atom);

  const storage = {
    secIdToFuncId,
    secIdToFuncName,
    test262IdToTest262,
  };

  console.log("Visualizer storage loaded:", storage);

  const [callstack, setCallStack] = useAtom(callStackAtom);

  const flush = useCallback(() => {
    setCallStack([]);
  }, [setCallStack]);

  const selection = useAtomValue(selectionAtom);

  return (
    <>
      <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
        {selection && callstack.length === 0 && <CallStackSelectionWaiter />}
        <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-500 [&>svg]:size-4">
          <Layers />
          CallPath
        </div>
        {callstack.length !== 0 && (
          <button
            className="flex cursor-pointer flex-row items-center justify-center gap-1 rounded-md text-sm hover:bg-blue-600 hover:text-white [&>svg]:size-4"
            onClick={flush}
          >
            <Eraser />
            Clear
          </button>
        )}
      </div>
      <section className="w-full flex-auto basis-auto overflow-scroll">
        <CallStackViewerContent />
      </section>
    </>
  );
}

const CallStackSelectionWaiter = () => {
  return (
    <div className="bg-opacity-35 flex size-full items-center justify-center bg-[#ccc] p-8">
      <div className="items-cener flex items-center justify-center gap-2">
        <Mouse />
        <p className="text-sm">
          Start by pressing a function link with Left Click
        </p>
      </div>
    </div>
  );
};
