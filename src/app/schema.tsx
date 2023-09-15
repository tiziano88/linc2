import {
  Schema,
  MessageID,
  MessageDescriptor,
  FieldID,
  FieldDescriptor,
  T,
} from "./types";

export const rustManifestSchema: Schema = {
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
              type: { type: T.STRING },
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
