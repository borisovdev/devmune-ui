<template>
  <div>
    <p-avatar
      v-if="!!contributor.avatarUrl"
      :image="contributor.avatarUrl"
      shape="circle"
      @click.stop="onClickAvatar"
      :style="{ cursor: 'pointer' }"
    ></p-avatar>

    <span> {{ contributor.name }} aka {{ contributor.username }} </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";
import RatingContributor from "../../entity/RatingContributor";
import PAvatar from "primevue/avatar";

export default defineComponent({
  components: {
    PAvatar,
  },
  props: {
    contributor: {
      type: Object as PropType<RatingContributor>,
      required: true,
    },
  },
  setup(props) {
    const onClickAvatar = () => {
      if (!props.contributor.avatarUrl) return;
      window.open(props.contributor.accountUrl);
    };
    return {
      onClickAvatar,
    };
  },
});
</script>

<style scoped></style>
