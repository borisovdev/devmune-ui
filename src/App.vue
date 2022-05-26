<script lang="ts">
import { defineComponent } from "vue";
import TheHomeView from "./views/TheHomeView.vue";
import TheHeader from "./components/header/TheHeader.vue";

export default defineComponent({
  components: {
    TheHeader,
    TheHomeView,
  },
  setup() {
    return {};
  },
});
</script>

<template>
  <the-header></the-header>
  <main>
    <the-home-view></the-home-view>
  </main>
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
