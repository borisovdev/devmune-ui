<template>
  <section class="container-fluid" :style="{ textAlign: `left` }">
    <div class="row">
      <div class="col-7">
        <form-create-rating-request></form-create-rating-request>

        <rating-event-chart
          v-if="
            places.first !== undefined ||
            places.second !== undefined ||
            places.third !== undefined
          "
          :places="places"
        ></rating-event-chart>
      </div>

      <div class="col-5">
        <history-transaction-events
          @select:transactionEvent="onEmitSelectTransactionEvent"
        ></history-transaction-events>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import axios from "axios";
import { defineComponent, reactive } from "vue";
import RatingContributor from "../entity/RatingContributor";
import UsersGithubApiGateway from "../gateway/UsersGithubApiGateway";
import UsersGithubApiMapper from "../mappers/UsersGithubApiMapper";
import FormCreateRatingRequest from "../containers/form/FormCreateRatingRequest.vue";
import RatingEventChart from "../components/rating-event-chart/RatingEventChart.vue";
import HistoryTransactionEvents from "../containers/history/HistoryTransactionEvents.vue";

export type Places = {
  first: RatingContributor | undefined;
  second: RatingContributor | undefined;
  third: RatingContributor | undefined;
};

export default defineComponent({
  components: {
    FormCreateRatingRequest,
    RatingEventChart,
    HistoryTransactionEvents,
  },
  setup() {
    const usersGithubApiGateway = new UsersGithubApiGateway(
      axios,
      new UsersGithubApiMapper()
    );

    const places = reactive<Places>({
      first: undefined,
      second: undefined,
      third: undefined,
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

    const onEmitSelectTransactionEvent = async (payload: any) => {
      const ratingPlaces = await createRatingFromTransactionEvent(payload);
      places.first = ratingPlaces.first;
      places.second = ratingPlaces.second;
      places.third = ratingPlaces.third;
    };

    return {
      places,
      onEmitSelectTransactionEvent,
    };
  },
});
</script>

<style scoped></style>
