<template>
  <div>
    <h2>Create Rating request</h2>

    <form
      :style="{ textAlign: `left` }"
      @submit.prevent="onClickSendRequestToNode"
    >
      <fieldset class="row" :style="{ border: `none` }">
        <legend>Enter GitHub repository data for create rating</legend>
        <div class="col">
          <input-text
            id="field-repo"
            type="text"
            v-model="dataForRatingContract.repo"
            placeholder="Repository"
            class="mb-3"
          ></input-text>
        </div>

        <div class="col">
          <input-text
            id="field-repo-owner"
            type="text"
            v-model="dataForRatingContract.repoOwner"
            placeholder="Repository owner"
            class="mb-3"
          ></input-text>
        </div>
      </fieldset>

      <p-button
        type="submit"
        label="Send request to node"
        class="p-button-rounded"
      ></p-button>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import Web3 from "web3";
import Web3Connection from "../../services/web3/Web3Connection";
import Web3ContractDevmuneRating from "../../services/web3/Web3ContractDevmuneRating";
import InputText from "primevue/inputtext";
import PButton from "primevue/button";
// @ts-ignore
import * as DevmuneContractAbi from "../../contracts/DevmuneRatingInteractor.abi.json";

export default defineComponent({
  components: {
    InputText,
    PButton,
  },
  setup() {
    const devmuneContractAddress = "0x4efd0C1E7E3DD4cA2ea6C737d1c6CcEDAcaBdc43";
    const web3Connection = Web3Connection.getInstance(Web3.givenProvider);
    const devmuneContract = Web3ContractDevmuneRating.getInstance(
      DevmuneContractAbi.default,
      devmuneContractAddress,
      web3Connection
    );

    const callRequestRatingFromContract = async () => {
      try {
        const result = await devmuneContract.sendRequestRatingFromContract(
          dataForRatingContract.repo,
          dataForRatingContract.repoOwner,
          dataForRatingContract.fromDate
        );
      } catch (ex) {
        console.warn(ex);
      }
    };

    const dataForRatingContract = reactive({
      repo: "",
      repoOwner: "",
      fromDate: "2022-03-05",
    });

    const onClickSendRequestToNode = async () => {
      await callRequestRatingFromContract();
    };

    return {
      dataForRatingContract,
      onClickSendRequestToNode,
    };
  },
});
</script>

<style scoped></style>
