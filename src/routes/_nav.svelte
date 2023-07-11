<script>
  import { goto, stores } from "@sapper/app";
  import UploadModal from "../components/UploadModal.svelte";

  const { session } = stores();

  let search = "";
  let user = false;
  let upload = false;

  async function logout(_event) {
    await window
      .fetch("auth/logout", { method: "POST" })
      .then((resp) => {
        if (resp.redirected) {
          window.location.href = resp.url;
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

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

<nav
  id="nav"
  class="navbar is-dark"
  role="navigation"
  aria-label="main navigation"
>
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
            on:keypress={searchStore}
          />
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
            }}
          >
            <strong>Upload</strong>
          </a>
        </div>
      </div>
      {#if $session.user}
        <div class="navbar-item">
          <div class="dropdown is-right {user ? 'is-active' : ''}">
            <div class="dropdown-trigger">
              <button
                class="button"
                aria-haspopup="true"
                aria-controls="dropdown-menu"
                on:click={() => {
                  user = !user;
                }}
              >
                <span class="icon is-medium">
                  <i
                    class="mdi mdi-account-circle mdi-36px"
                    aria-hidden="true"
                  />
                </span>
                <span class="icon is-small">
                  <i class="mdi mdi-menu-down" aria-hidden="true" />
                </span>
              </button>
            </div>
            {#if user}
              <div class="dropdown-menu" id="dropdown-menu" role="menu">
                <div class="dropdown-content">
                  <span class="dropdown-item">{$session.user}</span>
                  <hr class="dropdown-divider" />
                  <a class="dropdown-item" on:click={logout}>Logout</a>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</nav>

{#if upload}
  <UploadModal bind:active={upload} />
{/if}

<style lang="scss">
  .navbar-brand {
    .navbar-item:first-child {
      padding-left: 0.25rem;
    }
  }
</style>
