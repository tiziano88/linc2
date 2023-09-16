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

export function messageValue(...fields: [FieldID, FieldValue[]][]): FieldValue {
  return {
    type: T.MESSAGE,
    value: {
      fields: new Map(fields),
    },
  };
}

export function field(
  fieldID: FieldID,
  ...values: FieldValue[]
): [FieldID, FieldValue[]] {
  return [fieldID, values];
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

export function getIn(value: FieldValue, cursor: Cursor): FieldValue {
  let current: FieldValue = value;
  for (const selector of cursor) {
    if (current.type === T.MESSAGE) {
      current = current.value.fields.get(selector.fieldID)![selector.index];
    } else {
      throw new Error("Not a message");
    }
  }
  return current;
}

export function parent(value: FieldValue, cursor: Cursor): Cursor {
  if (cursor.length === 0) {
    return [];
  } else {
    return cursor.slice(0, cursor.length - 1);
  }
}

export function child(value: FieldValue, cursor: Cursor): Cursor {
  const current: FieldValue = getIn(value, cursor);
  if (current.type === T.MESSAGE) {
    const fieldIDs = [...current.value.fields.keys()];
    fieldIDs.sort();
    const firstFieldID = fieldIDs[0];
    return [...cursor, { fieldID: firstFieldID, index: 0 }];
  } else {
    return cursor;
  }
}

export function nextSibling(value: FieldValue, cursor: Cursor): Cursor {
  if (cursor.length === 0) {
    return [];
  }
  const parentCursor = parent(value, cursor);
  const leafSelector = cursor[cursor.length - 1];
  const parentNode: FieldValue = getIn(value, parentCursor);
  if (parentNode.type === T.MESSAGE) {
    const nextIndex = leafSelector.index + 1;
    if (nextIndex < parentNode.value.fields.get(leafSelector.fieldID)!.length) {
      return [
        ...parentCursor,
        { fieldID: leafSelector.fieldID, index: nextIndex },
      ];
    } else {
      const fieldIDs = [...parentNode.value.fields.keys()];
      fieldIDs.sort();
      const nextFieldID = fieldIDs.find(
        (fieldID) => fieldID > leafSelector.fieldID
      )!;
      return [...parentCursor, { fieldID: nextFieldID, index: 0 }];
    }
  } else {
    return cursor;
  }
}

export function previousSibling(value: FieldValue, cursor: Cursor): Cursor {
  if (cursor.length === 0) {
    return [];
  }
  const parentCursor = parent(value, cursor);
  const leafSelector = cursor[cursor.length - 1];
  const parentNode: FieldValue = getIn(value, parentCursor);
  if (parentNode.type === T.MESSAGE) {
    if (leafSelector.index > 0) {
      const previousIndex = leafSelector.index - 1;
      return [
        ...parentCursor,
        { fieldID: leafSelector.fieldID, index: previousIndex },
      ];
    } else {
      const fieldIDs = [...parentNode.value.fields.keys()];
      fieldIDs.sort();
      const previousFieldID = fieldIDs.findLast(
        (fieldID) => fieldID < leafSelector.fieldID
      )!;
      const previousField = parentNode.value.fields.get(previousFieldID)!;
      const previousIndex = previousField.length - 1;
      return [
        ...parentCursor,
        { fieldID: previousFieldID, index: previousIndex },
      ];
    }
  } else {
    return cursor;
  }
}
