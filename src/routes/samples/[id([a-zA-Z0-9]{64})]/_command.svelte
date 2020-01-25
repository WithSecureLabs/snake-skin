<script>
  import { createEventDispatcher } from "svelte";
  import * as snake from "api/snake";
  import { toCaps } from "utils/helpers";
  import { scales } from "../../../stores/snake";
  import Loading from "../../../components/Loading.svelte";
  import Output from "../../../components/Output.svelte";
  import Tabs from "../../../components/Tabs.svelte";

  export let command;
  export let commands;
  export let scale;
  export let sha256_digest;

  const dispatch = createEventDispatcher();
  const preferred_formats = ["markdown", "plaintext", "json"]; // TODO: This should be a setting

  let args = {};
  let drawer = false;
  let errors = {};
  let filter = "";
  let format = "json";
  let formats = ["json"];
  let loading = false;
  let resp;
  let status = "success";
  let tab = 0;
  let timeout = 600;
  let _args;
  let _command;
  let _scale;

  $: onLoad(sha256_digest, scale, command);
  $: onUpdate(commands);

  function changeArgs(a, data) {
    _args = a;
    args = data.args;
    status = data.status;
    getCommand();
  }

  function changeFormat(f) {
    format = f;
    getCommand();
  }

  function getCommand() {
    loading = true;
    snake
      .getCommand(sha256_digest, scale, command, { args: _args, format })
      .then(r => {
        if (r.status === "success") {
          resp = r.data.command;
        } else {
          console.error(r.message);
        }
        status = r.status;
        loading = false;
      });
  }

  function onLoad(sha256_digest, scale, command) {
    args = {};
    errors = {};
    resp = undefined;
    status = "success";
    timeout = 600;

    if (typeof $scales[scale] === "undefined") {
      console.error("scale not found");
      return;
    }
    _scale = $scales[scale];
    if (
      typeof _scale.components.commands === "undefined" ||
      typeof _scale.components.commands[command] === "undefined"
    ) {
      console.error("command not found");
      return;
    }
    _command = _scale.components.commands[command];

    let fs = [];
    preferred_formats.forEach(f => {
      if (_command.formats.indexOf(f) !== -1) {
        fs.push(f);
      }
    });
    formats = fs;
    format = formats[0];

    // FIXME: Do this better...
    _args = "{}";
    if (
      typeof commands[scale] !== "undefined" &&
      typeof commands[scale][command] !== "undefined"
    ) {
      const history = Object.entries(commands[scale][command]);
      if (history.length > 0) {
        _args = history[0][0];
      }
    }

    getCommand();
  }

  function onUpdate(commands) {
    if (
      typeof commands[scale] !== "undefined" &&
      typeof commands[scale][command] !== "undefined" &&
      typeof commands[scale][command][_args] !== "undefined"
    ) {
      status = commands[scale][command][_args].status;
      if (status === "success" || status === "failed") {
        // XXX: This will dup with onLoad sometimes...
        getCommand();
      }
    }
  }

  function runCommand() {
    // Post the command handle the immediate response, but then wait on the store...
    status = "pending";
    _args = JSON.stringify(args);
    snake
      .postCommand(sha256_digest, scale, command, { args, timeout })
      .then(resp => {
        if (resp.status !== "success") {
          status = "error";
          errors = resp.message;
          drawer = true;
          tab = 2;
        } else {
          status = resp.status;
          // XXX: Hack force parent to reload commands using dispatch, this is bad
          dispatch("loadCommands");
        }
      });
  }

  function toggleDrawer() {
    drawer = !drawer;
  }
</script>

<style lang="scss">
  .columns {
    margin: 0;
  }
  .drawer {
    border-right: 1px solid $white-ter;
    max-width: 15rem;
    padding: 0.75rem;
    width: 15rem;
  }
  .menubar {
    border-bottom: 1px solid $white-ter;
    padding: 0.75rem;
  }
  .output {
    display: flex;
    height: 100%;
    padding: 0;
    position: relative;
    width: 100%;
  }
  :global(.tabs) {
    margin-bottom: 0 !important;
  }
</style>

