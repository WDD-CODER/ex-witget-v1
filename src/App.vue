
<script>
import Home from './components/Home.vue';
import UserMsg from './components/UserMsg.vue';
// import WidgetRoot from './components/WidgetRoot.vue'

export default {
  name: 'App',
  components: {
    // WidgetRoot,
    Home,
    UserMsg
  }
}
</script>

<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <!-- <WidgetRoot msg="Welcome to Your Vue.js App"/> -->
     <UserMsg />
    <Home/>
  </div>
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
