<template>
  <p-card>
    <template #title>
      {{ transaction.hash }}
    </template>

    <template #subtitle>
      From {{ transaction.from }} To {{ transaction.to }}
    </template>

    <template #content>
      <code>
        {{ decodedInput }}
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
  },
  setup(props) {
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

    const decodedInput = computed(() => {
      try {
        // return web3.utils.toAscii(props.transaction.input);
        debugger;
        return web3.eth.abi.decodeLog(
          inputForAbiDecode,
          props.transaction.input,
          []
        );
      } catch (ex) {
        console.warn(ex);
        return "";
      }
    });

    return {
      decodedInput,
    };
  },
});
</script>

<style scoped></style>
