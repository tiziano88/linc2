import * as protobuf from "protobufjs";

export async function loadProto(params: string): Promise<protobuf.Root> {
  const root = await protobuf.load(params);
  return root;
}
