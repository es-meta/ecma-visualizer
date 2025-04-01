import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import { Controlled } from "react-codemirror2/.ts";
import { Selection } from "@/types/custom-event";
import { Loading, Error } from "../components";
import { CallStack } from "@/types/call-stack";
import useProgram from "./hooks/useProgram";
import { Code } from "lucide-react";
import { PlayButton } from "../components/PlayButton.tsx";

const ProgramViewer = ({
  selection,
  callstack,
  sdoWaiting,
}: {
  selection: Selection | null;
  callstack: CallStack;
  sdoWaiting: boolean;
}) => {
  const { codeAndStepCnt, setCodeAndStepCnt, loading, error } = useProgram(
    selection,
    callstack,
  );

  const url = `http://localhost:3000?prog=${encodeURIComponent(codeAndStepCnt[0])}&iter=${encodeURIComponent(codeAndStepCnt[1])}`;

  return (
    <>
      <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
        <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-500 [&>svg]:size-4">
          <Code />
          Program
        </div>
        <PlayButton href={url} />
      </div>
      <div className="relative w-full flex-auto basis-auto overflow-scroll">
        {sdoWaiting ? (
          <SDOWaiting />
        ) : loading ? (
          <Loading />
        ) : error ? (
          <Error error={error} />
        ) : (
          <div className="m-0 size-full">
            <Controlled
              className="min-h-full text-sm"
              value={codeAndStepCnt[0]}
              options={{
                lineNumbers: true,
                mode: "javascript",
              }}
              onBeforeChange={(editor, data, value) => {
                setCodeAndStepCnt([value, codeAndStepCnt[1]]);
              }}
            />
          </div>
        )}
      </div>
    </>
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
