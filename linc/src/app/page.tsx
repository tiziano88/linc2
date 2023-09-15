"use client";

import Image from "next/image";
import { useState } from "react";
import { cloneDeep } from "lodash";

interface MessageValue {
  fields: Map<FieldID, Array<FieldValue>>;
}

enum T {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  MESSAGE = "message",
}

type FieldValue =
  | { type: T.STRING; value: string }
  | { type: T.NUMBER; value: number }
  | { type: T.BOOLEAN; value: boolean }
  | { type: T.MESSAGE; value: MessageValue };

function stringValue(value: string): FieldValue {
  return {
    type: T.STRING,
    value: value,
  };
}

function numberValue(value: number): FieldValue {
  return {
    type: T.NUMBER,
    value: value,
  };
}

function messageValue(value: MessageValue): FieldValue {
  return {
    type: T.MESSAGE,
    value: value,
  };
}

type MessageID = number;
type FieldID = number;

interface Selector {
  fieldID: FieldID;
  index: number;
}

type Cursor = Selector[];

function printCursor(cursor: Cursor): string {
  return cursor.map((s) => `${s.fieldID}[${s.index}]`).join(".");
}

interface Schema {
  messages: Map<MessageID, MessageDescriptor>;
}

interface MessageDescriptor {
  name: string;
  fields: Map<FieldID, FieldDescriptor>;
}

interface FieldDescriptor {
  type: FieldType;
  name: string;
  repeated: boolean;
}

