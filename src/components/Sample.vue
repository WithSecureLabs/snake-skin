<template>
  <div class="sample">
    <h2>Loading sample...</h2>
  </div>
</template>

<script>
import { getSample } from '@/api/sample';

export default {
  name: 'Sample',
  props: ['sha256_digest'],
  data: () => ({
    fileType: '',
  }),

  mounted() {
    // NOTE: This is a bit inefficient as we ask for the sample twice, but this
    // will redirect us to the correct view
    getSample(this.sha256_digest).then((resp) => {
      if (resp.status === 'success') {
        const { sample } = resp.data;
        this.$router.push(`/${sample.file_type}/${sample.sha256_digest}`);
      }
    });
  },
};
</script>

<style lang="scss" scoped>
</style>
