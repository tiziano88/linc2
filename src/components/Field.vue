<script lang="ts">
import type { ValueField, ValueObject } from "../schema";
import ObjectComponent from "./ObjectComponent.vue";

export default {
    props: {
        modelValue: Object as () => any,
        field: Object as () => protobuf.Field,
        schema: Object as () => protobuf.Root,
    },
    emits: ['update:modelValue'],
    computed: {
        showString() {
            console.log("field", this.field);
            return (this.field!.type === "string" || this.field!.type === "int32" || this.field!.type === "int64") && this.field!.repeated === false;
        },
        repeated() {
            return this.field!.repeated;
        },
        stringValue: {
            get() {
                return this.modelValue as string;
            },
            set(v: string) {
                if (this.field!.type === "string") {
                    this.$emit('update:modelValue', v);
                } else if (this.field!.type === "bytes") {
                    this.$emit('update:modelValue', Uint8Array.from(v.split(",").map((x) => parseInt(x))));
                } else if (this.field!.type === "int32") {
                    this.$emit('update:modelValue', parseInt(v));
                } else if (this.field!.type === "int64") {
                    this.$emit('update:modelValue', parseInt(v));
                } else if (this.field!.type === "bool") {
                    this.$emit('update:modelValue', v === "true");
                } else {
                    console.log("unknown type", this.field!.type);
                }
                // this.$emit('update:modelValue', v);
            }
        }
    },
    methods: {
        updateObject(v: ValueObject) {
            console.log("field update", v)
            // let o = this.modelValue!;
            this.$emit('update:modelValue', v);
        }
    },
    beforeCreate() {
        this.$options.components = {
            ObjectComponent,
        }
    }
}
</script>

<template>
    {{ field!.name }}: {{ field!.type }}
    <span>{{ modelValue?.name }}</span>:
    <span v-if="showString">
        <textarea v-model="stringValue"></textarea>
    </span>
    <span v-else>
        <ObjectComponent :model-value="modelValue?.value" @update:model-value="updateObject($event)"></ObjectComponent>
    </span>
</template>
