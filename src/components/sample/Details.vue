<template>
  <div id="details" class="details">
    <div class="columns">
      <div class="column">

        <h1 class="title">Summary</h1>
        <div class="box">
          <table class="table">
            <tbody>
              <tr>
                <th>Name</th>
                <td v-if="sample">{{ sample.name }}</td>
              </tr>
              <tr>
                <th>Size</th>
                <td v-if="sample">{{ sample.size }}</td>
              </tr>
              <tr>
                <th>MIME</th>
                <td v-if="sample">{{ sample.mime }}</td>
              </tr>
              <tr>
                <th>Submission Type</th>
                <td v-if="sample"><tags :tags="sample.submission_type"></tags></td>
              </tr>
              <tr>
                <th>Submission Time</th>
                <td v-if="sample">{{ sample.timestamp }}</td>
              </tr>
              <tr>
                <th>Magic</th>
                <td v-if="sample">{{ sample.magic }}</td>
              </tr>
              <tr>
                <th>SHA256 Digest</th>
                <td v-if="sample">{{ sample.sha256_digest }}</td>
              </tr>
              <tr>
                <th>Tags</th>
                <td v-if="sample"><tags :tags="sample.tags"></tags></td>
              </tr>
            </tbody>
          </table>
        </div>
        <h1 class="title">Hexdump</h1>
        <div class="box">
          <pre>Hexdump Here</pre>
        </div>
      </div>
      <div class="column">
        <h1 class="title">Description</h1>
        <div class="box">
          <pre v-if="sample && sample.description">{{ sample.description }}</pre>
          <pre v-else>No Description</pre>
        </div>
        <h1 class="title">Cuckoo</h1>
        <div class="box">
          <pre>Cuckoo Here</pre>
        </div>
        <h1 class="title">Virustotal</h1>
        <div class="box">
          <pre>Virustotal Here</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Tags from '@/components/Tags.vue';

export default {
  name: 'Details',
  components: {
    tags: Tags,
  },
  props: {
    sample: {
      default: () => null,
      type: Object,
    },
  },
};
</script>

<style lang="scss">
pre {
  background-color: white;
}

table {
  tbody {
    tr {
      th {
        width: 10rem;
      }
    }
    tr:not(:last-child) {
      padding-bottom: 2em;
    }
  }
}
</style>
