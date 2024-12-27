import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
hljs.registerLanguage("javascript", javascript);

const ProgramViewer = ({ program }: { program?: string }) => {
  if (program) {
    const highlightedCode = hljs.highlight(program, {
      language: "javascript",
    }).value;

    return (
      <div className="p-3 m-0">
        <pre className="m-0">
          <code
            className="hljs language-javascript text-base"
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    );
  } else {
    return <h1>ToDo</h1>;
  }
};

export default ProgramViewer;
