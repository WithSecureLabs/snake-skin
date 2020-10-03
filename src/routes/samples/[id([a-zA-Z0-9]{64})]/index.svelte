<script>
  import { onMount } from "svelte";
  import * as snake from "api/snake";
  import { formatBytes, formatTags, sorted, toCaps } from "utils/helpers";
  import { scales } from "../../../stores/snake";
  import Output from "../../../components/Output.svelte";
  import Modal from "../../../components/Modal.svelte";
  import Tags from "../../../components/Tags.svelte";

  export let sample;

  let description = "";
  let edit_description = false;
  let edit_tags = false;
  let hexdump;
  let infos = {};
  let loading = false;
  let tags = "";

  $: loadScaleInterfaces($scales);

  onMount(() => {
    description = sample.description;
    tags = sample.tags;
    if (sample.file_type === "file") {
      hexdump = snake.getHexdump(sample.sha256_digest);
    }
  });

  function loadScaleInterfaces(scales) {
    Object.values(scales).forEach(scale => {
      if (
        scale.supports.indexOf(sample.file_type) !== -1 &&
        Object.keys(scale.components).indexOf("interface") !== -1 &&
        Object.keys(scale.components.interface).includes("info") !== -1
      ) {
        const default_formats = ["markdown", "plaintext", "json"];
        let f = "json";
        for (let i = 0; i < default_formats.length; i++) {
          if (
            scale.components.interface.info.formats.includes(default_formats[i])
          ) {
            f = default_formats[i];
            break;
          }
        }
        infos[scale.name] = snake.postScaleInterface(
          scale.name,
          "pull",
          "info",
          sample.sha256_digest,
          { format: f }
        );
      }
    });
  }

  function updateDescription() {
    loading = true;
    snake
      .patchSample(sample.file_type, sample.sha256_digest, { description })
      .then(resp => {
        if (resp.status === "success") {
          sample = resp.data[sample.file_type];
        } else {
          description = sample.description;
          // TODO: Toast...
        }
        edit_description = false;
        loading = false;
      });
  }

  function updateTags() {
    loading = true;
    snake
      .patchSample(sample.file_type, sample.sha256_digest, { tags })
      .then(resp => {
        if (resp.status === "success") {
          sample = resp.data[sample.file_type];
        } else {
          tags = sample.tags;
          // TODO: Toast...
        }
        edit_tags = false;
        loading = false;
      });
  }
</script>

<style lang="scss">
  .is-minimal {
    background-color: transparent;
    border: 0;
    height: unset;
    padding: 0;
  }
  .panel {
    display: flex;
    flex-flow: column;
    height: 28rem;
  }
  .panel-body {
    overflow: auto;
  }
  .panel-details {
    max-width: 50%;
    min-width: 25%;
  }
</style>

<svelte:head>
  <title>Samples - {sample.name}</title>
</svelte:head>

