import React, { useEffect, useState } from "react";
import { Loading } from "../App.tsx";
import clsx from "clsx";
import { Trash2 } from "lucide-react";

const CallStackViewer = ({
  callStack,
  convertCallIdToAlgoOrSyntax,
  popStack,
}: {
  callStack: number[];
  convertCallIdToAlgoOrSyntax: (
    callId: string,
  ) => Promise<[string, string] | [null, null]>;
  popStack: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const [algorithms, setAlgorithms] = useState<string[][] | null>(null);

  useEffect(() => {
    (async () => {
      const promises = callStack.map((cs) =>
        convertCallIdToAlgoOrSyntax(cs.toString()),
      );
      const algs = (await Promise.all(promises)).map((algNStep) => {
        const [alg, step] = algNStep;
        return alg === null ? ["not found", "-1"] : [alg, step];
      });
      setAlgorithms(algs);
      setLoading(false);
    })();
  }, [callStack]);

  return (
    <table className="w-full border-collapse">
      {loading && <Loading />}
      <thead className="sticky left-0 top-0 z-[500] w-full bg-white">
        <tr>
          <TH>#</TH>
          <TH>name</TH>
          <TH>step</TH>
          <th className="text-center" />
        </tr>
      </thead>
      <tbody>
        {algorithms &&
          algorithms.map((algoNstep, idx) => {
            const [algos, step] = algoNstep;

            return (
              <TR>
                <TD className="px-2 text-sm">{idx}</TD>
                <TD>
                  <Algorithm algorithm={algos} />
                </TD>
                <TD className="px-2">{step}</TD>
                <td className="px-2 text-center">
                  {idx === 0 && (
                    <Trash2
                      size={15}
                      className="inline cursor-pointer text-neutral-300 hover:text-neutral-500"
                      onClick={popStack}
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
        className="pointer-events-none m-0 p-0 text-sm"
        dangerouslySetInnerHTML={{ __html: algorithm }}
      />
    );
};

export default CallStackViewer;
