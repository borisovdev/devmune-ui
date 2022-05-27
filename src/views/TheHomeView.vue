<template>
  <section class="container-fluid" :style="{ textAlign: `left` }">
    <div class="row">
      <div class="col-7">
        <form-create-rating-request></form-create-rating-request>

        <transition name="fade">
          <rating-event-chart
            v-if="
              (places.first !== undefined ||
                places.second !== undefined ||
                places.third !== undefined) &&
              !isRatingCreating
            "
            :places="places"
          ></rating-event-chart>

          <progress-spinner
            v-else-if="isRatingCreating"
            style="width: 50px; height: 50px"
            strokeWidth="8"
            animationDuration=".5s"
          ></progress-spinner>
        </transition>
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
import { computed, defineComponent, reactive, ref } from "vue";
import RatingContributor from "../entity/RatingContributor";
import UsersGithubApiGateway from "../gateway/UsersGithubApiGateway";
import UsersGithubApiMapper from "../mappers/UsersGithubApiMapper";
import FormCreateRatingRequest from "../containers/form/FormCreateRatingRequest.vue";
import RatingEventChart from "../components/rating-event-chart/RatingEventChart.vue";
import HistoryTransactionEvents from "../containers/history/HistoryTransactionEvents.vue";
import ProgressSpinner from "primevue/progressspinner";
import PMessage from "primevue/message";

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
    ProgressSpinner,
    PMessage,
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

    const isRatingCreating = ref<boolean>(false);

    const createRatingFromTransactionEvent = async (
      transactionEvent: any
    ): Promise<Places> => {
      isRatingCreating.value = true;

      const result: any = {
        first: undefined,
        second: undefined,
        third: undefined,
      };

      const firstPlaceUsername = transactionEvent.returnValues.firstPlace;
      const firstPlaceWeight = parseInt(
        transactionEvent.returnValues.firstPlaceWeight
      );

      const secondPlaceUsername = transactionEvent.returnValues.secondPlace;
      const secondPlaceWeight = parseInt(
        transactionEvent.returnValues.secondPlaceWeight
      );

      const thirdPlaceUsername = transactionEvent.returnValues.thirdPlace;
      const thirdPlaceWeight = parseInt(
        transactionEvent.returnValues.thirdPlaceWeight
      );

      try {
        const firstPlaceUser = await usersGithubApiGateway.getContributor(
          firstPlaceUsername
        );
        if (firstPlaceUser !== undefined) {
          firstPlaceUser.weight = firstPlaceWeight;
        }

        result.first = firstPlaceUser;
      } catch (ex) {
        const firstUser = new RatingContributor();
        firstUser.id = firstPlaceUsername;
        firstUser.username = firstPlaceUsername;
        firstUser.weight = firstPlaceWeight;

        result.first = firstUser;
      }

      try {
        const secondPlaceUser = await usersGithubApiGateway.getContributor(
          secondPlaceUsername
        );
        if (secondPlaceUser !== undefined) {
          secondPlaceUser.weight = secondPlaceWeight;
        }

        result.second = secondPlaceUser;
      } catch (ex) {
        const secondUser = new RatingContributor();
        secondUser.id = secondPlaceUsername;
        secondUser.username = secondPlaceUsername;
        secondUser.weight = secondPlaceWeight;

        result.second = secondUser;
      }

      try {
        const thirdPlaceUser = await usersGithubApiGateway.getContributor(
          thirdPlaceUsername
        );
        if (thirdPlaceUser !== undefined) {
          thirdPlaceUser.weight = thirdPlaceWeight;
        }
        result.third = thirdPlaceUser;
      } catch (ex) {
        const thirdUser = new RatingContributor();
        thirdUser.id = thirdPlaceUsername;
        thirdUser.username = thirdPlaceUsername;
        thirdUser.weight = thirdPlaceWeight;

        result.third = thirdUser;
      }

      isRatingCreating.value = false;
      return result;
    };

    const onEmitSelectTransactionEvent = async (payload: any) => {
      const ratingPlaces = await createRatingFromTransactionEvent(payload);
      places.first = ratingPlaces.first;
      places.second = ratingPlaces.second;
      places.third = ratingPlaces.third;
    };

    return {
      places,
      isRatingCreating: computed(() => isRatingCreating.value),
      onEmitSelectTransactionEvent,
    };
  },
});
</script>

<style scoped></style>
