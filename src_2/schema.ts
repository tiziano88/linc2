export type { ValueObject, ValueField }

interface ValueObject {
    fields: ValueField[];
}

interface ValueField {
    name: string;
    value: string | number | boolean | ValueObject | null;
}
