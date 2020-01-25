<script>
  export let loading = false;
</script>

<style lang="scss">
  .loading {
    @include overlay;
    align-items: center;
    display: none;
    justify-content: center;
    overflow: hidden;
    z-index: 30;
    &.is-active {
      display: flex;
    }
    .loading-background {
      @include overlay;
      background: rgba(255, 255, 255, 0.5);
    }
    .mdi {
      color: $grey;
      font-size: 7rem;
    }
  }
</style>

{#if loading}
  <div class="loading is-active">
    <div class="loading-background" />
    <span class="mdi mdi-loading spin" />
  </div>
{/if}
