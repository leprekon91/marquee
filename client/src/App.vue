<script setup>
// No need to import components directly here since they'll be loaded by the router
</script>

<template>
  <header>
    <h1>Welcome to Your Vue.js App</h1>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>
  </header>

  <!-- This is where components matched by the route will be rendered -->
  <router-view />
</template>

<style scoped>
header {
  margin-bottom: 30px;
  text-align: center;
}

nav {
  padding: 15px 0;
}

nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #2c3e50;
}

nav a.router-link-active {
  font-weight: bold;
  color: #42b983;
}
</style>
