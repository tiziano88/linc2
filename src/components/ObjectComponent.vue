<script lang="ts">
import Field from "./Field.vue";
import type { ValueField, ValueObject } from "../schema";
import { loadProto } from "@/utils/protoloader";
import { watch } from "vue";

export default {
  props: {
    modelValue: Object as () => protobuf.Message,
    schema: Object as () => protobuf.Root,
    messageType: String,
  },
  emits: ["update:modelValue"],
  methods: {
    update(f: protobuf.Field, v: any) {
      console.log("update", this.messageType, f, v);
      let T = this.schema!.lookupType(this.messageType!);
      let old_value = this.modelValue ?? {};
      let o = T.fromObject(old_value);
      console.log("current object", o);
      (o as any)[f.name] = v;
      this.$emit("update:modelValue", o);
    },
  },
  setup(props, ctx) {
    try {
      const MessageType = props.schema!.lookupType(props.messageType!);
      console.log("message type", MessageType);
    } catch (e) {
      console.log("error", e);
    }
  },
  computed: {
    fields() {
      const MessageType = this.schema!.lookupType(this.messageType!);
      console.log("message type", MessageType);
      try {
        return MessageType.fieldsArray;
      } catch (e) {
        console.log("error looking up message type in schema", e);
        return [];
      }
    },
    messageTypeConcrete() {
      return this.schema!.lookupType(this.messageType!);
    },
  },
  components: {
    Field,
  },
};
</script>

<template>
  <ul>
    <li v-for="(f, i) in fields" :key="f.name">
      <Field
        :modelValue="(modelValue ?? {} as any)[f.name]"
        @update:modelValue="update(f, $event)"
        :schema="schema"
        :field="f"
      />
    </li>
  </ul>
</template>
