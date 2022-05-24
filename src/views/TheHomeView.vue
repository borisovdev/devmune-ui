<template>
  <section>
    <button @click="onClick">call method</button>

    <div>
      <rating-contributor
        v-if="places.first !== undefined"
        :contributor="places.first"
      ></rating-contributor>

      <rating-contributor
        v-if="places.second !== undefined"
        :contributor="places.second"
      ></rating-contributor>

      <rating-contributor
        v-if="places.third !== undefined"
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

type Places = {
  first: RatingContributor | undefined;
  second: RatingContributor | undefined;
  third: RatingContributor | undefined;
};

export default defineComponent({
  components: {
    RatingContributor: RatingContributorVue,
    PChart,
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

    const devmuneContract = new web3.eth.Contract(
      // @ts-ignore
      DevmuneContractAbi.default,
      "0x88b9e61fA184347C447577695279DA6566cd2b25"
    );

    const callPlacesFromContract = async () => {
      try {
        const firstPlaceName = await devmuneContract.methods
          .firstPlace()
          .call();

        const secondPlaceName = await devmuneContract.methods
          .secondPlace()
          .call();

        const thirdPlaceName = await devmuneContract.methods
          .thirdPlace()
          .call();

        const firstPlace = await usersGithubApiGateway.getContributor(
          firstPlaceName
        );
        if (firstPlace !== undefined)
          firstPlace.weight = await devmuneContract.methods
            .ratingData(firstPlaceName)
            .call();
        places.first = firstPlace;

        const secondPlace = await usersGithubApiGateway.getContributor(
          secondPlaceName
        );
        if (secondPlace !== undefined)
          secondPlace.weight = await devmuneContract.methods
            .ratingData(secondPlaceName)
            .call();
        places.second = secondPlace;

        const thirdPlace = await usersGithubApiGateway.getContributor(
          thirdPlaceName
        );
        if (thirdPlace !== undefined)
          thirdPlace.weight = await devmuneContract.methods
            .ratingData(thirdPlaceName)
            .call();
        places.third = thirdPlace;
      } catch (ex) {
        console.error(ex);
      }
    };

    const onClick = async () => {
      await callPlacesFromContract();
    };

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

    const chartData = ref({
      labels: ["first", "second", "third"],
      datasets: [
        {
          label: "first",
          backgroundColor: "#42A5F5",
          data: [10, 5, 3],
        },
      ],
    });

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

    return {
      places,
      onClick,
      dataForChart,
      chartData,
      horizontalOptions,
    };
  },
});
</script>

<style scoped></style>
