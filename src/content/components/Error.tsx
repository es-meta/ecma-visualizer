import { Frown } from "lucide-react";

export const Error = () => {
  return (
    <div className="flex flex-auto items-center justify-center">
      <div className="flex flex-row items-center gap-3">
        <Frown className="h-7 w-7" />
        <div className="m-0 flex flex-col justify-start p-0">
          <p className="m-0 p-0 text-lg">Sorry something went wrong</p>
          <p className="m-0 p-0 text-sm">
            Help us improve ECMA Visualizer by reporting the issue
          </p>
        </div>
      </div>
    </div>
  );
};
