import clsx from "clsx";
import React from "react";

const Card = (props: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={clsx(
        "bg-soft-400 border-[1px] border-bg-soft-200 p-[10px] space-y-2",
        props.className
      )}
    >
      {props.children}
    </div>
  );
};

export const CardTitle = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3 className={clsx("text-text-soft-400 text-label-xs", props.className)}>
      {props.children}
    </h3>
  );
};
export const CardText = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3 className={clsx("text-text-strong-950 text-label-xl", props.className)}>
      {props.children}
    </h3>
  );
};

export default Card;
