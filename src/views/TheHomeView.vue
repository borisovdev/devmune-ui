<template>
  <section class="container-fluid" :style="{ textAlign: `left` }">
    <div class="row">
      <div class="col-7">
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

        <!-- <button @click="onClick">call method</button> -->

        <div
          v-if="
            places.first !== undefined ||
            places.second !== undefined ||
            places.third !== undefined
          "
          class="mt-4"
        >
          <h2>
            Rating from history
          </h2>

          <div>
            <rating-contributor
              :contributor="places.first"
            ></rating-contributor>

            <rating-contributor
              :contributor="places.second"
            ></rating-contributor>

            <rating-contributor
              :contributor="places.third"
            ></rating-contributor>
          </div>

          <div>
            <p-chart
              v-if="dataForChart !== undefined"
              type="bar"
              :data="dataForChart"
              :options="horizontalOptions"
            ></p-chart>
          </div>
        </div>
      </div>

      <div class="col-5">
        <h2>History of rating events</h2>

        <div v-if="!!pastLogs?.length">
          <transaction-list-item
            v-for="pastLog in pastLogs"
            :key="pastLog.transaction.transactionHash"
            :transaction="pastLog.transaction"
            :event="pastLog.event"
            @select:transactionEvent="onEmitSelectTransactionEvent"
          ></transaction-list-item>
        </div>

        <p-message v-else severity="info">
          Not found events. Try to be first!
        </p-message>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import axios from "axios";
import {
  computed,
  defineComponent,
  onMounted,
  reactive,
  ref,
  watch,
} from "vue";
import Web3 from "web3";
import * as DevmuneContractAbi from "../contracts/DevmuneRatingInteractor.abi.json";
import RatingContributor from "../entity/RatingContributor";
import UsersGithubApiGateway from "../gateway/UsersGithubApiGateway";
import RatingContributorVue from "../components/rating-contributor/RatingContributor.vue";
import UsersGithubApiMapper from "../mappers/UsersGithubApiMapper";
import PChart from "primevue/chart";
import PTimeline from "primevue/timeline";
import TransactionListItem from "../components/transactions/TransactionListItem.vue";
import InputText from "primevue/inputtext";
import PButton from "primevue/button";
import PMessage from "primevue/message";

type Places = {
  first: RatingContributor | undefined;
  second: RatingContributor | undefined;
  third: RatingContributor | undefined;
};

