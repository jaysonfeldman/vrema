import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 4, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const displayedChildren = max ? childrenArray.slice(0, max) : childrenArray;
    const remainingCount = childrenArray.length - displayedChildren.length;

    return (
      <div
        ref={ref}
        className={cn("flex -space-x-2", className)}
        {...props}
      >
        {displayedChildren.map((child, i) => (
          <div key={i} className="relative">
            {child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs text-white">
            +{remainingCount}
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup }; 