<script>
  import { onMount } from "svelte";
  import * as snake from "api/snake";
  import Output from "../../../components/Output.svelte";

  export let sample;

  let edit_note = false;
  let loading = false;
  let notes = "";
  let output = "";

  onMount(() => {
    snake.getNote(sample.sha256_digest).then(resp => {
      if (resp.status === "success") {
        output = resp.data.note.body;
      } else {
        output = '';
      }
      notes = output;
    });
  });

  async function updateNote() {
    let resp = await snake.patchNote(sample.sha256_digest, {body: notes});
    if (resp.status !== "success") {
      resp = await snake.postNote(sample.sha256_digest, {body: notes});
    }
    if (resp.status === "success") {
      output = resp.data.note.body;
    } else {
      console.error(resp.message);
    }
    edit_note = false;
  }
</script>

<style lang="scss">
  button {
    border: unset;
    background: unset;
  }
  .menu-list > li > a {
    display: flex;
    span {
      display: flex;
      flex-grow: 1;
    }
    button {
      margin: auto;
    }
  }
  .note {
    display: flex;
    flex-flow: column;
    textarea {
      margin-bottom: 0.5rem;
    }
  }
  .notes {
    height: 100%;
    width: 100%;
  }
  .notebar {
    border-right: 1px solid $white-ter;
    height: 100%;
    padding: 0;
  }
  .notebar > div {
    height: 100%;
    min-height: 0;
    overflow: auto;
    padding: 0;
    width: 10rem;
  }
  .panel-block {
    flex-grow: 1;
    overflow: auto;
    padding: 0;
  }
</style>

<svelte:head>
  <title>Samples - {sample.name}</title>
</svelte:head>

<div class="notes">
  <nav class="panel is-flex is-flex-column is-high">
    <p class="panel-heading">Notes</p>
    <div class="panel-block">
      <div class="columns is-high is-marginless is-wide">
        <div class="notebar column is-narrow">
          <div>
            <!-- TODO: Wait til we support multiple notes... -->
            <ul class="menu-list">
              <li>
                <a class="is-active">
                  <span style="is-wide">Default</span>
                  <button
                    class="mdi mdi-pencil"
                    on:click={() => {
                      edit_note = true;
                    }} />
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div class="note column">
          {#if !edit_note}
            {#if output !== ''}
              <Output format={'markdown'} {output} />
            {:else}
              <p>No notes...</p>
            {/if}
          {:else}
            <textarea
              class="is-high is-wide"
              placeholder="No notes..."
              bind:value={notes} />
            <div class="level">
              <div class="level-left" />
              <div class="level-right">
                <div class="field is-grouped">
                  <div class="control">
                    <button
                      class="button is-text"
                      disabled={loading}
                      on:click={() => {
                        notes = output;
                        edit_note = false;
                      }}>
                      Cancel
                    </button>
                  </div>
                  <div class="control">
                    <button
                      class="button is-link"
                      disabled={loading}
                      on:click={updateNote}>
                      Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </nav>
</div>
