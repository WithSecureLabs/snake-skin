<template>
  <div id="sample" class="sample">
    <nav id="breadcrumbs" class="level">
      <div class="level-left">
        <div v-if="sample" class="level-item">
          {{ sample.name }} - {{ sample.mime }}
        </div>
        <div v-else class="level-item">
          Loading...
        </div>
      </div>
      <div class="level-right">
        <div class="level-item">
          <a class="button is-primary is-outlined" :href="downloadSample">Download</a>
        </div>
      </div>
    </nav>

    <b-tabs v-model="activeTab">
      <b-tab-item label="Details">
        <sdetails :sample="sample"></sdetails>
      </b-tab-item>
      <b-tab-item label="Notes">
        <notes></notes>
      </b-tab-item>
      <b-tab-item label="Analysis">
        <analysis></analysis>
      </b-tab-item>
      <b-tab-item label="Interfaces">
        <interface></interface>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
import { SNAKE_API } from '@/settings';
import Analysis from '@/components/sample/Analysis.vue';
import Details from '@/components/sample/Details.vue';
import Interfaces from '@/components/sample/Interfaces.vue';
import Notes from '@/components/sample/Notes.vue';

export default {
  name: 'Sample',
  components: {
    analysis: Analysis,
    interfaces: Interfaces,
    notes: Notes,
    sdetails: Details,
  },
  props: {
    sha256_digest: {
      default: () => '',
      type: String,
    },
  },
  data: () => ({
    activeTab: 0,
    sample: null,
  }),

  computed: {
    downloadSample() {
      return '';
    },
  },

  mounted() {
    this.getSample(this.sha256_digest);
  },

  methods: {
    getSample(SHA256Digest) {
      this.$http.get(`${SNAKE_API}/store/${SHA256Digest}`).then((response) => {
        this.sample = response.data.data.sample;
      }).catch((e) => {
        console.log(`An error occured - ${e}`);
      });
    },
  },
};
</script>

<style lang="scss">
#sample {
  margin: -1em;
}

#breadcrumbs {
  background-color: hsl(0, 0%, 96%);
  padding: 0.5em 1em;
  margin-bottom: 0.5em !important;
}
</style>
