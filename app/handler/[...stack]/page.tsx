import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "../../../stack";
import Image from "next/image";

export default function Handler(props: unknown) {
  return (
    <div>
      <Image src="/true_transparent.png" alt="image description" width={400} height={130}  className="css-image"/>
      <StackHandler fullPage app={stackServerApp} routeProps={props} />;
    </div>
  );
}
