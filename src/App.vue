<script setup lang="ts">
import Field from "./components/Field.vue";
import ObjectComponent from "./components/ObjectComponent.vue";
import type { ValueField, ValueObject } from "./schema";
import { updateExpression } from "@babel/types";
import { loadProto, type Action } from "./utils/protoloader";
import protobuf, { Message } from "protobufjs";
import { onMounted, toRaw } from "vue";
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
      rootTypeName: "Manifest",
    };
  },
  computed: {
    rootType(): protobuf.Type | null {
      try {
        return this.schema.lookupType(this.rootTypeName);
      } catch (e) {
        // console.log("error looking up root type", e);
        return null;
      }
    },
  },
  methods: {
    getSchema() {
      loadProto("/schema.proto").then((p) => {
        console.log("loaded schema", p);
        this.schema = p;
        const MessageType = this.rootType;
        if (!MessageType) {
          console.log("no schema found type");
          return;
        }
        this.v = MessageType.create({
          field1: "test",
        });
      });
    },
    up(n: any) {
      console.log("updating root object: ", toRaw(n));
      this.v = n;
    },
    action(action: Action) {
      console.log("action", action);
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
      :message-type-name="rootTypeName"
      @action="action"
    ></ObjectComponent>

    <div>
      message
      <!-- {{ v?.toJSON() || "not set" }} -->
    </div>

    <div>
      encoded
      {{ rootType?.encode(v)?.finish() || "not set" }}
    </div>

    <div>
      schema
      <!-- {{ schema.toJSON() }} -->
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
