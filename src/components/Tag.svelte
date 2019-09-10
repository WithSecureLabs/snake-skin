<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();
  function close(event) {
    dispatch("close");
  }

  export let deleteable = false;
  export let formatted = false;
  export let tag;
</script>

<style lang="scss">
  .control {
    display: flex;
  }
  .is-primary {
    color: $white;
  }
  .tags {
    min-height: 1em;
    .tag {
      height: 100%;
    }
  }
  .tags:last-child {
    margin-bottom: unset;
  }
  pre {
    background-color: unset;
    color: unset;
    padding: unset;
  }
</style>

{#if formatted}
  <div class="control">
    <div class="tags {tag.prefix ? 'has-addons' : ''}">
      {#if tag.prefix}
        <span class="tag {tag.class ? tag.class : 'is-primary'}">
          <pre>{tag.prefix}</pre>
        </span>
      {/if}
      <span class="tag">
        <pre>{tag.value}</pre>
      </span>
    </div>
  </div>
{:else}
  {#if deleteable}
    <span class="tag">
      {tag}
      <button class="delete is-small" on:click|stopPropagation={close} />
    </span>
  {:else}
    <span class="tag">
      <pre>{tag}</pre>
    </span>
  {/if}
{/if}
