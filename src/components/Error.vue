<template>
  <div class="error">
    <h1 class="title">Error 404!</h1>
    <h2 class="subtitle">{{ error }}</h2>
  </div>
</template>


<script>
export default {
  name: 'error',

  data: () => ({
    error: 'Page Not Found!'
  }),

  created () {

  }
}
</script>


<style lang="sass" scoped>

h1, h2
  justify-content: center
  text-align: center
  width: 100%


.error
  padding: 10em

</style>
