<template>
  <div>
    <h2>History of rating events</h2>

    <div v-if="!!pastLogs?.length">
      <transaction-list-item
        v-for="pastLog in pastLogs"
        :key="pastLog.transaction.transactionHash"
        :transaction="pastLog.transaction"
        :event="pastLog.event"
        :isInFocus="eventIdInFocus === pastLog.event.id"
        @select:transactionEvent="onEmitSelectTransactionEvent"
      ></transaction-list-item>
    </div>

    <p-message v-else severity="info">
      Not found events. Try to be first!
    </p-message>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import PMessage from "primevue/message";
import TransactionListItem from "../../components/transactions/TransactionListItem.vue";
import Web3Connection from "../../services/web3/Web3Connection";
import Web3 from "web3";
import Web3ContractDevmuneRating from "../../services/web3/Web3ContractDevmuneRating";
// @ts-ignore
import * as DevmuneContractAbi from "../../contracts/DevmuneRatingInteractor.abi.json";

export default defineComponent({
  components: {
    PMessage,
    TransactionListItem,
  },
  emits: {
    "select:transactionEvent": (payload: any) => {
      return true;
    },
  },
  setup(props, { emit }) {
    const devmuneContractAddress = "0x4efd0C1E7E3DD4cA2ea6C737d1c6CcEDAcaBdc43";
    const eventNameForObserve = "DataFulfilled";

    const eventIdInFocus = ref<string | undefined>(undefined);

    const web3Connection = Web3Connection.getInstance(Web3.givenProvider);
    const devmuneContract = Web3ContractDevmuneRating.getInstance(
      DevmuneContractAbi.default,
      devmuneContractAddress,
      web3Connection
    );

    const pastLogs = ref<any[]>([]);

    const createPastLogsForDevmuneContract = async () => {
      try {
        const logs = await devmuneContract
          .getContract()
          .getPastEvents(eventNameForObserve, {
            fromBlock: "0x0",
          });
        debugger;

        for await (const pastLog of logs) {
          const transactionDetails = await web3Connection
            .getWeb3()
            .eth.getTransaction(pastLog.transactionHash);
          debugger;

          pastLogs.value.push({
            transaction: transactionDetails,
            event: pastLog,
          });
        }
      } catch (ex) {
        console.error(ex);
      }
    };

    onMounted(async () => {
      await createPastLogsForDevmuneContract();
    });

    const onEmitSelectTransactionEvent = (payload: any) => {
      debugger;
      eventIdInFocus.value = payload.id;
      emit("select:transactionEvent", payload);
    };

    return {
      eventIdInFocus,
      pastLogs,
      onEmitSelectTransactionEvent,
    };
  },
});
</script>

<style scoped></style>
