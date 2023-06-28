<script context="module">
  export async function preload({ query }, { user }) {
    if (user) {
      this.redirect(302, "/");
    }
    const data = {
      params: undefined,
      referer: undefined,
    };
    if (query.referer) {
      data.referer = query.referer;
    }
    if (query.params) {
      try {
        data.params = JSON.parse(query.params);
      } catch (err) {
        data.params = query.params;
      }
    }
    return data;
  }
</script>

<script>
  import { onMount } from "svelte";

  export let params;
  export let referer;

  let auth_window;

  onMount(() => {
    if (process.browser) {
      window.addEventListener("message", check, false);
      return () => {
        window.removeEventListener("message", check, false);
      };
    }
  });

  function check(event) {
    if (event.origin !== window.origin) return;
    if (!event.data.startsWith("auth:")) return;
    if (auth_window && auth_window.closed) {
      window.location.reload();
    }
  }

  function login() {
    let url = "/auth/login";
    const args = [];
    if (referer) {
      args.push(`referer=${referer}`);
    }
    if (params && Object.keys(params).length > 0) {
      args.push(`params=${JSON.stringify(params)}`);
    }
    if (args.length > 0) {
      url = `${url}?${args.join("&")}`;
    }
    if (auth_window) {
      auth_window.close();
    }
    auth_window = window.open(url, "Snake - Auth", "width=500,height=400");
    auth_window.addEventListener("unload", post, false);
  }

  function post() {
    auth_window.opener.postMessage(
      `auth:${auth_window.location.host}`,
      auth_window.origin
    );
  }
</script>

<svelte:head>
  <title>Snake - Login</title>
</svelte:head>

<div class="columns container is-fluid p-0">
  <div
    class="column is-flex has-background-dark is-justify-content-center is-two-thirds is-align-items-center"
  >
    <img src="logo.svg" width="800" alt="snake_logo" />
  </div>
  <div
    class="column is-flex has-background-white is-align-items-center is-justify-content-center"
  >
    <section class="hero">
      <p class="title">Welcome to the Malware Zoo!</p>
      <button
        class="button is-large is-primary {!!auth_window ? 'is-loading' : ''}"
        disabled={!!auth_window}
        on:click={() => {
          login();
        }}
      >
        Login
      </button>
    </section>
  </div>
</div>
