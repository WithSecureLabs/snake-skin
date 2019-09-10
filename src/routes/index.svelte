<script context="module">
  import { getSamples } from "api/snake";
  import { formatBytes, formatTags } from "utils/helpers";

  export async function preload({ path, query }) {
    const data = {
      samples: []
    };
    await getSamples({
      fetch: this.fetch,
      limit: 10,
      order: -1,
      sort: "timestamp"
    }).then(resp => {
      if (resp.status === "success") {
        data.samples = resp.data.samples;
      } else {
        console.error(resp.message);
      }
    });
    return data;
  }
</script>

<script>
  import Tags from "../components/Tags.svelte";

  export let samples = [];
</script>

<style lang="scss">
  .recently-added {
    display: flex;
    flex: 1;
    flex-flow: column;
  }
</style>

<svelte:head>
  <title>Dashboard</title>
</svelte:head>

<h1 class="title">Summary</h1>

<!-- TODO: Implement stats... :P  -->
<div class="is-flex" style="justify-content:center;margin:auto;height:10rem">
  <div class="is-flex" style="flex-flow:column;margin:auto;">
    <span
      class="mdi mdi-sign-real-estate"
      style="font-size:5rem;margin:auto;" />
    <span>No Stats...</span>
  </div>
</div>

<div class="recently-added">
  <h1 class="title">Recently Added</h1>

  <table class="table is-wide">
    <thead>
      <tr>
        <th>SHA256 Digest</th>
        <th>Timestamp</th>
        <th>MIME</th>
        <th>Size</th>
        <th>Submission</th>
        <th>Name</th>
        <th>Tags</th>
      </tr>
    </thead>
    <tbody>
      {#each samples as sample}
        <tr>
          <td>
            <a
              class="is-family-monospace"
              rel="prefetch"
              href="samples/{sample.sha256_digest}">
              {sample.sha256_digest}
            </a>
          </td>
          <td>{sample.timestamp}</td>
          <td>{sample.mime}</td>
          <td>{formatBytes(sample.size)}</td>
          <td>{sample.submission_type}</td>
          <td>{sample.name}</td>
          <td>
            <Tags formatted tags={formatTags(sample.tags)} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
