import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { Code, Mouse } from "lucide-react";
import { PlayButton } from "../components/PlayButton";
import { usePreferredColorScheme } from "./hooks/use-preferred-color-scheme";
import { useAtomValue } from "jotai";
import { programAtom } from "../atoms/app";

export default function ProgramViewer() {
  const colorScheme = usePreferredColorScheme();
  const [foundCode, foundIter] = useAtomValue(programAtom);
  const [userCode, setUserCode] = useState("");

  useEffect(() => {
    setUserCode(foundCode);
  }, [foundCode]);

  const url = `${import.meta.env.VITE_DOUBLE_DEBUGGER_URL}?prog=${encodeURIComponent(userCode)}&iter=${encodeURIComponent(foundIter)}`;

  return (
    <>
      <div className="flex shrink-0 grow-0 basis-auto flex-row items-center justify-between p-2">
        <div className="flex flex-row items-center gap-1 text-sm font-semibold text-neutral-700 dark:text-neutral-300 [&>svg]:size-4">
          <Code />
          Program
        </div>
        <PlayButton href={url} />
      </div>
      <div className="relative w-full flex-auto basis-auto overflow-scroll">
        <div className="m-0 size-full">
          <CodeMirror
            className="size-full min-h-full text-sm"
            extensions={[javascript({ jsx: false })]}
            theme={colorScheme}
            value={userCode}
            onChange={setUserCode}
          />
        </div>
      </div>
    </>
  );
}

export function SDOWaiting() {
  return (
    <div className="bg-opacity-35 absolute top-0 left-0 flex size-full items-center justify-center bg-[#ccc] p-8">
      <div className="items-cener flex items-center justify-center gap-2">
        <Mouse />
        <p className="text-sm">
          Start by pressing a production with Option (Alt) + Left Click
        </p>
      </div>
    </div>
  );
}
