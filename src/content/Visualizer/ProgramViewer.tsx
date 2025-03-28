import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import { Controlled } from "react-codemirror2/.ts";
import { Selection } from "@/types/custom-event";
import { Loading, Error } from "../components";
import { CallStack } from "@/types/call-stack";
import useProgram from "./hooks/useProgram";

const ProgramViewer = ({
  selection,
  callstack,
  sdoWaiting,
}: {
  selection: Selection | null;
  callstack: CallStack;
  sdoWaiting: boolean;
}) => {
  const { code, setCode, loading, error } = useProgram(selection, callstack);

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
