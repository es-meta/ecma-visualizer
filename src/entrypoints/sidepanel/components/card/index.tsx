import type { ReactNode } from "react";
import { twJoin } from "tailwind-merge";

interface CardProps {
  className?: string;
  children?: ReactNode;
  ref?: React.Ref<HTMLDivElement>;
}

export function Card({ className, children, ref }: CardProps) {
  return (
    <article
      ref={ref}
      className={twJoin(
        "relative flex size-full grow basis-auto flex-col",
        // "flex flex-row items-center justify-between p-2",
        className,
      )}
    >
      {children}
    </article>
  );
}

import { ReactElement, type PropsWithChildren } from "react";

interface CardHeaderProps extends PropsWithChildren {
  icon?: ReactElement<SVGElement> | null;
  title: string;
}

export function CardHeader({ title, children, icon }: CardHeaderProps) {
  return (
    <header className="relative flex h-8 max-h-8 min-h-8 flex-row items-center justify-end gap-2 border-b border-b-neutral-300 px-2 text-sm font-semibold text-neutral-500 dark:border-b-neutral-700 dark:text-neutral-400">
      <h3 className="mr-auto line-clamp-1 flex flex-row items-center gap-1 truncate [&>svg]:inline-block [&>svg]:size-4">
        {icon}
        {title}
      </h3>
      {children}
    </header>
  );
}
