import * as protobuf from "protobufjs";

export async function loadProto(params: string): Promise<protobuf.Root> {
  const root = await protobuf.load(params);
  return root;
}

export type Action = AddField | RemoveField;

interface AddField {
  type: "add";
  path: string;
  value: any;
}

interface RemoveField {
  type: "remove";
  path: string;
}
