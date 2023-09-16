import { FieldValue, T, getIn, stringValue } from "../src/app/types";

describe("testing tree traversal", () => {
  test("simple message", () => {
    const tree: FieldValue = {
      type: T.MESSAGE,
      value: {
        fields: new Map([
          [
            44,
            [
              stringValue("hello_0"),
              stringValue("hello_1"),
              stringValue("hello_2"),
            ],
          ],
        ]),
      },
    };
    expect(getIn(tree, [{ fieldID: 44, index: 1 }])).toStrictEqual(
      stringValue("hello_1")
    );
  });
});
