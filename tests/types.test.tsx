import {
  FieldValue,
  T,
  field,
  getIn,
  messageValue,
  stringValue,
  parent,
  child,
  nextSibling,
} from "../src/app/types";

describe("testing tree traversal", () => {
  test("simple message", () => {
    const tree: FieldValue = messageValue(
      field(
        44,
        stringValue("hello_0"),
        stringValue("hello_1"),
        stringValue("hello_2")
      )
    );
    expect(getIn(tree, [{ fieldID: 44, index: 1 }])).toStrictEqual(
      stringValue("hello_1")
    );
  });
  test("two level message", () => {
    const tree: FieldValue = messageValue(
      field(
        44,
        stringValue("hello_0"),
        stringValue("hello_1"),
        stringValue("hello_2")
      ),
      field(
        45,
        messageValue(
          field(50, stringValue("world_0_50")),
          field(51, stringValue("world_0_51")),
          field(52, stringValue("world_0_52"))
        ),
        messageValue(
          field(50, stringValue("world_1_50")),
          field(51, stringValue("world_1_51")),
          field(52, stringValue("world_1_52"))
        ),
        messageValue(
          field(50, stringValue("world_2_50")),
          field(51, stringValue("world_2_51")),
          field(52, stringValue("world_2_52"))
        )
      )
    );
    expect(
      getIn(tree, [
        { fieldID: 45, index: 1 },
        { fieldID: 51, index: 0 },
      ])
    ).toStrictEqual(stringValue("world_1_51"));
  });
  test("parent", () => {
    const tree: FieldValue = messageValue(
      field(
        44,
        stringValue("hello_0"),
        stringValue("hello_1"),
        stringValue("hello_2")
      ),
      field(
        45,
        messageValue(
          field(50, stringValue("world_0_50")),
          field(51, stringValue("world_0_51")),
          field(52, stringValue("world_0_52"))
        ),
        messageValue(
          field(50, stringValue("world_1_50")),
          field(51, stringValue("world_1_51")),
          field(52, stringValue("world_1_52"))
        ),
        messageValue(
          field(50, stringValue("world_2_50")),
          field(51, stringValue("world_2_51")),
          field(52, stringValue("world_2_52"))
        )
      )
    );
    expect(
      parent(tree, [
        { fieldID: 45, index: 1 },
        { fieldID: 51, index: 0 },
      ])
    ).toStrictEqual([{ fieldID: 45, index: 1 }]);
  });
  test("child", () => {
    const tree: FieldValue = messageValue(
      field(
        44,
        stringValue("hello_0"),
        stringValue("hello_1"),
        stringValue("hello_2")
      ),
      field(
        45,
        messageValue(
          field(50, stringValue("world_0_50")),
          field(51, stringValue("world_0_51")),
          field(52, stringValue("world_0_52"))
        ),
        messageValue(
          // Not in order.
          field(51, stringValue("world_1_51")),
          field(50, stringValue("world_1_50")),
          field(52, stringValue("world_1_52"))
        ),
        messageValue(
          field(50, stringValue("world_2_50")),
          field(51, stringValue("world_2_51")),
          field(52, stringValue("world_2_52"))
        )
      )
    );
    expect(child(tree, [{ fieldID: 45, index: 1 }])).toStrictEqual([
      { fieldID: 45, index: 1 },
      { fieldID: 50, index: 0 },
    ]);
  });
  test("child", () => {
    const tree: FieldValue = messageValue(
      field(
        44,
        stringValue("hello_0"),
        stringValue("hello_1"),
        stringValue("hello_2")
      ),
      field(
        45,
        messageValue(
          field(50, stringValue("world_0_50")),
          field(51, stringValue("world_0_51")),
          field(52, stringValue("world_0_52"))
        ),
        messageValue(
          // Not in order.
          field(51, stringValue("world_1_51")),
          field(
            50,
            stringValue("world_1_50_0"),
            stringValue("world_1_50_1"),
            stringValue("world_1_50_2")
          ),
          field(52, stringValue("world_1_52"))
        ),
        messageValue(
          field(50, stringValue("world_2_50")),
          field(51, stringValue("world_2_51")),
          field(52, stringValue("world_2_52"))
        )
      )
    );
    expect(
      nextSibling(tree, [
        { fieldID: 45, index: 1 },
        { fieldID: 50, index: 0 },
      ])
    ).toStrictEqual([
      { fieldID: 45, index: 1 },
      { fieldID: 50, index: 1 },
    ]);
    expect(
      nextSibling(tree, [
        { fieldID: 45, index: 1 },
        { fieldID: 50, index: 1 },
      ])
    ).toStrictEqual([
      { fieldID: 45, index: 1 },
      { fieldID: 50, index: 2 },
    ]);
    expect(
      nextSibling(tree, [
        { fieldID: 45, index: 1 },
        { fieldID: 50, index: 2 },
      ])
    ).toStrictEqual([
      { fieldID: 45, index: 1 },
      { fieldID: 51, index: 0 },
    ]);
  });
});
