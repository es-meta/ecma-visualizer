import React from "react";
import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { CallStack, ConvertedNode } from "@/types/call-stack";

const CallStackViewer = ({
  callStack,
  convertedCallStack,
}: {
  callStack: CallStack;
  convertedCallStack: ConvertedNode[];
}) => {
  return (
    <table className="w-full border-collapse">
      <thead className="sticky left-0 top-0 z-[500] w-full bg-white">
        <tr>
          <TH>#</TH>
          <TH>name</TH>
          <TH>step</TH>
          <th className="text-center" />
        </tr>
      </thead>
      <tbody>
        {convertedCallStack.reverse().map((node, idx) => {
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
                    onClick={() => callStack.pop()}
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
};

export const TR = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <tr
      className={clsx("h-fit py-2 odd:bg-neutral-50 even:bg-white", className)}
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
        "h-fit border-r border-neutral-300 text-center text-sm",
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
        "border-r border-neutral-300 text-center text-sm font-medium",
        className,
      )}
    >
      {children}
    </th>
  );
};

const Algorithm = ({ algorithm }: { algorithm: string }) => {
  if (algorithm.includes("emu-nt"))
    return (
      <p
        className="pointer-events-none m-0 p-0 text-xs"
        dangerouslySetInnerHTML={{
          __html: `<emu-production collapsed>${algorithm}</emu-production>`,
        }}
      />
    );
  else
    return (
      <h1
        className="pointer-events-none m-0 p-0 text-xs"
        dangerouslySetInnerHTML={{ __html: algorithm }}
      />
    );
};

export default CallStackViewer;
