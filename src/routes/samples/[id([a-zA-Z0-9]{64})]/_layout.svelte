<script context="module">
  import { getSample } from "api/snake";
  export async function preload({ params }) {
    let sample = await getSample(params.id, { fetch: this.fetch }).then(
      resp => {
        if (resp.status === "success") {
          return resp.data.sample;
        } else {
          // TODO: Got to 404 page...
          return {};
        }
      }
    );
    return { sample };
  }
</script>

<script>
  import { stores } from "@sapper/app";
import { BASE_URL } from "config";
import * as snake from "api/snake";
  import Modal from "../../../components/Modal.svelte";
  import Analysis from "./analysis.svelte";
  import Index from "./index.svelte";
  import Interfaces from "./interfaces.svelte";
  import Notes from "./notes.svelte";

  export let sample;

  const { page } = stores();

  let edit_name = false;
  let name = sample.name;
  let loading = false;

  $: segments = $page.path.split("/");

  function updateName() {
    loading = true;
    snake.patchSample(sample.file_type, sample.sha256_digest, { name }).then(resp => {
      if (resp.status === "success") {
        sample = resp.data[sample.file_type];
      } else {
        name = sample.name;
        // TODO: Toast...
      }
      edit_name = false;
      loading = false;
    });
  }
</script>

<style lang="scss">
  .is-minimal {
    border: 0;
    height: unset;
    padding: 0;
  }
  .wrapper {
    height: 100%;
    margin: -1rem;
    overflow: auto;
    padding: 1rem;
  }
</style>

<div class="level">
  <div class="level-left">
    <div class="level-item">
      <div>
        <span class="heading">MIME</span>
        <span>{sample.mime}</span>
      </div>
    </div>
    <div class="level-item">
      <div>
        <div class="is-flex">
          <span class="heading">Name</span>
          <button class="heading button is-minimal" disabled={edit_name}>
            <a
              class="mdi mdi-pencil is-small"
              on:click={() => {
                edit_name = true;
              }} />
          </button>
        </div>
        <span>{sample.name}</span>
      </div>
    </div>
  </div>
  <div class="level-right">
    <div class="level-item">
      <a
        class="button"
        href="{BASE_URL}/download?sha256_digest={sample.sha256_digest}"
        download>
        Download
      </a>
    </div>
  </div>
</div>

<div class="wrapper">
  <!-- NOTE: You cannot do <slot {sample} /> so we have to do a bit more work... -->
  {#if segments[3] === 'analysis'}
    <svelte:component this={Analysis} bind:sample={sample} />
  {:else if segments[3] === 'notes'}
    <svelte:component this={Notes} bind:sample={sample} />
  {:else if segments[3] === 'interfaces'}
    <svelte:component this={Interfaces} bind:sample={sample} />
  {:else}
    <svelte:component this={Index} bind:sample={sample} />
  {/if}
</div>

{#if edit_name}
  <Modal active={true}>
    <div class="box">
      <div class="field">
        <strong class="subtitle">Edit Name</strong>
      </div>
      <div class="field">
        <input class="input" type="string" bind:value={name} />
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
                  edit_name = false;
                  name = sample.name;
                }}>
                Cancel
              </button>
            </div>
            <div class="control">
              <button
                class="button is-link"
                disabled={loading}
                on:click={updateName}>
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Modal>
{/if}
