<script lang="ts">
import { defineComponent, onMounted } from "vue";
import TheHomeView from "./views/TheHomeView.vue";
import TheHeader from "./components/header/TheHeader.vue";
import Web3Connection from "./services/web3/Web3Connection";
import Web3 from "web3";

export default defineComponent({
  components: {
    TheHeader,
    TheHomeView,
  },
  setup() {
    const web3Connection = Web3Connection.getInstance(Web3.givenProvider);

    onMounted(() => {
      web3Connection.setWeb3ToWindowObject();
    });

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
