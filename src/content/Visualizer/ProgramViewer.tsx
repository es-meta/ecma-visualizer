import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import { Play } from "lucide-react";

const WEB_DEBUGGER_URL = "http://localhost:3000";
hljs.registerLanguage("javascript", javascript);

const ProgramViewer = ({
  program,
  iter,
}: {
  program: string;
  iter: number;
}) => {
  const highlightedCode = hljs.highlight(program, {
    language: "javascript",
  }).value;

  return (
    <div className="m-0 h-fit w-full p-3">
      <pre className="m-0">
        <code
          className="hljs language-javascript text-base"
          dangerouslySetInnerHTML={{
            __html: highlightedCode,
          }}
        />
      </pre>
      <a
        href={`${WEB_DEBUGGER_URL}?prog=${encodeURIComponent(program)}&iter=${encodeURIComponent(iter)}`}
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
