import { Play } from "lucide-react";

export const PlayButton = ({ href }: { href: string }) => {
  return (
    <a
      href={href}
      target="_blank"
      className="flex cursor-pointer flex-row items-center gap-1 bg-transparent text-sm text-blue-600 hover:text-blue-800"
    >
      Run on Double Debugger
      <Play size={12} />
    </a>
  );
};
