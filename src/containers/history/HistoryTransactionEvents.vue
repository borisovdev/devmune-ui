<template>
  <div>
    <h2>History of rating events</h2>

    <transition name="fade">
      <div v-if="!!transactionEventsSortedByBlockNumberASC?.length">
        <transition-group name="list" tag="div">
          <transaction-list-item
            v-for="pastLog in transactionEventsSortedByBlockNumberASC"
            :key="pastLog.transaction.transactionHash"
            :transaction="pastLog.transaction"
            :event="pastLog.event"
            :isInFocus="eventIdInFocus === pastLog.event.id"
            @select:transactionEvent="onEmitSelectTransactionEvent"
          ></transaction-list-item>
        </transition-group>
      </div>

      <p-message v-else severity="info">
        Not found events. Try to be first!
      </p-message>
    </transition>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from "vue";
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
    const devmuneContractAddress = import.meta.env.VITE_DEVMUNE_CONTRACT_ADDRESS;
    const eventNameForObserve = "DataFulfilled";

    const eventIdInFocus = ref<string | undefined>(undefined);

    const web3Connection = Web3Connection.getInstance(Web3.givenProvider);
    const devmuneContract = Web3ContractDevmuneRating.getInstance(
      // @ts-ignore
      DevmuneContractAbi.default,
      devmuneContractAddress,
      web3Connection
    );

    const transactionEvents = ref<any[]>([]);
    const transactionEventsSortedByBlockNumberASC = computed<any[]>(() => {
      return transactionEvents.value.sort((a, b) => {
        return b.transaction.blockNumber - a.transaction.blockNumber;
      });
    });

    const createTransactionEventFromEvent = async (
      event: any
    ): Promise<any> => {
      const transactionDetails = await web3Connection
        .getWeb3()
        .eth.getTransaction(event.transactionHash);
      debugger;

      return {
        transaction: transactionDetails,
        event: event,
      };
    };

    const createtransactionEventsForDevmuneContract = async () => {
      try {
        const events = await devmuneContract
          .getContract()
          .getPastEvents(eventNameForObserve, {
            fromBlock: "0x0",
          });

        for await (const event of events) {
          const transactionEvent = await createTransactionEventFromEvent(event);
          transactionEvents.value.push(transactionEvent);
        }
      } catch (ex) {
        console.error(ex);
      }
    };

    // onMounted(async () => {
    //   await createtransactionEventsForDevmuneContract();
    // });

    const subscribeToNewTransactionEvents = () => {
      devmuneContract
        .getContract()
        .events[eventNameForObserve]({
          fromBlock: "0x0",
        })
        .on("data", async (event: any) => {
          debugger;
          const transactionEvent = await createTransactionEventFromEvent(event);
          transactionEvents.value.push(transactionEvent);
        })
        .on("changed", (event: any) => {
          debugger;
        })
        .on("connected", (subId: string) => {
          //
        })
        .on("error", (error: Error) => {
          console.warn(error);
        });
    };

    onMounted(() => {
      subscribeToNewTransactionEvents();
    });

    const onEmitSelectTransactionEvent = (payload: any) => {
      eventIdInFocus.value = payload.id;
      emit("select:transactionEvent", payload);
    };

    return {
      eventIdInFocus,
      transactionEventsSortedByBlockNumberASC,
      onEmitSelectTransactionEvent,
    };
  },
});
</script>

<style scoped></style>
