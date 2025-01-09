import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import clsx from "clsx";

const CallPathViewer = ({
  callPaths,
  convertFuncIdToAlgoName,
  selectedCallPath,
  changeCallPath,
}: {
  callPaths: string[];
  selectedCallPath: string;
  changeCallPath: (callPath: string) => void;
  convertFuncIdToAlgoName: (funcId: string) => Promise<string | null>;
}) => {
  if (!callPaths) return <div />;

  return (
    <div className="p-3 m-0 flex flex-col gap-1">
      {callPaths.map((callPath) => {
        const split = callPath.split("<");
        return (
          <CallPathButton
            split={split}
            convertFuncIdToAlgoName={convertFuncIdToAlgoName}
            callPath={callPath}
            selected={selectedCallPath === callPath}
            changeCallPath={changeCallPath}
          />
        );
      })}
    </div>
  );
};

const CallPathButton = ({
  split,
  convertFuncIdToAlgoName,
  selected,
  changeCallPath,
  callPath,
}: {
  split: string[];
  convertFuncIdToAlgoName: (funcId: string) => Promise<string | null>;
  selected: boolean;
  changeCallPath: (callPath: string) => void;
  callPath: string;
}) => {
  /* ToDo */
  const filtered = split.filter((sp) => sp !== "" && sp !== "ncp");

  if (filtered.length === 0) return null;
  return (
    <button
      key={crypto.randomUUID()}
      className={clsx(
        "w-full hover:bg-neutral-200 cursor-pointer bg-white border border-neutral-300 rounded-md text-sm py-1 px-2",
        selected && "!bg-neutral-300 cursor-default",
      )}
      onClick={() => {
        if (selected) return;
        changeCallPath(callPath);
      }}
    >
      {filtered.map((str, idx) => {
        if (idx === split.length - 1)
          return (
            <CallPathChunk
              funcId={str}
              convertFuncIdToAlgoName={convertFuncIdToAlgoName}
            />
          );
        return (
          <>
            <CallPathChunk
              funcId={str}
              convertFuncIdToAlgoName={convertFuncIdToAlgoName}
            />
            <div className="flex justify-end">
              <ChevronUp />
            </div>
          </>
        );
      })}
    </button>
  );
};

const CallPathChunk = ({
  funcId,
  convertFuncIdToAlgoName,
}: {
  funcId: string;
  convertFuncIdToAlgoName: (funcId: string) => Promise<string | null>;
}) => {
  const [h1, setH1] = useState<string | null>(null);
  const [funcKind, setFuncKind] = useState<"SDO" | "NORMAL">("NORMAL");

  useEffect(() => {
    (async () => {
      const rawHtml = await convertFuncIdToAlgoName(funcId);
      if (rawHtml?.includes("emu-nt")) {
        setFuncKind("SDO");
        setH1(`<emu-production collapsed>${rawHtml}</emu-production>`);
      } else {
        setFuncKind("NORMAL");
        setH1(rawHtml);
      }
    })();
  }, [funcId]);

  if (h1 == null) return <div>loading</div>;

  return (
    <>
      {funcKind === "SDO" && (
        <p
          className="text-sm m-0 p-0 text-left"
          dangerouslySetInnerHTML={{ __html: h1 }}
        />
      )}
      {funcKind === "NORMAL" && (
        <h1
          className="text-sm m-0 p-0 text-left"
          dangerouslySetInnerHTML={{ __html: h1 }}
        />
      )}
    </>
  );
};

export default CallPathViewer;
