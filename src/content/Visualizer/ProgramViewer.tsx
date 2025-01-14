import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import { Controlled } from "react-codemirror2/.ts";
import React from "react";

const ProgramViewer = ({
  code,
  iter,
  setCode,
}: {
  code: string;
  iter: number;
  setCode: React.Dispatch<React.SetStateAction<string>>;
}) => {
  return (
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

export default ProgramViewer;
