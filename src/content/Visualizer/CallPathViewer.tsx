import clsx from "clsx";
import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { stepToNum } from "../util/convert-id.ts";

const CallPathViewer = ({
  callPaths,
  selectedCallPath,
  ...props
}: {
  callPaths?: string[];
  selectedCallPath?: string;
  handleCallPathChange: (callPath: string) => void;
  convertToECMAId: (ESMetaAlg: string) => Promise<string>;
}) => {
  if (!callPaths) return <div />;

  return (
    <div className="min-w-full p-3 m-0 flex flex-col gap-1">
      {callPaths.map((callPath) => {
        const split = callPath.split("<");
        return (
          <CallPathButton
            split={split}
            callPath={callPath}
            selected={selectedCallPath === callPath}
            {...props}
          />
        );
      })}
    </div>
  );
};

const CallPathButton = ({
  split,
  callPath,
  selected,
  handleCallPathChange,
  convertToECMAId,
}: {
  split: string[];
  callPath: string;
  selected: boolean;
  handleCallPathChange: (callPath: string) => void;
  convertToECMAId: (ESMetaAlg: string) => Promise<string>;
}) => {
  return (
    <button
      key={crypto.randomUUID()}
      className={clsx(
        "min-w-full hover:bg-neutral-300 curs or-pointer bg-white border border-neutral-300 rounded-md text-sm p-2 flex flex-col gap-[1px] items-start",
        selected && "!bg-neutral-400",
      )}
      onClick={() => {
        handleCallPathChange(callPath);
      }}
    >
      {split.map((str, idx) => {
        if (str === "") return null;

        if (idx === split.length - 1)
          return (
            <CallPathChunk esmetaAlg={str} convertToECMAId={convertToECMAId} />
          );
        return (
          <>
            <CallPathChunk esmetaAlg={str} convertToECMAId={convertToECMAId} />
            <div className="mx-auto">
              <ChevronUp />
            </div>
          </>
        );
      })}
    </button>
  );
};

const CallPathChunk = ({
  esmetaAlg,
  convertToECMAId,
}: {
  esmetaAlg: string;
  convertToECMAId: (ESMetaAlg: string) => Promise<string>;
}) => {
  const [stepEl, setStepEl] = useState<null | Element>(null);
  const [stepStr, setStepStr] = useState<string | null>(null);
  const [h1El, setH1El] = useState<Element | null>(null);
  const [grammarEl, setGrammarEl] = useState<Element | null>(null);

  useEffect(() => {
    const [alg, step] = esmetaAlg.split("/");
    if (!alg || !step) return;

    (async () => {
      const ecmaId = await convertToECMAId(alg);
      const $emuAlg = document.querySelector(`[visId="${ecmaId}"]`);

      setStepStr(step);

      if (!$emuAlg) return;
      const $emuClause = $emuAlg.parentElement;
      if (!$emuClause) return;

      const $h1 = $emuClause.querySelector("h1");
      const $grammar = $emuClause.querySelector("emu-grammar");

      setH1El($h1);
      setGrammarEl($grammar);

      let currentElement: Element | null = $emuAlg;
      stepToNum(step).forEach((st) => {
        const index = st;
        if (currentElement) {
          currentElement = currentElement.querySelector(
            `:scope > ol > li:nth-child(${index})`,
          );
        }
      });

      setStepEl(currentElement);
    })();
  }, [esmetaAlg]);

  if (stepEl == null || stepStr == null || h1El == null)
    return <div>loading</div>;

  return (
    <div className="border p-2 border-neutral-300 rounded-md flex flex-col gap-2 w-full items-start">
      {!grammarEl && (
        <h1
          className="text-sm m-0 p-0"
          dangerouslySetInnerHTML={{ __html: h1El.innerHTML }}
        />
      )}
      {grammarEl && (
        <span
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: grammarEl.innerHTML }}
        />
      )}
      <div className="flex flex-row gap-2 justify-start items-center">
        <span>{`${stepStr}.`}</span>
        <li
          className="whitespace-normal flex justify-start items-center"
          dangerouslySetInnerHTML={{ __html: stepEl.innerHTML }}
        />
      </div>
    </div>
  );
};

export default CallPathViewer;