<div class="details columns is-multiline">
  <div class="panel-details column is-narrow">
    <nav class="panel">
      <p class="panel-heading">Summary</p>
      <div class="panel-body">
        <div class="panel-block">
          <div>
            <p class="heading is-marginless">SHA256 Digest</p>
            <p class="is-family-monospace">{sample.sha256_digest}</p>
          </div>
        </div>
        <div class="panel-block">
          <div>
            <p class="heading is-marginless">Timestamp</p>
            <p>{sample.timestamp}</p>
          </div>
        </div>
        <div class="panel-block">
          <div>
            <p class="heading is-marginless">Size</p>
            <p>{formatBytes(sample.size)}</p>
          </div>
        </div>
        <div class="panel-block">
          <div>
            <p class="heading is-marginless">Submission</p>
            <p>{sample.submission_type}</p>
          </div>
        </div>
        <div class="panel-block">
          <div>
            <p class="heading is-marginless">Magic</p>
            <p>{sample.magic}</p>
          </div>
        </div>
        <div class="panel-block">
          <div>
            <div class="is-flex">
              <p class="heading is-marginless">Tags</p>
              <button
                class="heading button is-minimal is-marginless"
                disabled={edit_tags}>
                <a
                  class="heading nomargin mdi mdi-pencil is-small"
                  on:click={() => {
                    edit_tags = true;
                    tags = sample.tags;
                  }} />
              </button>
            </div>
            <Tags formatted tags={formatTags(sample.tags)} />
          </div>
        </div>
      </div>
    </nav>
  </div>

  <div class="panel-details column is-narrow">
    <nav class="panel">
      <div class="panel-heading">
        <div class="is-flex">
          <p class="is-wide">Description</p>
          <button class="button is-minimal" disabled={edit_description}>
            <a
              class="mdi mdi-pencil"
              on:click={() => {
                edit_description = true;
                description = sample.description;
              }} />
          </button>
        </div>
      </div>
      <div class="panel-block">
        <div>
          {#if sample.description}
            <p>{sample.description}</p>
          {:else}
            <p>No description...</p>
          {/if}
        </div>
      </div>
    </nav>
  </div>

  {#if sample && sample.parents && Object.keys(sample.parents).length > 0}
    <div class="panel-details column is-narrow">
      <nav class="panel">
        <p class="panel-heading">Parents</p>
        <div class="panel-block">
          <table class="table no-fixed-table">
            <thead>
              <tr>
                <th>Parent (SHA256 Digest)</th>
                <th>Submission Types</th>
              </tr>
            </thead>
            <tbody>
              {#each Object.entries(sample.parents) as [k, v]}
                <tr>
                  <td>
                    <a href="/samples/{k}" class="is-size-7">{k}</a>
                  </td>
                  <td>
                    <Tags tags={v} />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </nav>
    </div>
  {/if}

  {#if sample && sample.children && Object.keys(sample.children).length > 0}
    <div class="panel-details column is-narrow">
      <nav class="panel">
        <p class="panel-heading">Children</p>
        <div class="panel-block">
          <table class="table no-fixed-table">
            <thead>
              <tr>
                <th>Children (SHA256 Digest)</th>
                <th>Submission Types</th>
              </tr>
            </thead>
            <tbody>
              {#each Object.entries(sample.children) as [k, v]}
                <tr>
                  <td>
                    <a href="/samples/{k}" class="is-size-7">{k}</a>
                  </td>
                  <td>
                    <Tags tags={v} />
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </nav>
    </div>
  {/if}

  {#if hexdump}
    <div class="panel-details column is-narrow">
      <nav class="panel">
        <p class="panel-heading">Hexdump</p>
        <div class="panel-block">
          <div>
            {#await hexdump}
              <p>Loading...</p>
            {:then resp}
              <pre>{resp.data.hex}</pre>
            {/await}
          </div>
        </div>
      </nav>
    </div>
  {/if}

  {#each Object.entries(sorted(infos)) as [scale, promise]}
    <div class="panel-details column is-narrow">
      <nav class="panel">
        <p class="panel-heading">{toCaps(scale)}</p>
        <div class="panel-block">
          <div>
            {#await promise}
              <p>Loading...</p>
            {:then resp}
              {#if resp.data.interface}
                <Output
                  format={resp.data.interface.format}
                  output={resp.data.interface.output} />
              {:else}
                <Output output={resp.message} />
              {/if}
            {:catch err}
              <span>Error loading info: {err}</span>
            {/await}
          </div>
        </div>
      </nav>
    </div>
  {/each}
</div>

{#if edit_description}
  <Modal active={true}>
    <div class="box">
      <div class="field">
        <strong class="subtitle">Edit Description</strong>
      </div>
      <div class="field">
        <textarea
          class="is-wide"
          placeholder="No description..."
          bind:value={description} />
      </div>
      <div class="level">
        <div class="level-left" />
        <div class="level-right">
          <div class="field is-grouped">
            <div class="control">
              <button
                class="button is-text"
                disabled={loading}
                on:click={() => {
                  edit_description = false;
                }}>
                Cancel
              </button>
            </div>
            <div class="control">
              <button
                class="button is-link"
                disabled={loading}
                on:click={updateDescription}>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
{/if}

{#if edit_tags}
  <Modal active={true}>
    <div class="box">
      <div class="field">
        <strong class="subtitle">Edit Tags</strong>
      </div>
      <!-- TODO: Make a tag input component -->
      <div class="field">
        <textarea class="is-wide" placeholder="No tags..." bind:value={tags} />
      </div>
      <div class="field">
        <Tags formatted tags={formatTags(tags)} />
      </div>
      <div class="level">
        <div class="level-left" />
        <div class="level-right">
          <div class="field is-grouped">
            <div class="control">
              <button
                class="button is-text"
                disabled={loading}
                on:click={() => {
                  edit_tags = false;
                }}>
                Cancel
              </button>
            </div>
            <div class="control">
              <button
                class="button is-link"
                disabled={loading}
                on:click={updateTags}>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
{/if}
