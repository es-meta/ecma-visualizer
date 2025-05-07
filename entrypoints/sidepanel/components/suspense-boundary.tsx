import {
  Suspense,
  Component,
  type ErrorInfo,
  type PropsWithChildren,
  type FC,
} from "react";
import { getQueryClient } from "../atoms/qc";

type DisjointBooleanFlag<K extends string> = {
  [Key in K]: {
    [P in Key]: true;
  } & Partial<Record<Exclude<K, Key>, undefined>>;
}[K];

interface ErrorConsumerProps {
  error: unknown;
  retry: () => void;
}

type ErrorConsumer = FC<ErrorConsumerProps>;

type ErrorLevel = DisjointBooleanFlag<
  "intentional" | "recoverable" | "unexpected" | "fatal"
>;

type Props = {
  error?: ErrorConsumer;
  loading?: React.ReactNode;
  children?: React.ReactNode;
} & ErrorLevel;

export function SuspenseBoundary({
  children,
  loading,
  error,
  intentional,
  recoverable,
  unexpected,
}: Props) {
  const errorLevel = intentional
    ? "intentional"
    : recoverable
      ? "recoverable"
      : unexpected
        ? "unexpected"
        : "fatal";
  return (
    <ErrorBoundary fallback={error} errorLevel={errorLevel}>
      <Suspense fallback={loading}>{children}</Suspense>
    </ErrorBoundary>
  );
}

/* auxiliary component for error handling */

type ErrorBoundaryProps = PropsWithChildren<{
  fallback?: ErrorConsumer;
  errorLevel?: "intentional" | "recoverable" | "unexpected" | "fatal";
}>;

class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  { hasError: boolean; __error?: unknown }
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, __error: error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    switch (this.props.errorLevel) {
      case "intentional":
        // Do nothing
        break;
      default:
        console.error?.(
          "ErrorBoundary caught",
          "unknown error level:",
          error,
          info.componentStack,
        );
        break;
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback?.({
          error: this.state.__error,
          retry: () => {
            this.setState({ hasError: false, __error: undefined });
            getQueryClient().invalidateQueries();
          },
        }) ?? null
      );
    }

    return this.props.children;
  }
}
