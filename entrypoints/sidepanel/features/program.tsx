import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { Code, PlayIcon } from "lucide-react";
import { atom } from "jotai";
import { programAtom, selectionAtom } from "../atoms/app";
import { SuspenseBoundary } from "../components/suspense-boundary";
import { ErrorConsumer, KnownError } from "../components/ErrorConsumer";
import { Card, CardHeader } from "../components/card";
import { Loading } from "../components";

const userCodeAtom = atom("");

export function ProgramViewer() {
  const selection = useAtomValue(selectionAtom);

  return (
    <Card>
      <CardHeader title="Program" icon={<Code />}>
        <SuspenseBoundary intentional>
          <ResumeButton />
        </SuspenseBoundary>
      </CardHeader>
      <div className="flex grow flex-col overflow-scroll">
        <SuspenseBoundary
          unexpected
          loading={<Loading />}
          error={ErrorConsumer}
        >
          {selection === null ? (
            <KnownError error={waitingSdoError()} />
          ) : (
            <ProgramViewerContent />
          )}
        </SuspenseBoundary>
      </div>
    </Card>
  );
}

function ResumeButton() {
  const program = useAtomValue(programAtom);
  const userCode = useAtomValue(userCodeAtom);

  const foundIter = program instanceof Error ? NaN : program[1];

  if (program instanceof Error) {
    return null;
  }

  const url = new URL(import.meta.env.VITE_DOUBLE_DEBUGGER_URL);
  url.searchParams.set("prog", userCode);
  url.searchParams.set("iter", foundIter.toString());

  const href = url.toString();

  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      Run on Double Debugger
      <PlayIcon strokeWidth={2} />
    </a>
  );
}

function ProgramViewerContent() {
  const colorScheme = usePreferredColorScheme();
  const [userCode, setUserCode] = useAtom(userCodeAtom);
  const program = useAtomValue(programAtom);

  const foundCode = program instanceof Error ? "" : program[0];

  useEffect(() => {
    setUserCode(foundCode);
  }, [foundCode, setUserCode]);

  if (program instanceof Error) {
    // NOTE : throwing to ErrorBoundary makes re-rendering cumbersome; use return instead
    return <KnownError error={program} />;
  }

  return (
    <div className="relative w-full flex-auto basis-auto overflow-scroll transition-opacity">
      <div className="m-0 size-full">
        <CodeMirror
          className="size-full min-h-full text-sm"
          extensions={[javascript({ jsx: false }), EditorView.lineWrapping]}
          theme={colorScheme}
          value={userCode}
          onChange={setUserCode}
        />
      </div>
    </div>
  );
}
