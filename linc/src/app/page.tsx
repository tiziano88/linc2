"use client";

import Image from "next/image";
import { useState } from "react";

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
  | { type: "remove" };

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
    return <div>{value.value}</div>;
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

function FieldView({
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
  function handleClick() {
    const newCursor = [...cursor];
    newCursor[newCursor.length - 1].index = values.length;
    var newValue: FieldValue;
    if (fieldDescriptor!.type.type === T.MESSAGE) {
      newValue = messageValue({
        fields: new Map<number, Array<FieldValue>>([]),
      });
    } else if (fieldDescriptor!.type.type === T.STRING) {
      newValue = stringValue("xyz");
    } else if (fieldDescriptor!.type.type === T.NUMBER) {
      newValue = numberValue(123);
    } else if (fieldDescriptor!.type.type === T.BOOLEAN) {
      newValue = { type: T.BOOLEAN, value: true };
    } else {
      newValue = stringValue("unknown");
    }
    onAction({ type: "set", cursor: newCursor, value: newValue });
  }
  return (
    <div>
      <div>
        {values.map((value, i) => {
          const fieldValueCursor = [...cursor];
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
      <div>
        [ {fieldID} : {printFieldDescriptor(fieldDescriptor)} ]
        <button onClick={handleClick}>ADD</button>
      </div>
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
          const fieldCursor = [...cursor, { fieldID, index: 0 }];
          return (
            <div key={fieldID}>
              <FieldView
                schema={schema}
                messageID={messageID}
                fieldID={fieldID}
                values={values}
                onAction={onAction}
                cursor={fieldCursor}
              ></FieldView>
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
          name: "message_1",
          fields: new Map<FieldID, FieldDescriptor>([
            [
              1,
              {
                type: { type: T.STRING },
                name: "field_1",
                repeated: true,
              },
            ],
            [
              2,
              {
                type: { type: T.STRING },
                name: "field_2",
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
          name: "message_2",
          fields: new Map<FieldID, FieldDescriptor>([
            [
              1,
              {
                type: { type: T.STRING },
                name: "field_2_1",
                repeated: true,
              },
            ],
          ]),
        },
      ],
    ]),
  };
  const initValue: MessageValue = {
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
  const [value, setValue] = useState<MessageValue>(initValue);

  function handleAction(action: Action) {
    console.log(action);
    if (action.type === "set") {
      setValue((v) => {
        const newValue = setFieldValue(v, action.cursor, action.value);
        console.log("new value", newValue);
        if (newValue.type === T.MESSAGE) {
          return newValue.value;
        } else {
          return v;
        }
      });
    }
  }

  function setFieldValue(
    message: MessageValue,
    cursor: Cursor,
    fieldValue: FieldValue
  ): FieldValue {
    console.log("setFieldValue", printCursor(cursor), fieldValue);
    if (cursor.length < 1) {
      return fieldValue;
    } else {
      const newMessage = { ...message };
      const selector = cursor[0];
      const fieldID = selector.fieldID;
      const currentFieldValues = newMessage.fields.get(fieldID);
      if (currentFieldValues !== undefined) {
        const currentFieldValue =
          currentFieldValues[selector.index] ??
          messageValue({
            fields: new Map<number, Array<FieldValue>>([]),
          });
        if (currentFieldValue.type !== T.MESSAGE) {
          console.log("currentFieldValue is not a message");
          return messageValue(newMessage);
        }
        const newFieldValue = setFieldValue(
          currentFieldValue.value,
          cursor.slice(1),
          fieldValue
        );
        currentFieldValues[selector.index] = newFieldValue;
      } else {
        const newFieldValue = setFieldValue(
          {
            fields: new Map<number, Array<FieldValue>>([]),
          },
          cursor.slice(1),
          fieldValue
        );
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
