<template>
  <div class="mt-4">
    <h2>Rating from history</h2>

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
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed, ref } from "vue";
import { Places } from "../../views/TheHomeView.vue";
import RatingContributor from "../rating-contributor/RatingContributor.vue";
import PChart from "primevue/chart";

export default defineComponent({
  components: {
    RatingContributor,
    PChart,
  },
  props: {
    places: {
      type: Object as PropType<Places>,
      required: true,
    },
  },
  setup(props) {
    const dataForChart = computed(() => {
      if (!props.places.first || !props.places.second || !props.places.third)
        return undefined;

      return {
        labels: [
          props.places.first.username,
          props.places.second.username,
          props.places.third.username,
        ],
        datasets: [
          {
            label: "weight from TIME_LAST_CHECK",
            backgroundColor: "#42A5F5",
            data: [
              props.places.first.weight,
              props.places.second.weight,
              props.places.third.weight,
            ],
          },
        ],
      };
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
      dataForChart,
      horizontalOptions,
    };
  },
});
</script>

<style scoped></style>