<div class="menubar">
  <nav class="level">
    <div class="level-left">
      <div class="level-item">
        <div>
          <p class="heading">Menu</p>
          <div class="button is-small" on:click={toggleDrawer}>
            <span class="mdi mdi-information" />
          </div>
          <button
            class="button is-small"
            disabled={status === 'pending' || status === 'running'}
            on:click={runCommand}>
            {#if status === 'pending'}
              <span class="mdi mdi-dots-horizontal" />
            {:else if status === 'running'}
              <span class="mdi mdi-loading spin" />
            {:else}
              <span class="mdi mdi-play-circle" />
            {/if}
          </button>
          <div class="select is-small">
            <select value={format}>
              {#each formats as f}
                <option value={f} on:click={() => changeFormat(f)}>
                  {toCaps(f)}
                </option>
              {/each}
            </select>
          </div>
        </div>
      </div>
    </div>
  </nav>
</div>

<div class="columns is-high">
  {#if drawer === true}
    <div class="drawer column is-narrow is-paddingless">
      <Tabs small {tab} tabs={['Details', 'History', 'Arguments']} let:tab>
        <div class="column">
          {#if tab === 0}
            <p class="heading">Info</p>
            <p>{_command.info}</p>
          {:else if tab === 1}
            <input
              class="input is-small"
              type="text"
              placeholder="Search..."
              bind:value={filter} />
            <aside class="historybar menu">
              <ul class="menu-list">
                <!-- TODO: Make this not gross... -->
                <!-- TODO: Also I don't like the layout either... -->
                {#if commands[scale] && commands[scale][command]}
                  {#each Object.entries(commands[scale][command]) as [args, data]}
                    {#if Object.keys(data.args).length > 0}
                      {#if filter === '' || args.includes(filter)}
                        <li>
                          <a
                            class="{_args === args ? 'is-active' : ''}
                            is-paddingless"
                            on:click={() => changeArgs(args, data)}>
                            <div class="columns">
                              <div class="column is-variable is-paddingless">
                                <ul>
                                  {#each Object.entries(data.args) as [k, v]}
                                    <li>
                                      <p>{toCaps(k, { delimiter: '_' })}:{v}</p>
                                    </li>
                                  {/each}
                                </ul>
                              </div>
                              <div class="column is-narrow">
                                {#if data.status === 'success'}
                                  <span class="mdi mdi-check" />
                                {:else if data.status === 'failed'}
                                  <span class="mdi mdi-close" />
                                {:else if data.status === 'running'}
                                  <span class="mdi mdi-loading spin" />
                                {:else if data.status === 'pending'}
                                  <span class="mdi mdi-dots-horizontal" />
                                {/if}
                              </div>
                            </div>
                          </a>
                        </li>
                      {/if}
                    {:else}
                      <li>
                        <a
                          class="{_args === args ? 'is-active' : ''}
                          is-paddingless"
                          on:click={() => changeArgs(args, data)}>
                          <div class="columns">
                            <div class="column is-variable is-paddingless">
                              <ul>
                                <li>
                                  <p>Defaults</p>
                                </li>
                              </ul>
                            </div>
                            <div class="column is-narrow">
                              {#if data.status === 'success'}
                                <span class="mdi mdi-check" />
                              {:else if data.status === 'failed'}
                                <span class="mdi mdi-close" />
                              {:else if data.status === 'running'}
                                <span class="mdi mdi-loading spin" />
                              {:else if data.status === 'pending'}
                                <span class="mdi mdi-dots-horizontal" />
                              {/if}
                            </div>
                          </div>
                        </a>
                      </li>
                    {/if}
                  {/each}
                {:else}
                  <li>No history...</li>
                {/if}
              </ul>
            </aside>
          {:else if tab === 2}
            <p class="heading">Timeout</p>
            <input
              class="input is-small"
              type="number"
              placeholder="600"
              bind:value={timeout} />
            {#if _command.args}
              {#each Object.entries(_command.args) as [arg, info]}
                <!-- TODO: Make a component -->
                <p class="heading">
                  {toCaps(arg, { delimiter: '_' })}{info.required ? ' *' : ''}
                </p>
                {#if info.values}
                  <div class="select is-small">
                    <select bind:value={args[arg]}>
                      {#if info.default === null}
                        <option>none</option>
                      {/if}
                      {#each info.values as value}
                        <option>{value}</option>
                      {/each}
                    </select>
                  </div>
                {:else if info.type === 'integer'}
                  <div class="field">
                    <input
                      class="input is-small {errors.args && errors.args[arg] ? 'is-danger' : ''}"
                      type="number"
                      placeholder={info.default}
                      bind:value={args[arg]} />
                    {#if errors.args && errors.args[arg]}
                      <p class="help is-danger">{errors.args[arg]}</p>
                    {/if}
                  </div>
                {:else if info.type === 'boolean'}
                  <label class="checkbox is-small">
                    <!-- TODO: Default -->
                    <input
                      type="checkbox"
                      checked={args[arg] ? args[arg] : info.default}
                      on:input={event => {
                        args[arg] = event.target.checked;
                      }} />
                    True
                  </label>
                {:else}
                  <div class="field">
                    <input
                      class="input is-small {errors.args && errors.args[arg] ? 'is-danger' : ''}"
                      type="string"
                      placeholder={info.default}
                      bind:value={args[arg]} />
                    {#if errors.args && errors.args[arg]}
                      <p class="help is-danger">{errors.args[arg]}</p>
                    {/if}
                  </div>
                {/if}
              {/each}
            {/if}
          {/if}
        </div>
      </Tabs>
    </div>
  {/if}
  <div class="column output">
    <Loading {loading} />
    {#if resp}
      <Output format={resp.format} output={resp.output} />
    {:else}
      <div class="is-flex is-high is-wide">
        <div class="no-content">
          <span class="mdi mdi-flask-empty" />
          <p>Command not run...</p>
        </div>
      </div>
    {/if}
  </div>
</div>
