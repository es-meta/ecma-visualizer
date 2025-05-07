import { LoaderCircleIcon } from "lucide-react";

export function Loading() {
  return (
    <div className="flex size-full items-center justify-center">
      <LoaderCircleIcon className="h-10 w-10 animate-spin font-bold text-amber-500" />
    </div>
  );
}
