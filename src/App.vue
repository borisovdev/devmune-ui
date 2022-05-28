<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import TheHomeView from "./views/TheHomeView.vue";
import TheHeader from "./components/header/TheHeader.vue";
import Web3Connection from "./services/web3/Web3Connection";
import Web3 from "web3";
import PMessage from "primevue/message";
import PButton from "primevue/button";

export default defineComponent({
  components: {
    TheHeader,
    TheHomeView,
    PMessage,
    PButton,
  },
  setup() {
    const web3Connection = Web3Connection.getInstance(
      import.meta.env.VITE_WEB3_WS_CONNECT_URL || Web3.givenProvider
    );

    const isUserLogin = ref<boolean>(false);

    onMounted(async () => {
      web3Connection.setWeb3ToWindowObject();
      // @ts-ignore
      isUserLogin.value = window.ethereum.selectedAddress;

      if (!isUserLogin.value) {
        // @ts-ignore
        window.ethereum.request({ method: "eth_requestAccounts" });
      }
    });

    const onClickWarnLoginMessage = async () => {
      // @ts-ignore
      await window.ethereum.request({ method: "eth_requestAccounts" });
      // @ts-ignore
      isUserLogin.value = window.ethereum.selectedAddress;
    };

    return {
      isUserLogin,
      onClickWarnLoginMessage,
    };
  },
});
</script>

<template>
  <the-header></the-header>
  <main>
    <transition name="fade">
      <div v-if="!isUserLogin">
        <p-message severity="warn" @click.stop="onClickWarnLoginMessage">
          <div style="display: inline-flex; align-items: center">
            <p class="mb-0 me-2">
              Please, login using Metamask! Sending transactions not available
              until you're not authorized.
            </p>

            <p-button
              label="Login via metamask"
              class="p-button-text"
            ></p-button>
          </div>
        </p-message>
      </div>
    </transition>

    <p-message severity="info">
      Please, make sure you're use account on KOVAN TESTNET!
    </p-message>

    <p-message severity="info">
      After submitting transaction, it may take a little time. Please be
      patient. If transaction not display after a while, please try other
      preset.
    </p-message>

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
