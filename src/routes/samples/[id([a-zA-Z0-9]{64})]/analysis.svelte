<script>
  import { onDestroy } from "svelte";
  import * as snake from "api/snake";
  import { sorted, toCaps } from "utils/helpers";
  import { scales } from "../../../stores/snake";
  import Collapse from "../../../components/Collapse.svelte";
  import Command from "./_command.svelte";

  export let sample;

  let active = {};
  let commands = {};
  let filter = "";
  let inactive = {};
  let pollTimer;
  let selected = {
    scale: undefined,
    command: undefined
  };
  let stats = {};

  $: getStats(commands);
  $: loadScales($scales);
  $: filterActive = filterDict(filter, active);
  $: filterInactive = filterDict(filter, inactive);

  onDestroy(() => {
    if (pollTimer) {
      clearTimeout(pollTimer);
    }
  });

  function filterDict(f, d) {
    if (f === "" || typeof d !== "object") {
      return d;
    }
    const temp = {};
    Object.entries(d).forEach(([k, v]) => {
      if (k.toLowerCase().includes(f.toLowerCase())) {
        temp[k] = v;
      }
    });
    return temp;
  }

  function getStats(commands) {
    let poll = false;
    const ss = {};
    Object.entries(commands).forEach(([s, cs]) => {
      ss[s] = {};
      Object.entries(cs).forEach(([c, args]) => {
        args = Object.entries(args);
        if (args.length > 0) {
          let pending = false;
          let running = false;
          let failed = false;
          let success = false;
          args.forEach(([_k, v]) => {
            if (v.status === "pending") {
              pending = true;
            } else if (v.status === "running") {
              running = true;
            } else if (v.status === "failed") {
              failed = true;
            } else if (v.status === "success") {
              success = true;
            }
          });
          if (pending || running) {
            poll = true;
          }
          if (pending) {
            ss[s][c] = "pending";
          } else if (running) {
            ss[s][c] = "running";
          } else if (failed && success) {
            ss[s][c] = "warning";
          } else if (failed) {
            ss[s][c] = "failed";
          } else if (success) {
            ss[s][c] = "success";
          }
        } else {
          ss[s][c] = "";
        }
      });
    });
    stats = ss;

    // HACK: We should only ask Snake for pending/running commands to be
    // efficient but this is not supported yet...
    if (poll) {
      if (pollTimer) {
        clearTimeout(pollTimer);
      }
      pollTimer = setTimeout(() => {
        loadCommands();
      }, 5000);
    }
  }

  async function loadCommands() {
    await snake
      .getCommands({ sha256_digest: sample.sha256_digest, output: false })
      .then(resp => {
        if (resp.status === "success") {
          const c = {};
          resp.data.commands.forEach(command => {
            if (typeof c[command.scale] === "undefined") {
              c[command.scale] = {};
            }
            if (typeof c[command.scale][command.command] === "undefined") {
              c[command.scale][command.command] = {};
            }
            c[command.scale][command.command][
              JSON.stringify(command.args)
            ] = command;
          });
          commands = c;
        } else {
          console.error(resp.message);
        }
      });
  }

  async function loadScales(scales) {
    // Get commands, bit inefficient...
    await loadCommands();
    Object.values(scales).forEach(scale => {
      if (
        scale.supports.indexOf(sample.file_type) !== -1 &&
        Object.keys(scale.components).indexOf("commands") !== -1
      ) {
        if (Object.keys(commands).indexOf(scale.name) !== -1) {
          active[scale.name] = scale;
        } else {
          inactive[scale.name] = scale;
        }
      }
    });
    active = Object.assign({}, active);
    inactive = Object.assign({}, inactive);
  }

  function selectCommand(e, scale, command) {
    if (e.detail === 1) {
      let s = { scale, command, args: "{}" };
      if (
        typeof commands[scale] !== "undefined" &&
        typeof commands[scale][command] !== "undefined" &&
        Object.keys(commands[scale][command]).length > 0
      ) {
        s.args = Object.keys(commands[scale][command])[0];
      }
      selected = s;
    } else if (e.detail === 2) {
      if (
        commands[scale] &&
        commands[scale][command] &&
        (commands[scale][command]["{}"].status === "pending" ||
          commands[scale][command]["{}"].status === "running")
      ) {
        return;
      }
      snake.postCommand(sample.sha256_digest, scale, command).then(resp => {
        if (!resp.error) {
          loadCommands({ sha256_digest: sample.sha256_digest, output: false });
        }
      });
    }
  }

  function toActive(scale) {
    active[scale] = inactive[scale];
    delete inactive[scale];
    active = active;
    inactive = inactive;
  }
</script>

