<template>
  <div class="sample">
    <h2>Loading sample...</h2>
  </div>
</template>


<script>
import {API} from '@/config/config'
export default {
  name: 'file',
  props: ['sha256_digest'],

  data: () => ({
    fileType: '',
    errors: []
  }),

  mounted () {
    // A placeholder component that redirects to the correct place
    // We just need to query Snake for the file_type then we can be on our way
    API.get('store/' + this.sha256_digest)
      .then(response => {
        var sample = response.data['data']['sample']
        this.fileType = sample.file_type
      })
      .catch(e => {
        this.errors.push(e)
        console.log(e)
      })
  },

  watch: {
    fileType: function (value) {
      if (this.fileType !== '') {
        this.$router.push('/' + this.fileType + '/' + this.sha256_digest)
      }
    }
  }
}
</script>


<style lang="sass" scoped>

</style>
