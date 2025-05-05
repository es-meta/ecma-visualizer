import { Frown } from "lucide-react";
import { CustomError } from "@/types/data";

const ErrorMessage = {
  NotFound: {
    main: "Program not found",
    sub: "Try another step or callpath",
  },
  Error: {
    main: "Sorry something went wrong",
    sub: "Help us improve ECMA Visualizer by reporting the issue",
  },
};

export const Error = ({ error }: { error: CustomError }) => {
  return (
    <div className="flex h-full w-full flex-auto items-center justify-center">
      <div className="flex flex-row items-center gap-3">
        <Frown className="h-7 w-7" />
        <div className="m-0 flex flex-col justify-start p-0">
          <p className="m-0 p-0 text-lg">{ErrorMessage[error].main}</p>
          <p className="m-0 p-0 text-sm">{ErrorMessage[error].sub}</p>
        </div>
      </div>
    </div>
  );
};
