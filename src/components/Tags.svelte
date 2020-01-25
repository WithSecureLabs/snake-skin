<script>
  import Tag from "./Tag.svelte";

  export let formatted = false;
  export let tags;
</script>

<div class={formatted ? 'field is-grouped is-grouped-multiline' : 'tags'}>
  {#each tags as tag}
    <Tag {formatted} {tag} />
  {/each}
</div>
