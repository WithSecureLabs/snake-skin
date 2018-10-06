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
        <sdetails :sample="sample" :interfaces="interfaces"></sdetails>
      </b-tab-item>
      <b-tab-item label="Notes">
        <notes :sha256_digest="sha256_digest"></notes>
      </b-tab-item>
      <b-tab-item label="Analysis">
        <analysis :sha256_digest="sha256_digest" :commands="commands"></analysis>
      </b-tab-item>
      <b-tab-item label="Interfaces">
        <interfaces :sha256_digest="sha256_digest" :interfaces="interfaces"></interfaces>
      </b-tab-item>
    </b-tabs>
  </div>
</template>

<script>
import { getSample } from '@/api/sample';
import { getScales, getScaleCommands, getScaleInterface } from '@/api/scale';
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
    tab: {
      default: () => '',
      type: String,
    },
  },
  data: () => ({
    activeTab: 0,
    sample: null,

    // Scale things
    scales: [],
    commands: {},
    interfaces: {},
  }),

  computed: {
    downloadSample() {
      return `${SNAKE_API}/download/${this.sha256_digest}`;
    },
  },

  created() {
    if (this.tab === 'notes') {
      this.activeTab = 1;
    } else if (this.tab === 'analysis') {
      this.activeTab = 2;
    } else if (this.tab === 'interfaces') {
      this.activeTab = 3;
    }
    this.loadSample();
  },

  methods: {
    async loadSample() {
      let resp = await getSample(this.sha256_digest);
      if (resp.status === 'error') {
        return;
      }
      this.sample = resp.data.sample;
      resp = await getScales({ fileType: this.sample.file_type });
      if (resp.status === 'error') {
        return;
      }
      this.scales = resp.data.scales;

      // Async is being a bitch so we have to create the lists then run the queries
      // NOTE: Promise.all is order preserving
      const commandScales = [];
      const interfaceScales = [];
      this.scales.forEach((scale) => {
        // Loop the components and load them
        scale.components.forEach((component) => {
          if (component === 'commands') {
            commandScales.push(scale.name);
          } else if (component === 'interface') {
            interfaceScales.push(scale.name);
          }
        });
      });
      let results;
      const commands = {};
      const interfaces = {};
      results = await Promise.all(commandScales.map(scale => getScaleCommands(scale)));
      results.forEach((result, i) => {
        if (result.status === 'success') {
          commands[commandScales[i]] = result.data.commands;
        }
      });
      results = await Promise.all(interfaceScales.map(scale => getScaleInterface(scale)));
      results.forEach((result, i) => {
        if (result.status === 'success') {
          interfaces[interfaceScales[i]] = result.data.interface;
        }
      });
      this.commands = commands;
      this.interfaces = interfaces;
    },
  },

  watch: {
    activeTab() {
      const params = { sha256_digest: this.sha256_digest };
      if (this.activeTab === 1) {
        params.tab = 'notes';
      } else if (this.activeTab === 2) {
        params.tab = 'analysis';
      } else if (this.activeTab === 3) {
        params.tab = 'interfaces';
      }
      this.$router.push({ name: this.$route.name, params });
    },

    sha256_digest() {
      this.loadSample();
    },
  },
};
</script>

<style lang="scss">
#sample {
  margin: -1em;
  overflow: auto;
}

.tabs {
  margin-bottom: 0 !important;
}

.tab-content {
  height: calc(100vh - 160px);
  overflow: auto !important;
}

.tab-item {
  height: 100%;
}

#breadcrumbs {
  background-color: hsl(0, 0%, 96%);
  padding: 0.5em 1em;
  margin-bottom: 0.5em !important;
}
</style>
