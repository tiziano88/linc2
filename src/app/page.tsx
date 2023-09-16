"use client";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import _ from "lodash";
import React from "react";
import { Map as IMap, List } from "immutable";
import {
  Action,
  ActionHandler,
  Cursor,
  FieldDescriptor,
  FieldID,
  FieldValue,
  MessageDescriptor,
  MessageID,
  MessageValue,
  Schema,
  T,
  child,
  messageValue,
  nextSibling,
  numberValue,
  previousSibling,
  printCursor,
  printFieldDescriptor,
  stringValue,
} from "./types";
import "./schema";
import { rustManifestSchema } from "./schema";

function FieldValueView({
  schema,
  messageID,
  fieldID,
  value,
  onAction,
  cursor,
  selected,
}: {
  schema: Schema;
  messageID: MessageID;
  fieldID: FieldID;
  value: FieldValue;
  onAction: ActionHandler;
  cursor: Cursor;
  selected: Cursor;
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
  function handleSelect() {
    onAction({ type: "select", cursor: cursor });
  }

  // Set focus on the textarea when the cursor is selected.
  var textarea: HTMLTextAreaElement | null = null;

  useEffect(() => {
    // Did mount.
    if (_.isEqual(cursor, selected)) {
      textarea?.focus();
    }
  });

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

    var className = "";
    if (_.isEqual(cursor, selected)) {
      className += "selected";
    }

    return (
      <div className={className} onMouseDown={handleSelect}>
        <textarea
          ref={(el) => {
            textarea = el;
          }}
          rows={1}
          className="fieldValueText"
          value={value.value}
          onChange={changeHandler}
        ></textarea>
        <button className="removeButton" onClick={handleRemove}>
          <RemoveCircleIcon></RemoveCircleIcon>
        </button>
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
    var className = "";
    if (_.isEqual(cursor, selected)) {
      className += "selected";
    }
    return (
      <div className={className}>
        <button className="removeButton" onClick={handleRemove}>
          <RemoveCircleIcon></RemoveCircleIcon>
        </button>
        <MessageView
          schema={schema}
          messageID={fieldType.messageID}
          value={value.value}
          onAction={onAction}
          cursor={cursor}
          selected={selected}
        ></MessageView>
      </div>
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
  selected,
}: {
  schema: Schema;
  messageID: MessageID;
  fieldID: FieldID;
  values: FieldValue[];
  onAction: ActionHandler;
  cursor: Cursor;
  selected: Cursor;
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
      newValue = messageValue();
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
          function handleSelect(
            event: React.MouseEvent<HTMLDivElement, MouseEvent>
          ) {
            event.preventDefault();
            onAction({ type: "select", cursor: fieldValueCursor });
          }
          return (
            <div key={i} className="flex m-2">
              <div className="fieldDescriptor" onMouseDown={handleSelect}>
                {fieldID} : {printFieldDescriptor(fieldDescriptor)}
              </div>
              <FieldValueView
                schema={schema}
                messageID={messageID}
                fieldID={fieldID}
                value={value}
                onAction={onAction}
                cursor={fieldValueCursor}
                selected={selected}
              ></FieldValueView>
            </div>
          );
        })}
      </div>
      {(values.length == 0 || fieldDescriptor.repeated) && (
        <div className="m-2">
          <div className="fieldDescriptor virtual" onClick={handleAdd}>
            {fieldID} : {printFieldDescriptor(fieldDescriptor)}
          </div>
          <button className="addButton" onClick={handleAdd}>
            <AddCircleIcon></AddCircleIcon>
          </button>
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
  selected,
}: {
  schema: Schema;
  messageID: MessageID;
  value: MessageValue;
  onAction: ActionHandler;
  cursor: Cursor;
  selected: Cursor;
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
                selected={selected}
              ></RepeatedFieldView>
            </div>
          );
        }
      )}
    </div>
  );
}

