import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import { Controlled } from "react-codemirror2/.ts";
import { useEffect, useState } from "react";
import { Selection } from "@/types/custom-event";
import { Loading, Error } from "../components";
import { fetchNodeIdToScript, fetchStepToNodeId } from "../util/api";

const ProgramViewer = ({
  selection,
  sdoWaiting,
}: {
  selection: Selection | null;
  sdoWaiting: boolean;
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const [code, setCode] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(false);
      try {
        if (!selection) return;
        const nodeIds = await fetchStepToNodeId(
          selection.secId,
          selection.step,
        );
        const progs = await fetchNodeIdToScript(nodeIds[0]);
        const shortestProg = progs.reduce((shortest, current) =>
          current.length < shortest.length ? current : shortest,
        );
        setCode(shortestProg);
      } catch (e) {
        setError(true);
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [selection]);

  if (sdoWaiting) {
    return <SDOWaiting />;
  } else
    return loading ? (
      <Loading />
    ) : error ? (
      <Error />
    ) : (
      <div className="m-0 size-full">
        <Controlled
          className="min-h-full text-sm"
          value={code}
          options={{
            lineNumbers: true,
            // matchBrackets: true,
            mode: "javascript",
          }}
          onBeforeChange={(editor, data, value) => {
            setCode(value);
          }}
        />
      </div>
    );
};

const SDOWaiting = () => {
  return (
    <div className="absolute left-0 top-0 z-[900] flex size-full items-center justify-center bg-[#ccc] bg-opacity-35 p-8">
      <div className="items-cener flex items-center justify-center gap-2">
        <p className="text-sm">Waiting for sdo</p>
      </div>
    </div>
  );
};

export default ProgramViewer;
