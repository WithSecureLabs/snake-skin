<template>
  <div id="upload" class="upload">
     <button class="button is-primary" @click="upload">Upload</button>
  </div>
</template>

<script>
import UploadModal from '@/components/upload/UploadModal.vue';

export default {
  name: 'Search',

  methods: {
    upload() {
      this.$modal.open({
        component: UploadModal,
        hasModalCard: true,
        parent: this.$root,
        canCancel: ['x'],
      });
    },
  },
};
</script>

<style scoped lang="scss">
</style>
