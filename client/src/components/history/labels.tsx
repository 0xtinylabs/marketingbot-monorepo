import React from "react";
import { DateTime } from "luxon";

type StartProps = {
  type: "LOOP" | "SINGLE";
  iteration: number;
  date: Date;
};

type EndProps = {
  type: "LOOP" | "SINGLE";
  date: Date;
};

export const HistoryStartLabel = (props: StartProps) => {
  return (
    <div className="text-text-soft-400  flex justify-between bg-bg-weak-50 text-label-sm items-center px-[10px] h-[26px]">
      <div>
        {props.type === "LOOP"
          ? `${props.iteration + 1}. LOOP`
          : `SINGLE`}{" "}
        {props.type === "LOOP" && props.iteration > 1 ? "" : "SESSION"}{" "}
        <span className="text-green-600">{`STARTED`}</span>
      </div>
      <div>{DateTime.fromJSDate(props.date).toFormat("dd MM yy HH:mm:ss")}</div>
    </div>
  );
};

export const HistoryEndLabel = (props: EndProps) => {
  return (
    <div className="text-text-soft-400 flex justify-between items-center bg-bg-weak-50 text-label-sm px-[10px]  h-[26px]">
      <div className="text-red-700">
        {props.type === "LOOP" ? "STOPPED" : "ENDED"}{" "}
      </div>
      <div>{DateTime.fromJSDate(props.date).toFormat("dd MM yy HH:mm:ss")}</div>
    </div>
  );
};
