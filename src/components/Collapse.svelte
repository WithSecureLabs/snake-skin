<script>
  import { slide } from "svelte/transition";
  export let open = false;
</script>

<style lang="scss">
  .collapse {
    display: flex;
    flex-flow: column;
    min-height: 0;
    min-width: 0;
    .collapse-content {
      display: flex;
      height: 100%;
      flex-flow: column;
      min-height: 0;
      min-width: 0;
    }
  }
</style>

<div class="collapse">
  <div class="collapse-trigger" on:click={() => (open = !open)}>
    <slot name="trigger" {open} />
  </div>
  {#if open}
    <!-- NOTE: Disable for now, they impact navigation speed -->
    <!-- <div transition:slide="{{ duration: 200 }}" class="collapse-content"> -->
    <div class="collapse-content">
      <slot {open} />
    </div>
  {/if}
</div>