export default function Home() {
  const schema: Schema = cloneDeep(rustManifestSchema);
  const initValue: MessageValue = {
    fields: new Map<number, Array<FieldValue>>([]),
  };
  const [value, setValue] = useState<MessageValue>(initValue);
  const [cursor, setCursor] = useState<Cursor>([]);

  function handleAction(action: Action) {
    console.log(action);
    switch (action.type) {
      case "set":
        setValue((v) => {
          const newValue = setFieldValue(v, action.cursor, action.value);
          console.log("new value", newValue);
          return newValue;
        });
        setCursor(action.cursor);
        break;
      case "remove":
        setValue((v) => {
          const newValue = removeFieldValue(v, action.cursor);
          console.log("new value", newValue);
          return newValue;
        });
        break;
      case "select":
        setCursor(action.cursor);
        break;
      case "move":
        switch (action.direction) {
          case "previous":
            setCursor((c) => {
              return previousSibling({ type: T.MESSAGE, value }, c);
            });
            break;
          case "next":
            setCursor((c) => {
              return nextSibling({ type: T.MESSAGE, value }, c);
            });
            break;
          case "parent":
            setCursor((c) => {
              const newCursor = cloneDeep(c);
              if (newCursor.length > 0) {
                newCursor.pop();
              }
              return newCursor;
            });
            break;
          case "child":
            setCursor((c) => {
              // Move the cursor to the next child element taking into account the actual value, not just the schema.
              return child({ type: T.MESSAGE, value }, c);
            });
            break;
        }
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
          currentFieldValues[selector.index] = {
            type: T.MESSAGE,
            value: newMessage,
          };
        }
      }
    }
    return newMessage;
  }

  function setFieldValue(
    message: MessageValue,
    cursor: Cursor,
    fieldValue: FieldValue
  ): MessageValue {
    console.log("setFieldValue", printCursor(cursor), fieldValue);
    const selector = cursor[0];
    const newMessage = cloneDeep(message);
    if (!newMessage.fields.has(selector.fieldID)) {
      newMessage.fields.set(selector.fieldID, []);
    }
    const currentFieldValues = newMessage.fields.get(selector.fieldID)!;
    if (newMessage.fields.has(selector.fieldID)) {
      if (cursor.length == 1) {
        // End recursion.
        currentFieldValues[selector.index] = fieldValue;
      } else {
        const currentFieldValue = currentFieldValues[selector.index];
        if (currentFieldValue.type !== T.MESSAGE) {
          console.log("currentFieldValue is not a message", currentFieldValue);
          return newMessage;
        } else {
          const newMessage = setFieldValue(
            currentFieldValue.value,
            cursor.slice(1),
            fieldValue
          );
          currentFieldValues[selector.index] = {
            type: T.MESSAGE,
            value: newMessage,
          };
        }
      }
    }
    return newMessage;
  }

  let m = IMap<FieldID, List<FieldValue>>();
  m = m.set(1, List([stringValue("hello")]));
  let v = m.getIn([2, 1]);
  console.log("v", v);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Global onAction={handleAction}></Global>
      {printCursor(cursor)}
      <MessageView
        schema={schema}
        messageID={1}
        value={value}
        onAction={handleAction}
        cursor={[]}
        selected={cursor}
      ></MessageView>
    </main>
  );
}

class Global extends React.Component<{ onAction: ActionHandler }> {
  componentDidMount(): void {
    document.addEventListener("keydown", this.handleKeyDown);
  }

  componentWillUnmount(): void {
    document.removeEventListener("keydown", this.handleKeyDown);
  }

  handleKeyDown = (event: KeyboardEvent): void => {
    switch (event.key) {
      case "Escape":
        console.log("escape");
        this.props.onAction({
          type: "set",
          cursor: [{ fieldID: 3, index: 0 }],
          value: { type: T.STRING, value: "hello" },
        });
        break;
      case "ArrowUp":
        console.log("arrow up");
        this.props.onAction({ type: "move", direction: "previous" });
        break;
      case "ArrowDown":
        console.log("arrow down");
        this.props.onAction({ type: "move", direction: "next" });
        break;
      case "ArrowLeft":
        console.log("arrow left");
        this.props.onAction({ type: "move", direction: "parent" });
        break;
      case "ArrowRight":
        console.log("arrow right");
        this.props.onAction({ type: "move", direction: "child" });
        break;
    }
  };

  render(): JSX.Element {
    return <div></div>;
  }
}