<style lang="scss">
  a.menu-list {
    display: flex;
    font-size: 0.75rem;
    padding: 0.2rem 1rem;
    text-transform: uppercase;
    .heading {
      display: flex;
      margin: auto;
    }
    .heading:first-child {
      flex-grow: 1;
    }
  }
  p.menu-list {
    padding: 0.2rem 1rem;
  }
  .analysis {
    height: 100%;
    width: 100%;
  }
  .columns {
    margin: 0 !important;
  }
  .command {
    display: flex;
    flex-flow: column;
    padding: 0;
  }
  .commandbar {
    height: 100%;
    margin: 0.75rem -0.75rem -0.75rem -0.75rem;
    overflow: auto;
    padding: 0 0.75rem;
  }
  .commandbar > * {
    margin-bottom: 0.75rem;
  }
  .commandbar > ul {
    margin-left: -0.75rem;
    margin-right: -0.75rem;
  }
  .menu-list li ul {
    margin: 0 0 0.5rem 1rem;
    padding: 0;
  }
  .mini {
    color: $grey;
    font-size: 6pt;
    margin: 0 !important;
  }
  .scalebar {
    border-right: 1px solid $white-ter;
    display: flex;
    flex-flow: column;
    height: 100%;
    min-height: 0;
    min-width: 0;
    overflow: unset;
  }
  .panel-block {
    flex-grow: 1;
    min-height: 0;
    min-width: 0;
    padding: 0;
  }
</style>

<svelte:head>
  <title>Samples - {sample.name}</title>
</svelte:head>

<div class="analysis">
  <nav class="panel is-flex is-flex-column is-high">
    <p class="panel-heading">Analysis</p>
    <div class="panel-block">
      <div class="columns is-high is-wide">
        <div class="scalebar column is-narrow">
          <p class="heading">Scales</p>
          <input
            class="input is-small"
            type="text"
            placeholder="Search..."
            bind:value={filter} />
          <div class="commandbar">
            <p class="heading mini">Active</p>
            <ul class="menu-list">
              {#if Object.keys(filterActive).length > 0}
                {#each Object.entries(sorted(filterActive)) as [name, scale]}
                  <li>
                    <Collapse let:open open={true}>
                      <a class="menu-list" slot="trigger">
                        <p class="heading">
                          {toCaps(name, { delimiter: '_' })}
                        </p>
                        {#if open}
                          <span class="heading mdi mdi-menu-down" />
                        {:else}
                          <span class="heading mdi mdi-menu-right" />
                        {/if}
                      </a>
                      <ul>
                        {#each Object.values(scale.components.commands) as command}
                          <li>
                            <a
                              class="menu-list {selected.scale === name && selected.command === command.command ? 'is-active' : ''}"
                              on:click={event => selectCommand(event, name, command.command)}>
                              <p class="heading">
                                {toCaps(command.command, { delimiter: '_' })}
                              </p>
                              {#if stats[name] && stats[name][command.command]}
                                {#if stats[name][command.command] === 'success'}
                                  <span class="mdi mdi-check" />
                                {:else if stats[name][command.command] === 'warning'}
                                  <span class="mdi mdi-exclamation" />
                                {:else if stats[name][command.command] === 'failed'}
                                  <span class="mdi mdi-close" />
                                {:else if stats[name][command.command] === 'running'}
                                  <span class="mdi mdi-loading spin" />
                                {:else if stats[name][command.command] === 'pending'}
                                  <span class="mdi mdi-dots-horizontal" />
                                {/if}
                              {:else}
                                <div class="field" />
                              {/if}
                            </a>
                          </li>
                        {/each}
                      </ul>
                    </Collapse>
                  </li>
                {/each}
              {:else}
                <p class="menu-list heading">No active scales...</p>
              {/if}
            </ul>
            <p class="heading mini">Inactive</p>
            <ul class="menu-list">
              {#if Object.keys(filterInactive).length > 0}
                {#each Object.entries(sorted(filterInactive)) as [name, scale]}
                  <li>
                    <a class="menu-list" on:click={() => toActive(name)}>
                      <p class="heading">{toCaps(name, { delimiter: '_' })}</p>
                    </a>
                  </li>
                {/each}
              {:else}
                <p class="menu-list heading">No inactive scales...</p>
              {/if}
            </ul>
          </div>
        </div>
        <div class="column command">
          {#if selected.command}
            <Command
              on:loadCommands={loadCommands}
              {commands}
              sha256_digest={sample.sha256_digest}
              scale={selected.scale}
              command={selected.command} />
          {:else}
            <div class="is-flex is-high is-wide">
              <div class="no-content">
                <span class="mdi mdi-scale-balance" />
                <p>No command selected...</p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </nav>
</div>
