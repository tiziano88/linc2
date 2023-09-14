<script lang="ts">
import Field from "./Field.vue";
import type { ValueField, ValueObject } from "../schema";
import { loadProto } from "@/utils/protoloader";
import { toRaw, watch } from "vue";

export default {
  props: {
    modelValue: Object as () => protobuf.Message,
    schema: Object as () => protobuf.Root,
    messageTypeName: String,
  },
  emits: ["update:modelValue", "action"],
  methods: {
    update(f: protobuf.Field, v: any) {
      console.log("update", this.messageTypeName, toRaw(f), toRaw(v));
      let MessageType = this.schema!.lookupType(this.messageTypeName!);
      let old_value = this.modelValue ?? {};
      let o = MessageType.fromObject(old_value);
      console.log("current object", toRaw(o));
      console.log("current field", toRaw(f));
      (o as any)[f.name] = v;
      this.$emit("update:modelValue", o);
    },
  },
  setup(props, ctx) {},
  computed: {
    fields(): protobuf.Field[] {
      if (
        this.schema === null ||
        this.schema === undefined ||
        !this.messageTypeName ||
        this.messageTypeConcrete === null
      ) {
        return [];
      }
      return this.messageTypeConcrete.fieldsArray;
    },
    messageTypeConcrete(): protobuf.Type | null {
      try {
        return this.schema!.lookupType(this.messageTypeName!);
      } catch (e) {
        return null;
      }
    },
  },
  components: {
    Field,
  },
};
</script>

<template>
  <button @click="$emit('action', { type: 'add' })">Add</button>
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