export default defineComponent({
  components: {
    RatingContributor: RatingContributorVue,
    PChart,
    PTimeline,
    TransactionListItem,
    InputText,
    PButton,
    PMessage,
  },
  setup() {
    const web3 = new Web3(Web3.givenProvider);
    onMounted(() => {
      // @ts-ignore
      window.web3 = web3;
    });

    const usersGithubApiGateway = new UsersGithubApiGateway(
      axios,
      new UsersGithubApiMapper()
    );

    const places = reactive<Places>({
      first: undefined,
      second: undefined,
      third: undefined,
    });

    const devmuneContractAddress = "0x85b82cE5293F38f64eB33890236A2B0de198f113";

    const devmuneContract = new web3.eth.Contract(
      // @ts-ignore
      DevmuneContractAbi.default,
      devmuneContractAddress
    );

    const pastLogs = ref<any[]>([]);

    const createPastLogsForDevmuneContract = async () => {
      try {
        // const logs = await web3.eth.getPastLogs({
        //   fromBlock: "0x0",
        //   address: devmuneContractAddress,
        // });
        const logs = await devmuneContract.getPastEvents("DataFulfilled", {
          fromBlock: "0x0",
          // address: devmuneContractAddress,
        });
        debugger;
        for await (const pastLog of logs) {
          const transactionDetails = await web3.eth.getTransaction(
            pastLog.transactionHash
          );
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

    const createRatingFromTransactionEvent = async (
      transactionEvent: any
    ): Promise<Places> => {
      try {
        const firstPlaceUser = await usersGithubApiGateway.getContributor(
          transactionEvent.returnValues.firstPlace
        );
        if (firstPlaceUser !== undefined) {
          const firstPlaceWeight =
            transactionEvent.returnValues.firstPlaceWeight;
          firstPlaceUser.weight = parseInt(firstPlaceWeight);
        }

        const secondPlaceUser = await usersGithubApiGateway.getContributor(
          transactionEvent.returnValues.secondPlace
        );
        if (secondPlaceUser !== undefined) {
          const secondPlaceWeight =
            transactionEvent.returnValues.secondPlaceWeight;
          secondPlaceUser.weight = parseInt(secondPlaceWeight);
        }

        const thirdPlaceUser = await usersGithubApiGateway.getContributor(
          transactionEvent.returnValues.thirdPlace
        );
        if (thirdPlaceUser !== undefined) {
          const thirdPlaceWeight =
            transactionEvent.returnValues.thirdPlaceWeight;
          thirdPlaceUser.weight = parseInt(thirdPlaceWeight);
        }

        return {
          first: firstPlaceUser,
          second: secondPlaceUser,
          third: thirdPlaceUser,
        };
      } catch (ex) {
        console.warn(ex);
        return {
          first: undefined,
          second: undefined,
          third: undefined,
        };
      }
    };

    // const callPlacesFromContract = async () => {
    //   try {
    //     const firstPlaceName = await devmuneContract.methods
    //       .firstPlace()
    //       .call();

    //     const secondPlaceName = await devmuneContract.methods
    //       .secondPlace()
    //       .call();

    //     const thirdPlaceName = await devmuneContract.methods
    //       .thirdPlace()
    //       .call();

    //     const firstPlace = await usersGithubApiGateway.getContributor(
    //       firstPlaceName
    //     );
    //     if (firstPlace !== undefined)
    //       firstPlace.weight = await devmuneContract.methods
    //         .ratingData(firstPlaceName)
    //         .call();
    //     places.first = firstPlace;

    //     const secondPlace = await usersGithubApiGateway.getContributor(
    //       secondPlaceName
    //     );
    //     if (secondPlace !== undefined)
    //       secondPlace.weight = await devmuneContract.methods
    //         .ratingData(secondPlaceName)
    //         .call();
    //     places.second = secondPlace;

    //     const thirdPlace = await usersGithubApiGateway.getContributor(
    //       thirdPlaceName
    //     );
    //     if (thirdPlace !== undefined)
    //       thirdPlace.weight = await devmuneContract.methods
    //         .ratingData(thirdPlaceName)
    //         .call();
    //     places.third = thirdPlace;
    //   } catch (ex) {
    //     console.error(ex);
    //   }
    // };

    // const onClick = async () => {
    //   await callPlacesFromContract();
    // };

    const dataForChart = computed(() => {
      if (!places.first || !places.second || !places.third) return undefined;

      return {
        labels: [
          places.first.username,
          places.second.username,
          places.third.username,
        ],
        datasets: [
          {
            label: "weight from TIME_LAST_CHECK",
            backgroundColor: "#42A5F5",
            data: [
              places.first.weight,
              places.second.weight,
              places.third.weight,
            ],
          },
        ],
      };
    });

    // const chartData = ref({
    //   labels: ["first", "second", "third"],
    //   datasets: [
    //     {
    //       label: "first",
    //       backgroundColor: "#42A5F5",
    //       data: [10, 5, 3],
    //     },
    //   ],
    // });

    const horizontalOptions = ref({
      indexAxis: "y",
      plugins: {
        legend: {
          labels: {
            color: "#495057",
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: "#495057",
          },
          grid: {
            color: "#ebedef",
          },
        },
        y: {
          ticks: {
            color: "#495057",
          },
          grid: {
            color: "#ebedef",
          },
        },
      },
    });

    const dataForRatingContract = reactive({
      repo: "",
      repoOwner: "",
      fromDate: "2022-03-05",
    });

    const callRequestRatingFromContract = async (
      repo: string,
      repoOwner: string,
      fromDate: string
    ) => {
      try {
        const contractMethodTransactionAbi = devmuneContract.methods
          .requestRating(repo, repoOwner, fromDate)
          .encodeABI();
        debugger;
        const transactionParameters = {
          to: devmuneContract.options.address,
          // @ts-ignore
          from: window.ethereum.selectedAddress,
          data: contractMethodTransactionAbi,
        };
        // @ts-ignore
        const txHash = await window.ethereum.request({
          method: "eth_sendTransaction",
          params: [transactionParameters],
        });
      } catch (ex) {
        console.warn(ex);
      }
    };

    const onClickSendRequestToNode = async () => {
      // await requestUserAccount();
      await callRequestRatingFromContract(
        dataForRatingContract.repo,
        dataForRatingContract.repoOwner,
        dataForRatingContract.fromDate
      );
    };

    const onEmitSelectTransactionEvent = async (payload: any) => {
      const ratingPlaces = await createRatingFromTransactionEvent(payload);
      places.first = ratingPlaces.first;
      places.second = ratingPlaces.second;
      places.third = ratingPlaces.third;
    };

    return {
      places,
      dataForChart,
      // chartData,
      horizontalOptions,
      pastLogs,
      dataForRatingContract,
      // onClick,
      onClickSendRequestToNode,
      onEmitSelectTransactionEvent,
    };
  },
});
</script>

<style scoped></style>
