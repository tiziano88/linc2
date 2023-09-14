<script lang="ts">
import { toRaw } from "vue";
import type { ValueField, ValueObject } from "../schema";
import ObjectComponent from "./ObjectComponent.vue";

export default {
  props: {
    modelValue: Object as () => any,
    field: Object as () => protobuf.Field,
    schema: Object as () => protobuf.Root,
  },
  emits: ["update:modelValue"],
  computed: {
    showString(): boolean {
      return (
        this.field!.type === "string" ||
        this.field!.type === "int32" ||
        this.field!.type === "int64"
        //   &&
        // this.field!.repeated === false
      );
    },
    repeated(): boolean {
      return this.field!.repeated;
    },
    isNull(): boolean {
      return this.modelValue === null || this.modelValue === undefined;
    },
    stringValue: {
      get(): string {
        return this.modelValue as string;
      },
      set(v: string) {
        console.log("set", v);
        if (this.field!.type === "string") {
          this.$emit("update:modelValue", v);
        } else if (this.field!.type === "bytes") {
          this.$emit(
            "update:modelValue",
            Uint8Array.from(v.split(",").map((x) => parseInt(x)))
          );
        } else if (this.field!.type === "int32") {
          this.$emit("update:modelValue", parseInt(v));
        } else if (this.field!.type === "int64") {
          this.$emit("update:modelValue", parseInt(v));
        } else if (this.field!.type === "bool") {
          this.$emit("update:modelValue", v === "true");
        } else {
          console.log("unknown type", this.field!.type);
        }
        // this.$emit("update:modelValue", v);
      },
    },
  },
  methods: {
    updateObject(v: ValueObject) {
      console.log("field update", v);
      // let o = this.modelValue!;
      this.$emit("update:modelValue", v);
    },
    addValue() {
      console.log("add value");
      if (this.field!.repeated) {
        console.log("current value", toRaw(this.modelValue));
        let o = this.modelValue ?? [];
        o.push(null);
        o.push(null);
        console.log("new value", toRaw(this.modelValue));
        this.$emit("update:modelValue", o);
      } else {
        this.$emit("update:modelValue", null);
      }
    },
  },
  beforeCreate() {
    this.$options.components = {
      ObjectComponent,
    };
  },
};
</script>

<template>
  {{ field!.name }}: {{ field!.type }}
  <span>
    <!-- {{ modelValue?.name }} -->
  </span>
  :
  <span v-if="showString">
    <textarea v-model="stringValue"></textarea>
  </span>
  <span v-else>
    <div v-if="repeated">len: {{ modelValue?.length }}</div>
    <div v-else="repeated">
      <ObjectComponent
        :model-value="modelValue?.value"
        @update:model-value="updateObject($event)"
        :schema="schema"
        :message-type-name="field!.type"
      ></ObjectComponent>
    </div>
  </span>
  <span v-if="repeated || isNull" @click="addValue"> + </span>
</template>