function printFieldDescriptor(fieldDescriptor: FieldDescriptor): string {
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

type FieldType =
  | { type: T.STRING }
  | { type: T.NUMBER }
  | { type: T.BOOLEAN }
  | { type: T.MESSAGE; messageID: MessageID };

type Action =
  | { type: "set"; cursor: Cursor; value: FieldValue }
  | { type: "remove"; cursor: Cursor };

type ActionHandler = (action: Action) => void;

function FieldValueView({
  schema,
  messageID,
  fieldID,
  value,
  onAction,
  cursor,
}: {
  schema: Schema;
  messageID: MessageID;
  fieldID: FieldID;
  value: FieldValue;
  onAction: ActionHandler;
  cursor: Cursor;
}) {
  function changeHandler(v: React.ChangeEvent<HTMLTextAreaElement>) {
    console.log("changeHandler", cursor, v.target.value);
    onAction({
      type: "set",
      cursor: cursor,
      value: stringValue(v.target.value),
    });
  }
  function handleRemove() {
    const newCursor = cloneDeep(cursor);
    onAction({ type: "remove", cursor: newCursor });
  }
  const messageDescriptor = schema.messages.get(messageID);
  if (messageDescriptor === undefined) {
    return <div>message {messageID} not found</div>;
  }
  const fieldDescriptor = messageDescriptor.fields.get(fieldID);
  if (fieldDescriptor === undefined) {
    return (
      <div>
        field {fieldID} not found in message {messageID}
      </div>
    );
  }
  const fieldType = fieldDescriptor.type;
  if (fieldType.type === T.STRING) {
    if (value.type !== T.STRING) {
      return <div>value is not a string</div>;
    }
    return (
      <div>
        <button onClick={handleRemove}>REMOVE</button>
        <textarea
          className="text-black"
          value={value.value}
          onChange={changeHandler}
        ></textarea>
      </div>
    );
  } else if (fieldType.type === T.NUMBER) {
    if (value.type !== T.NUMBER) {
      return <div>value is not a number</div>;
    }
    return <div>{value.value}</div>;
  } else if (fieldType.type === T.BOOLEAN) {
    if (value.type !== T.BOOLEAN) {
      return <div>value is not a bool</div>;
    }
    return <div>{value.value}</div>;
  } else if (fieldType.type === T.MESSAGE) {
    if (value.type !== T.MESSAGE) {
      return <div>value is not a message</div>;
    }
    return (
      <MessageView
        schema={schema}
        messageID={fieldType.messageID}
        value={value.value}
        onAction={onAction}
        cursor={cursor}
      ></MessageView>
    );
  } else {
    return <div>-other-</div>;
  }
}

function RepeatedFieldView({
  schema,
  messageID,
  fieldID,
  values,
  onAction,
  cursor,
}: {
  schema: Schema;
  messageID: MessageID;
  fieldID: FieldID;
  values: FieldValue[];
  onAction: ActionHandler;
  cursor: Cursor;
}) {
  const messageDescriptor = schema.messages.get(messageID);
  if (messageDescriptor === undefined) {
    return <div>message not found</div>;
  }
  const fieldDescriptor = messageDescriptor.fields.get(fieldID);
  if (fieldDescriptor === undefined) {
    return <div>field not found</div>;
  }
  function handleAdd() {
    const newCursor = cloneDeep(cursor);
    newCursor[newCursor.length - 1].index = values.length;
    var newValue: FieldValue;
    if (fieldDescriptor!.type.type === T.MESSAGE) {
      newValue = messageValue({
        fields: new Map<number, Array<FieldValue>>([]),
      });
    } else if (fieldDescriptor!.type.type === T.STRING) {
      newValue = stringValue("");
    } else if (fieldDescriptor!.type.type === T.NUMBER) {
      newValue = numberValue(0);
    } else if (fieldDescriptor!.type.type === T.BOOLEAN) {
      newValue = { type: T.BOOLEAN, value: false };
    } else {
      newValue = stringValue("unknown");
    }
    onAction({ type: "set", cursor: newCursor, value: newValue });
  }
  return (
    <div>
      <div>
        {values.map((value, i) => {
          const fieldValueCursor = cloneDeep(cursor);
          fieldValueCursor[fieldValueCursor.length - 1].index = i;
          return (
            <div key={i} className="flex">
              <div>
                [ {fieldID} : {printFieldDescriptor(fieldDescriptor)} ]
              </div>
              <FieldValueView
                schema={schema}
                messageID={messageID}
                fieldID={fieldID}
                value={value}
                onAction={onAction}
                cursor={fieldValueCursor}
              ></FieldValueView>
            </div>
          );
        })}
      </div>
      {(values.length == 0 || fieldDescriptor.repeated) && (
        <div>
          [ {fieldID} : {printFieldDescriptor(fieldDescriptor)} ]
          <button onClick={handleAdd}>ADD</button>
        </div>
      )}
    </div>
  );
}

function MessageView({
  schema,
  messageID,
  value,
  onAction,
  cursor,
}: {
  schema: Schema;
  messageID: MessageID;
  value: MessageValue;
  onAction: ActionHandler;
  cursor: Cursor;
}) {
  const messageDescriptor = schema.messages.get(messageID);
  if (messageDescriptor === undefined) {
    return <div>message {messageID} not found in schema</div>;
  }
  return (
    <div>
      {Array.from(messageDescriptor.fields).map(
        ([fieldID, fieldDescriptor]) => {
          const values = value.fields.get(fieldID) ?? [];
          // Points to the first element of the array, even if empty.
          const fieldCursor = cloneDeep(cursor);
          fieldCursor.push({ fieldID, index: 0 });
          return (
            <div key={fieldID}>
              <RepeatedFieldView
                schema={schema}
                messageID={messageID}
                fieldID={fieldID}
                values={values}
                onAction={onAction}
                cursor={fieldCursor}
              ></RepeatedFieldView>
            </div>
          );
        }
      )}
    </div>
  );
}

export default function Home() {
  const schema: Schema = {
    messages: new Map<MessageID, MessageDescriptor>([
      [
        1,
        {
          name: "manifest",
          fields: new Map<FieldID, FieldDescriptor>([
            [
              1,
              {
                type: { type: T.MESSAGE, messageID: 2 },
                name: "package",
                repeated: false,
              },
            ],
            [
              2,
              {
                type: { type: T.MESSAGE, messageID: 3 },
                name: "dependencies",
                repeated: true,
              },
            ],
            [
              3,
              {
                type: { type: T.MESSAGE, messageID: 2 },
                name: "field_3",
                repeated: true,
              },
            ],
            [
              4,
              {
                type: { type: T.MESSAGE, messageID: 2 },
                name: "field_4",
                repeated: true,
              },
            ],
          ]),
        },
      ],
      [
        2,
        {
          name: "package",
          fields: new Map<FieldID, FieldDescriptor>([
            [
              1,
              {
                type: { type: T.STRING },
                name: "name",
                repeated: false,
              },
            ],
            [
              2,
              {
                type: { type: T.STRING },
                name: "version",
                repeated: false,
              },
            ],
            [
              3,
              {
                type: { type: T.STRING },
                name: "authors",
                repeated: true,
              },
            ],
          ]),
        },
      ],
      [
        3,
        {
          name: "dependency",
          fields: new Map<FieldID, FieldDescriptor>([
            [
              1,
              {
                type: { type: T.STRING },
                name: "name",
                repeated: false,
              },
            ],
            [
              2,
              {
                type: { type: T.STRING },
                name: "version",
                repeated: false,
              },
            ],
            [
              3,
              {
                type: { type: T.STRING },
                name: "registry",
                repeated: false,
              },
            ],
          ]),
        },
      ],
    ]),
  };
  const initValue2: MessageValue = {
    fields: new Map<number, Array<FieldValue>>([
      [1, [stringValue("hello"), stringValue("hello_2")]],
      [
        3,
        [
          messageValue({
            fields: new Map<number, Array<FieldValue>>([
              [1, [stringValue("nested hello")]],
              [2, [stringValue("nested one"), stringValue("nested two")]],
            ]),
          }),
        ],
      ],
    ]),
  };
  const initValue: MessageValue = {
    fields: new Map<number, Array<FieldValue>>([]),
  };
  const [value, setValue] = useState<MessageValue>(initValue);

  function handleAction(action: Action) {
    console.log(action);
    if (action.type === "set") {
      setValue((v) => {
        const newValue = setFieldValue(action.cursor, action.value, v);
        console.log("new value", newValue);
        if (newValue.type === T.MESSAGE) {
          return newValue.value;
        } else {
          return v;
        }
      });
    } else if (action.type === "remove") {
      setValue((v) => {
        const newValue = removeFieldValue(v, action.cursor);
        console.log("new value", newValue);
        return newValue;
      });
    }
  }

  function removeFieldValue(
    message: MessageValue,
    cursor: Cursor
  ): MessageValue {
    console.log("removeFieldValue", printCursor(cursor));
    const selector = cursor[0];
    const newMessage = cloneDeep(message);
    if (newMessage.fields.has(selector.fieldID)) {
      const currentFieldValues = newMessage.fields.get(selector.fieldID)!;
      if (cursor.length == 1) {
        if (currentFieldValues.length > 1) {
          currentFieldValues.splice(selector.index, 1);
        } else {
          // Last element in the array, so remove the field entirely.
          // TODO: Check the actual index.
          newMessage.fields.delete(selector.fieldID);
        }
      } else {
        const currentFieldValue = currentFieldValues[selector.index];
        if (currentFieldValue.type !== T.MESSAGE) {
          console.log("currentFieldValue is not a message", currentFieldValue);
          return newMessage;
        } else {
          const newMessage = removeFieldValue(
            currentFieldValue.value,
            cursor.slice(1)
          );
          currentFieldValues[selector.index] = messageValue(newMessage);
        }
      }
    }
    return newMessage;
  }

  function setFieldValue(
    cursor: Cursor,
    fieldValue: FieldValue,
    message?: MessageValue
  ): FieldValue {
    console.log("setFieldValue", printCursor(cursor), fieldValue);
    if (cursor.length == 0) {
      return fieldValue;
    } else {
      const newMessage = cloneDeep(message!);
      const selector = cursor[0];
      const fieldID = selector.fieldID;
      const currentFieldValues = newMessage.fields.get(fieldID);
      if (currentFieldValues !== undefined) {
        const currentFieldValue =
          currentFieldValues[selector.index] ??
          messageValue({
            fields: new Map<number, Array<FieldValue>>([]),
          });
        var messageV;
        if (currentFieldValue.type !== T.MESSAGE) {
          console.log("currentFieldValue is not a message", currentFieldValue);
          messageV = undefined;
        } else {
          messageV = currentFieldValue.value;
        }
        const newFieldValue = setFieldValue(
          cursor.slice(1),
          fieldValue,
          messageV // Ok to pass null here, because we know that the field is a message.
        );
        currentFieldValues[selector.index] = newFieldValue;
      } else {
        const newFieldValue = setFieldValue(cursor.slice(1), fieldValue, {
          fields: new Map<number, Array<FieldValue>>([]),
        });
        newMessage.fields.set(fieldID, [newFieldValue]);
      }
      return messageValue(newMessage);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <MessageView
        schema={schema}
        messageID={1}
        value={value}
        onAction={handleAction}
        cursor={[]}
      ></MessageView>
    </main>
  );
}
