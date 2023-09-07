<script setup lang="ts">
import Field from "./components/Field.vue";
import ObjectComponent from "./components/ObjectComponent.vue";
import type { ValueField, ValueObject } from "./schema";
import { updateExpression } from "@babel/types";
import { loadProto } from "./utils/protoloader";
import protobuf, { Message } from "protobufjs";
import { onMounted } from "vue";
</script>

<script lang="ts">
export default {
  props: {},
  created() {
    this.getSchema();
  },
  data() {
    return {
      v: new protobuf.Message({}),
      schema: protobuf.Root.fromJSON({}),
    };
  },
  computed: {
    rootType() {
      return this.schema.lookupType("Manifest");
    },
  },
  methods: {
    getSchema() {
      loadProto("/schema.proto").then((p) => {
        console.log("loaded schema", p);
        this.schema = p;
        const MessageType = this.rootType;
        this.v = MessageType.create({
          field1: "test",
        });
      });
    },
    up(n: any) {
      console.log("update object: ", n);
      this.v = n;
    },
  },
};
</script>

<template>
  <main>
    <ObjectComponent
      :model-value="v"
      @update:model-value="up"
      :schema="schema"
      message-type="Manifest"
    ></ObjectComponent>

    <div>
      message
      {{ v.toJSON() || "not set" }}
    </div>

    <div>
      encoded
      {{ rootType.encode(v).finish() || "not set" }}
    </div>

    <div>
      schema
      {{ schema.toJSON() }}
    </div>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
