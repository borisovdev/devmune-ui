<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import Web3 from "web3";
import * as DevmuneContractAbi from "../contracts/DevmuneRatingInteractor.abi.json";

export default defineComponent({
  props: {},
  setup() {
    const web3 = new Web3(Web3.givenProvider);
    onMounted(() => {
      // @ts-ignore
      window.web3 = web3;
    });

    const devmuneContract = new web3.eth.Contract(
      // @ts-ignore
      DevmuneContractAbi.default,
      "0x64328b80086b61fe94cC63F9b3F8BA07a96718C5"
    );

    const firstPlaceLogin = ref<string>();

    const callFirstPlace = async () => {
      try {
        debugger;
        const callResult = await devmuneContract.methods.firstPlace().call();
        console.log(callResult);
        firstPlaceLogin.value = callResult;
      } catch (ex) {
        console.error(ex);
      }
    };

    const onClick = async () => {
      await callFirstPlace();
    };

    return {
      firstPlaceLogin,
      onClick,
    };
  },
});
</script>

<template>
  <div>
    <button @click="onClick">call method</button>
    {{firstPlaceLogin}}
  </div>
</template>

<style scoped></style>
