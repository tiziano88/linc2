export interface MessageValue {
  fields: Map<FieldID, Array<FieldValue>>;
}

export enum T {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  MESSAGE = "message",
}

export type FieldValue =
  | { type: T.STRING; value: string }
  | { type: T.NUMBER; value: number }
  | { type: T.BOOLEAN; value: boolean }
  | { type: T.MESSAGE; value: MessageValue };

export function stringValue(value: string): FieldValue {
  return {
    type: T.STRING,
    value: value,
  };
}

export function numberValue(value: number): FieldValue {
  return {
    type: T.NUMBER,
    value: value,
  };
}

export function messageValue(value: MessageValue): FieldValue {
  return {
    type: T.MESSAGE,
    value: value,
  };
}

export type MessageID = number;
export type FieldID = number;

export interface Selector {
  fieldID: FieldID;
  index: number;
}

export type Cursor = Selector[];

export function printCursor(cursor: Cursor): string {
  return cursor.map((s) => `${s.fieldID}[${s.index}]`).join(".");
}

export interface Schema {
  messages: Map<MessageID, MessageDescriptor>;
}

export interface MessageDescriptor {
  name: string;
  fields: Map<FieldID, FieldDescriptor>;
}

export interface FieldDescriptor {
  type: FieldType;
  name: string;
  repeated: boolean;
}

export function printFieldDescriptor(fieldDescriptor: FieldDescriptor): string {
  if (fieldDescriptor.type.type === T.STRING) {
    return `${fieldDescriptor.name}: string`;
  } else if (fieldDescriptor.type.type === T.NUMBER) {
    return `${fieldDescriptor.name}: number`;
  } else if (fieldDescriptor.type.type === T.BOOLEAN) {
    return `${fieldDescriptor.name}: boolean`;
  } else if (fieldDescriptor.type.type === T.MESSAGE) {
    return `${fieldDescriptor.name}: message ${fieldDescriptor.type.messageID}`;
  } else {
    return `${fieldDescriptor.name}: UNKNOWN`;
  }
}

export type FieldType =
  | { type: T.STRING }
  | { type: T.NUMBER }
  | { type: T.BOOLEAN }
  | { type: T.MESSAGE; messageID: MessageID };

export type Action =
  | { type: "set"; cursor: Cursor; value: FieldValue }
  | { type: "remove"; cursor: Cursor }
  | { type: "select"; cursor: Cursor }
  | { type: "move"; direction: "previous" | "next" | "parent" | "child" };

export type ActionHandler = (action: Action) => void;
