import type { ReactNode } from "react";
import { cx } from "~/lib/utils";

export function Container({ children, className, wide }: { children: ReactNode; className?: string; wide?: boolean }) {
  return <div className={cx("mx-auto w-full px-5 md:px-10", wide ? "max-w-[1600px]" : "max-w-[1400px]", className)}>{children}</div>;
}
