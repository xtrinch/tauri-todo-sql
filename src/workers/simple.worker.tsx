import { expose } from "comlink";
import "./workerShim";

const getBlob = async (props: string) => {
  console.log("your debugging message");
};

expose({ getBlob });

export type WorkerType = {
  getBlob: typeof getBlob;
};
