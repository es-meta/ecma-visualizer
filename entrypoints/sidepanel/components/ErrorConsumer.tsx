import { CALLSTACK_EMPTY } from "@/utils/custom-error.utils";
import { FrownIcon, MouseIcon, TextSelectIcon } from "lucide-react";

export function KnownError({ error }: { error: CustomError }) {
  switch (error.message) {
    case SDO_WAITING:
      return <SDOWaiting />;
    case NOT_FOUND:
      return <NotFound />;
    case CALLSTACK_EMPTY:
      return <CallStackSelectionWaiter />;
    case UNKNOWN:
      throw error;
  }
}

export function ErrorConsumer({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  if (error instanceof Error) {
    switch (error.message) {
      case SDO_WAITING:
        return <SDOWaiting />;
      case NOT_FOUND:
        return <NotFound />;
      case CALLSTACK_EMPTY:
        return <CallStackSelectionWaiter />;
      case UNKNOWN:
      // fall through
    }
  }

  logger.error("Unknown Error Propagted", error);

  return <LastFallback retry={retry} />;
}

export function LastFallback({ retry }: { retry: () => void }) {
  return (
    <div className="bg-opacity-35 flex size-full items-center justify-center p-8">
      <div className="items-cener flex items-center justify-center gap-2">
        <p className="text-sm">
          <FrownIcon className="inline-block size-[1em]" />
          Sorry, something went wrong. Help us improve ECMA Visualizer by
          reporting the issue.
        </p>
        <button
          className="rounded-md bg-blue-600 px-2 py-1 text-sm text-white hover:bg-blue-700"
          onClick={retry}
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export function SDOWaiting() {
  return (
    <div className="bg-opacity-35 flex size-full items-center justify-center p-8">
      <div className="items-cener flex items-center justify-center gap-2">
        <p className="text-sm">
          <MouseIcon className="inline-block size-[1em]" />
          Start by pressing a production with Option (Alt) + Left Click
        </p>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="bg-opacity-35 flex size-full items-center justify-center p-8">
      <div className="items-cener flex items-center justify-center gap-2">
        <p className="text-sm">
          <TextSelectIcon className="inline-block size-[1em]" />
          Program not found, Try another step or callpath
        </p>
      </div>
    </div>
  );
}

export function CallStackSelectionWaiter() {
  return (
    <div className="bg-opacity-35 flex size-full items-center justify-center p-8">
      <div className="items-cener flex items-center justify-center gap-2">
        <p className="text-sm">
          <MouseIcon className="inline-block size-[1em]" />
          Start by pressing a function link with Left Click
        </p>
      </div>
    </div>
  );
}
