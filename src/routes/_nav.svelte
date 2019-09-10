<script>
  import { goto } from "@sapper/app";
  import UploadModal from "../components/UploadModal.svelte";

  let search = "";
  let upload = false;

  function searchStore(event) {
    if (search === "") {
      return;
    }
    if (event.keyCode === 13) {
      goto(`samples?filter=${search}`);
      search = "";
    }
  }
</script>

<style lang="scss">
  .navbar-brand {
    .navbar-item:first-child {
      padding-left: 0.25rem;
    }
  }
</style>

<nav
  id="nav"
  class="navbar is-dark"
  role="navigation"
  aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img src="logo.svg" width="112" height="28" alt="snake_logo" />
    </a>
  </div>

  <div class="navbar-menu">
    <div class="navbar-start" />

    <div class="navbar-end">
      <div class="navbar-item">
        <p class="control has-icons-right">
          <input
            class="input"
            placeholder="Search or jump to..."
            type="text"
            bind:value={search}
            on:keypress={searchStore} />
          <span class="icon is-small is-right">
            <span class="mdi mdi-magnify" />
          </span>
        </p>
      </div>
      <div class="navbar-item">
        <div class="buttons">
          <a
            class="button is-primary"
            on:click={() => {
              upload = true;
            }}>
            <strong>Upload</strong>
          </a>
        </div>
      </div>
    </div>
  </div>
</nav>

{#if upload}
  <UploadModal bind:active={upload} />
{/if}
