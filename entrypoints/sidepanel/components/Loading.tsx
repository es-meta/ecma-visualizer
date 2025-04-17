import { LoaderCircle } from "lucide-react";

export const Loading = () => {
  return (
    <div className="flex size-full items-center justify-center">
      <LoaderCircle className="h-10 w-10 animate-spin font-bold text-[#E79118]" />
    </div>
  );
};
