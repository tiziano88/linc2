import Image from "next/image";

interface Obj {
  fields: Map<number, Array<FieldValue>>;
}

type FieldValue =
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "boolean"; value: boolean }
  | { type: "object"; value: Obj };

type MessageID = number;
type FieldID = number;

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

type FieldType =
  | { type: "string" }
  | { type: "number" }
  | { type: "boolean" }
  | { type: "object"; messageID: MessageID };

function FieldValueComponent({
  field,
  schema,
}: {
  field: FieldValue;
  schema: Schema;
}) {
  if (field.type === "string") {
    return <div>{field.value}</div>;
  } else if (field.type === "number") {
    return <div>{field.value}</div>;
  } else if (field.type === "boolean") {
    return <div>{field.value}</div>;
  } else if (field.type === "object") {
    return (
      <ObjectComponent
        schema={schema}
        messageID={1}
        value={field.value}
      ></ObjectComponent>
    );
  } else {
    return <div>-other-</div>;
  }
}

function FieldComponent({
  fieldNumber,
  fieldValue,
  schema,
}: {
  fieldNumber: number;
  fieldValue: FieldValue[];
  schema: Schema;
}) {
  return (
    <div>
      {
        <div>
          {fieldValue.map((field, i) => {
            return (
              <div key="field" className="flex">
                [{fieldNumber}]
                <FieldValueComponent
                  schema={schema}
                  field={field}
                ></FieldValueComponent>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}

function ObjectComponent({
  schema,
  messageID,
  value,
}: {
  schema: Schema;
  messageID: MessageID;
  value: Obj;
}) {
  return (
    <div>
      {Array.from(value.fields).map(([number, value]) => {
        return (
          <div className="inline" key={number}>
            <FieldComponent
              schema={schema}
              fieldNumber={number}
              fieldValue={value}
            ></FieldComponent>
          </div>
        );
      })}
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
                type: { type: "string" },
                name: "field_1",
                repeated: true,
              },
            ],
          ]),
        },
      ],
    ]),
  };
  const x: Obj = {
    fields: new Map<number, Array<FieldValue>>([
      [
        1,
        [
          {
            type: "string",
            value: "hello",
          },
          {
            type: "string",
            value: "hello2",
          },
        ],
      ],
      [
        2,
        [
          {
            type: "string",
            value: "world",
          },
          {
            type: "string",
            value: "world2",
          },
        ],
      ],
      [
        3,
        [
          {
            type: "object",
            value: {
              fields: new Map<number, Array<FieldValue>>([
                [
                  1,
                  [
                    {
                      type: "string",
                      value: "nested hello",
                    },
                  ],
                ],
                [
                  2,
                  [
                    {
                      type: "string",
                      value: "nested two",
                    },
                    {
                      type: "string",
                      value: "nested three",
                    },
                  ],
                ],
              ]),
            },
          },
        ],
      ],
    ]),
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ObjectComponent
        schema={schema}
        messageID={1}
        value={x}
      ></ObjectComponent>
    </main>
  );
}
