<script>
  // TODO: We can't use a generic tabs until we can iterate through the slots...
  // NOTE: So for now we are writing a crap one
  // https://github.com/sveltejs/svelte/issues/2106
  export let disabled = false;
  export let small = false;
  export let tab = 0;
  export let tabs = [];
</script>

<style lang="scss">
  .tabs {
    flex-shrink: 0;
    min-height: 0;
    min-width: 0;
    a.is-disabled {
      border-color: $grey-lighter;
      color: $grey-lighter;
      cursor: unset;
    }
  }
</style>

<div class="tabs {small ? 'is-small' : ''}">
  <slot name="tabs" {tab}>
    <ul>
      {#each tabs as t, i}
        <li class={i === tab ? 'is-active' : ''}>
          <a
            class={disabled ? 'is-disabled' : ''}
            on:click={() => {
              tab = i;
            }}>
            {t}
          </a>
        </li>
      {/each}
    </ul>
  </slot>
</div>
<slot {tab} />
