<script>
  import { createEventDispatcher } from "svelte";

  export let active = false;
  export let canClose = true;
  export let classes = "";
  export let outside = false;

  const dispatch = createEventDispatcher();

  function close(event) {
    if (canClose) {
      active = false;
      dispatch("close");
    }
  }
</script>

{#if active}
  <div class="modal is-active">
    {#if outside}
      <div class="modal-background" on:click|stopPropagation={close} />
    {:else}
      <div class="modal-background" />
    {/if}
    <div class="modal-content {classes}">
      <slot />
    </div>
    <button
      class="modal-close is-large"
      aria-label="close"
      on:click|stopPropagation={close} />
  </div>
{/if}
