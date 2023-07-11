<script context="module">
  export async function preload({ query }, { user }) {
    const authenticated = !!user;
    const auth = !!query.auth;
    return { authenticated, auth };
  }
</script>

<script>
  import { onMount } from "svelte";
  import { stores } from "@sapper/app";
  import { scales } from "../stores/snake";
  import Nav from "./_nav.svelte";
  import Side from "./_side.svelte";

  export let authenticated = false;
  export let auth = false;
  export let segment;

  const { page, session } = stores();

  // XXX: This wrap is temporary
  onMount(() => {
    if (process.browser) {
      if (
        (auth || $page.path === "/login") &&
        window.parent.name === "Snake - Auth"
      ) {
        window.opener.postMessage(
          `auth:${window.location.host}`,
          window.origin
        );
        window.close();
      }
      if (authenticated) {
        // Load scales...
        $scales;
      }
    }
  });
</script>

<svelte:head>
  <link rel="icon" type="image/png" href="favicon.png" />
  <title>Snake</title>
</svelte:head>

{#if auth}
  <div class="container is-fluid p-0">
    <span class="mdi bag-carry-on-check is-size-4" />
    <p>Login successful...</p>
  </div>
{:else if authenticated || !$session.auths}
  <Nav />

  <Side {segment} />

  <main>
    <slot />
  </main>
{:else}
  <slot />
{/if}

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
