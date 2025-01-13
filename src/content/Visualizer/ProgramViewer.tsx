import { Play } from "lucide-react";
import { useEffect, useState } from "react";

import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import { Controlled } from "react-codemirror2/.ts";

const WEB_DEBUGGER_URL = "http://localhost:3000";

const ProgramViewer = ({
  program,
  iter,
}: {
  program: string;
  iter: number;
}) => {
  const [code, setCode] = useState("");

  useEffect(() => {
    setCode(program);
  }, [program]);

  const url =
    program === code
      ? `${WEB_DEBUGGER_URL}?prog=${encodeURIComponent(program)}&iter=${encodeURIComponent(iter)}`
      : `${WEB_DEBUGGER_URL}?prog=${encodeURIComponent(code)}`;

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
      <a
        href={url}
        target="_blank"
        className="absolute bottom-3 right-3 flex cursor-pointer flex-row items-center gap-1 bg-transparent text-sm text-blue-600 hover:text-blue-800"
      >
        Run on Web Debugger
        <Play size={12} />
      </a>
    </div>
  );
};

export default ProgramViewer;
