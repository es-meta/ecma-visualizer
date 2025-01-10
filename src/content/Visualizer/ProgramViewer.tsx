import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import { useState } from "react";
import clsx from "clsx";

hljs.registerLanguage("javascript", javascript);

const ProgramViewer = ({
  program,
  defaultProgram,
}: {
  program: string;
  defaultProgram: string;
}) => {
  const [defaultFlag, setDefaultFlag] = useState<boolean>(true);
  const highlightedCode = hljs.highlight(program, {
    language: "javascript",
  }).value;

  return (
    <div className="m-0 p-3">
      <button
        className={clsx({ "bg-blue-600": defaultFlag })}
        onClick={() => setDefaultFlag((prev) => !prev)}
      >
        default
      </button>
      <pre className="m-0">
        <code
          className="hljs language-javascript text-base"
          dangerouslySetInnerHTML={{
            __html: defaultFlag ? defaultProgram : highlightedCode,
          }}
        />
      </pre>
    </div>
  );
};

export default ProgramViewer;
