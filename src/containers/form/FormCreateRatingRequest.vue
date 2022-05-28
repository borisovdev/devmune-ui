<template>
  <div>
    <h2>Create Rating request</h2>

    <transition name="fade">
      <progress-bar
        v-if="currentConfirmationStep !== undefined"
        :value="progressBarValue"
      >
        {{ currentConfirmationStep.label }}
      </progress-bar>
    </transition>

    <div class="mb-2">
      <span style="display: block" class="mb-2">Try our presets</span>
      <div style="display: inline-flex; flex-wrap: wrap;">
        <p-button
          v-for="preset in presets"
          :key="preset.name"
          :label="preset.name"
          class="me-2 mb-2 p-button-outlined p-button-secondary"
          @click.stop="() => onClickPreset(preset)"
        ></p-button>
      </div>
    </div>

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
            :readonly="true"
            :disabled="true"
          ></input-text>
        </div>

        <div class="col">
          <input-text
            id="field-repo-owner"
            type="text"
            v-model="dataForRatingContract.repoOwner"
            placeholder="Repository owner"
            class="mb-3"
            :readonly="true"
            :disabled="true"
          ></input-text>
        </div>

        <div class="col">
          <p-calendar
            v-model="dataForRatingContract.fromDate"
            dateFormat="yy-mm-dd"
            :manualInput="false"
            placeholder="From date"
            :readonly="true"
            :disabled="true"
          ></p-calendar>
        </div>
      </fieldset>

      <p-button
        type="submit"
        :label="currentConfirmationStep?.label ?? `Send request to Node`"
        class="p-button-rounded"
        :loading="currentConfirmationStep !== undefined"
      ></p-button>
    </form>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, watch } from "vue";
import Web3 from "web3";
import Web3Connection from "../../services/web3/Web3Connection";
import Web3ContractDevmuneRating from "../../services/web3/Web3ContractDevmuneRating";
import InputText from "primevue/inputtext";
import PButton from "primevue/button";
import ProgressBar from "primevue/progressbar";
import PCalendar from "primevue/calendar";
// @ts-ignore
import * as DevmuneContractAbi from "../../contracts/DevmuneRatingInteractor.abi.json";

export default defineComponent({
  components: {
    InputText,
    PButton,
    ProgressBar,
    PCalendar,
  },
  setup() {
    const devmuneContractAddress = import.meta.env
      .VITE_DEVMUNE_CONTRACT_ADDRESS;
    const web3Connection = Web3Connection.getInstance(Web3.givenProvider);
    const devmuneContract = Web3ContractDevmuneRating.getInstance(
      // @ts-ignore
      DevmuneContractAbi.default,
      devmuneContractAddress,
      web3Connection
    );

    const getDateFromIso = (iso: string): Date => {
      const d = new Date();
      d.setTime(Date.parse(iso));
      return d;
    };

    const presets = [
      {
        name: "ExpressionEngine",
        repo: "ExpressionEngine",
        repoOwner: "ExpressionEngine",
        fromDate: getDateFromIso("2022-03-05"),
      },
      {
        name: "Vue-CLI",
        repo: "vue-cli",
        repoOwner: "vuejs",
        fromDate: getDateFromIso("2022-03-05"),
      },
      {
        name: "Chainlink",
        repo: "chainlink",
        repoOwner: "smartcontractkit",
        fromDate: getDateFromIso("2022-03-05"),
      },
      {
        name: "React",
        repo: "react",
        repoOwner: "facebook",
        fromDate: getDateFromIso("2022-03-05"),
      },
      {
        name: "Bootstrap",
        repo: "bootstrap",
        repoOwner: "twbs",
        fromDate: getDateFromIso("2022-03-05"),
      },
      {
        name: "NodeRed",
        repo: "node-red",
        repoOwner: "node-red",
        fromDate: getDateFromIso("2022-03-05"),
      },
      {
        name: "HardHat",
        repo: "hardhat",
        repoOwner: "NomicFoundation",
        fromDate: getDateFromIso("2022-03-05"),
      },
      {
        name: "Ganache",
        repo: "ganache",
        repoOwner: "trufflesuite",
        fromDate: getDateFromIso("2022-03-05"),
      },
      {
        name: "Vuejs Core",
        repo: "core",
        repoOwner: "vuejs",
        fromDate: getDateFromIso("2022-03-05"),
      },
    ];

    const onClickPreset = (preset: any): void => {
      dataForRatingContract.repo = preset.repo;
      dataForRatingContract.repoOwner = preset.repoOwner;
      dataForRatingContract.fromDate = preset.fromDate;
    };

    const callRequestRatingFromContract = async () => {
      try {
        currentConfirmationStep.value = transactionConfirmationSteps["signing"];

        const txHash = await devmuneContract.sendRequestRatingFromContract(
          dataForRatingContract.repo,
          dataForRatingContract.repoOwner,
          dataForRatingContract.fromDate
        );
        if (!txHash) {
          currentConfirmationStep.value = undefined;
          return;
        }

        currentConfirmationStep.value = transactionConfirmationSteps["done"];
      } catch (ex) {
        console.warn(ex);
        currentConfirmationStep.value = undefined;
      }
    };

    const dataForRatingContract = reactive<any>({
      repo: "",
      repoOwner: "",
      fromDate: "",
    });

    const onClickSendRequestToNode = async () => {
      await callRequestRatingFromContract();
    };

    const currentConfirmationStep = ref<any | undefined>(undefined);
    const progressBarValue = computed<number>(() => {
      if (currentConfirmationStep.value === undefined) return 0;
      const all = Object.keys(transactionConfirmationSteps).length + 1;
      return Math.ceil(100 / (all - currentConfirmationStep.value.index));
    });

    watch(
      () => currentConfirmationStep.value,
      (newValue, oldValue) => {
        if (!newValue?.isFinish) return;

        setTimeout(() => {
          currentConfirmationStep.value = undefined;
        }, 1000);
      }
    );

    const transactionConfirmationSteps = {
      signing: {
        index: 1,
        label: "await signing...",
        isFinish: false,
      },
      transactionHash: {
        index: 2,
        label: "await transaction hash...",
        isFinish: false,
      },
      receipt: {
        index: 3,
        label: "await transaction receipt...",
        isFinish: false,
      },
      confirmation: {
        index: 4,
        label: "await transaction confirmation...",
        isFinish: false,
      },
      done: {
        index: 5,
        label: "done",
        isFinish: true,
      },
    };

    return {
      presets,
      dataForRatingContract,
      currentConfirmationStep,
      progressBarValue,
      onClickPreset,
      onClickSendRequestToNode,
    };
  },
});
</script>

<style scoped></style>
