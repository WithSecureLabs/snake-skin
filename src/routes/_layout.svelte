<script>
  import { onMount } from "svelte";
  import { scales } from "../stores/snake";
  import Nav from "./_nav.svelte";
  import Side from "./_side.svelte";

  export let segment;

  // XXX: This wrap is temporary
  onMount(() => { 
    if (process.browser) {
      // Load scales...
      $scales;
    }
  });
</script>

<style global lang="scss">
  @import "src/styles/global.scss";

  main {
    display: flex;
    flex-flow: column;
    margin-top: 3.5rem;
    min-height: 0;
    min-width: 0;
    overflow: auto;
    padding: 1rem;
    width: 100%;
  }

  #nav {
    position: absolute;
    top: 0;
    width: 100%;
  }

  #sapper {
    display: flex;
    height: 100vh;
  }

  #side {
    margin-top: 3.5rem;
  }
</style>

<Nav />

<Side {segment} />

<main>
  <slot />
</main>
