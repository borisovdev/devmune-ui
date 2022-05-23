<script lang="ts">
import { defineComponent } from "vue";
import TheHomeView from "./views/TheHomeView.vue";

export default defineComponent({
  components: {
    TheHomeView,
  },
  setup() {
    return {};
  },
});
</script>

<template>
  <the-home-view></the-home-view>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
