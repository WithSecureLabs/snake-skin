<script>
  import { stores } from "@sapper/app";
  import { onDestroy, onMount } from "svelte";
  import * as snake from "api/snake";
  import { formatTags } from "utils/helpers";
  import Loading from "../../components/Loading.svelte";
  import Tags from "../../components/Tags.svelte";

  const { page } = stores();

  let filter = "";
  let loading = false;
  let cur_page = 1;
  let per_page = 10;
  let samples = [];
  let search_timer;
  let total = 0;

  if (typeof $page.query.filter !== "undefined") {
    filter = $page.query.filter;
  }

  onDestroy(() => {
    if (search_timer) {
      clearTimeout(search_timer);
    }
  });

  onMount(() => {
    getSamples(cur_page, per_page);
  });

  function getSamples(cur_page, per_page) {
    loading = true;
    let data = { from: (cur_page-1) * per_page, limit: per_page, sort: "timestamp" };
    if (filter.length > 0) {
      let crudeFilter =
        `filter[authentihash]={"$regex":"${filter}","$options":"-i"}&` +
        `filter[name]={"$regex":"${filter}"}&` +
        `filter[tags]={"$regex":"${filter}","$options":"-i"}&` +
        `filter[imphash]=${filter}&` +
        `filter[md5_digest]=${filter}&` +
        `filter[mime]=${filter}&` +
        `filter[pehash]=${filter}&` +
        `filter[sha1_digest]=${filter}&` +
        `filter[sha256_digest]=${filter}&` +
        `filter[sha512_digest]=${filter}&` +
          "operator=or";
      data.filter = crudeFilter;
    }
    snake.getSamples(data).then(resp => {
      if (resp.status === "success") {
        samples = resp.data.samples;
        total = resp.data.total;
        loading = false;
      } else {
        console.error(resp);
      }
    });
  }

  function searchTimer(filter) {
    // TODO: Update query filter param
    if (search_timer) {
      clearTimeout(search_timer);
    }
    search_timer = setTimeout(getSamples(cur_page, per_page), 1000);
  }

  $: getSamples(cur_page, per_page);
</script>

<style lang="scss">
  .table-wrapper {
    display: flex;
    position: relative;
  }
  .table-wrapper:not(:last-child) {
    margin-bottom: 1.5rem;
  }
</style>

<svelte:head>
  <title>Samples</title>
</svelte:head>

<div class="level">
  <div class="level-left">
    <div class="level-item">
      <div>
        <h1 class="title">Samples</h1>
      </div>
    </div>
    <div class="level-item">
      <div>
        <p class="heading">Per Page</p>
        <div class="select is-small">
          <select bind:value={per_page}>
            <option
              on:click={() => {
                per_page = 10;
              }}>
              10
            </option>
            <option
              on:click={() => {
                per_page = 25;
              }}>
              25
            </option>
            <option
              on:click={() => {
                per_page = 50;
              }}>
              50
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>
  <div class="level-right">
    <div>
      <p class="heading">Search</p>
      <p class="control has-icons-right">
        <input
          class="input is-small"
          placeholder="Enter filter..."
          type="text"
          bind:value={filter}
          on:input={() => {
            searchTimer(filter);
          }} />
        <span class="icon is-small is-right">
          <span class="mdi mdi-filter" />
        </span>
      </p>
    </div>
  </div>
</div>

<div class="table-wrapper">
  <Loading {loading} />
  <!-- TODO: Put in a proper table -->
  <table class="table is-wide">
    <thead>
      <tr>
        <th>SHA256 Digest</th>
        <th>Timestamp</th>
        <th>Name</th>
        <th>Tags</th>
      </tr>
    </thead>
    <tbody>
      {#if samples.length > 0}
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
            <td class="break">{sample.name}</td>
            <td>
              <Tags formatted tags={formatTags(sample.tags)} />
            </td>
          </tr>
        {/each}
      {:else}
        <tr>
          <td colspan="4">
            <div class="is-flex">
              <div class="no-content">
                <span class="mdi mdi-block-helper" />
                <p>No samples...</p>
              </div>
            </div>
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>

<nav class="pagination" role="navigation" aria-label="pagination">
  {#if cur_page === 1}
    <a class="pagination-previous" disabled>Previous</a>
  {:else}
    <a
      class="pagination-previous"
      on:click={() => {
        cur_page -= 1;
      }}>
      Previous
    </a>
  {/if}
  {#if cur_page * per_page >= total}
    <a class="pagination-next" disabled>Next</a>
  {:else}
    <a
      class="pagination-next"
      on:click={() => {
        cur_page += 1;
      }}>
      Next
    </a>
  {/if}
  <ul class="pagination-list">
    {#if cur_page - 2 > 0}
      <li>
        <a
          class="pagination-link"
          aria-label="Goto page 1"
          on:click={() => {
            cur_page = 1;
          }}>
          1
        </a>
      </li>
      <li>
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
    {/if}
    {#if cur_page - 1 > 0}
      <li>
        <a
          class="pagination-link"
          aria-label="Goto page {cur_page - 1}"
          on:click={() => {
            cur_page -= 1;
          }}>
          {cur_page - 1}
        </a>
      </li>
    {/if}
    <li>
      <a
        class="pagination-link is-current"
        aria-label="Page {cur_page}"
        aria-current="page">
        {cur_page}
      </a>
    </li>
    {#if cur_page + 1 <= Math.ceil(total / per_page)}
      <li>
        <a
          class="pagination-link"
          aria-label="Goto page {cur_page + 1}"
          on:click={() => {
            cur_page += 1;
          }}>
          {cur_page + 1}
        </a>
      </li>
    {/if}
    {#if cur_page + 2 <= Math.ceil(total / per_page)}
      <li>
        <span class="pagination-ellipsis">&hellip;</span>
      </li>
      <li>
        <a
          class="pagination-link"
          aria-label="Goto page {Math.ceil(total / per_page)}"
          on:click={() => {
            cur_page = Math.ceil(total / per_page);
          }}>
          {Math.ceil(total / per_page)}
        </a>
      </li>
    {/if}
  </ul>
</nav>
