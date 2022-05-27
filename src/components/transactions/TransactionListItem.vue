<template>
  <p-card
    :class="[
      `transaction-list-item`,
      `mb-2`,
      { 'transaction-list-item--in-focus': isInFocus },
    ]"
    @click.stop="onClickCard"
  >
    <template #title>
      <h3 :style="{ fontSize: `0.9rem` }">
        {{ transaction.hash }}
      </h3>
    </template>

    <template #subtitle>
      <p :style="{ fontSize: `0.825rem` }">
        From {{ transaction.from }} To {{ transaction.to }}
      </p>
    </template>

    <template #content>
      <span
        :style="{
          display: `block`,
          marginBottom: `5px`,
          fontSize: `0.825rem`,
          fontWeight: `600`,
        }"
        >Event decoded data</span
      >

      <code :style="{ fontSize: `12px` }">
        {{ decodedEventInput }}
      </code>
    </template>
  </p-card>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import PCard from "primevue/card";
import Web3 from "web3";

export default defineComponent({
  components: {
    PCard,
  },
  props: {
    transaction: {
      type: Object,
      required: true,
    },
    event: {
      type: Object,
      required: true,
    },
    isInFocus: {
      type: Boolean,
      required: true,
    },
  },
  emits: {
    "select:transactionEvent": (payload: any) => {
      return true;
    },
  },
  setup(props, { emit }) {
    const web3 = new Web3(Web3.givenProvider);

    const inputForAbiDecode = [
      {
        type: "bytes32",
        name: "requestId",
        indexed: true,
      },
      {
        type: "string",
        name: "firstPlace",
      },
      {
        type: "uint256",
        name: "firstPlaceWeight",
      },
      {
        type: "string",
        name: "secondPlace",
      },
      {
        type: "uint256",
        name: "secondPlaceWeight",
      },
      {
        type: "string",
        name: "thirdPlace",
      },
      {
        type: "uint256",
        name: "thirdPlaceWeight",
      },
    ];

    const decodedEventInput = computed(() => {
      try {
        return web3.eth.abi.decodeLog(
          inputForAbiDecode,
          props.event.raw.data,
          props.event.raw.topics
        );
      } catch (ex) {
        console.warn(ex);
        return "Error on decoding";
      }
    });

    const onClickCard = () => {
      emit("select:transactionEvent", props.event);
    };

    return {
      decodedEventInput,
      onClickCard,
    };
  },
});
</script>

<style scoped>
.transaction-list-item {
  cursor: pointer;
  text-align: left;
  transition: all 0.3s ease;
}
.transaction-list-item--in-focus {
  border: 1px solid var(--main-color);
}
</style>
