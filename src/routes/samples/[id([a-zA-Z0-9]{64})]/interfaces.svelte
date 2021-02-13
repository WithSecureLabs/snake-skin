<script>
  // TODO: Needs a clean
  import * as snake from "api/snake";
  import { sorted, toCaps } from "utils/helpers";
  import { scales } from "../../../stores/snake";
  import Argument from "../../../components/Argument.svelte";
  import Collapse from "../../../components/Collapse.svelte";
  import Output from "../../../components/Output.svelte";

  export let sample;

  const default_formats = ["markdown", "plaintext", "json"]; // TODO: Should be a setting
  const base = {
    args: {},
    errors: {},
    format: undefined,
    resp: undefined,
    timeout: undefined
  };

  let drawer = false;
  let interfaces = {};
  let puller = undefined;
  let pusher = undefined;
  let pullers = {};
  let pushers = {};
  let selected;

  $: loadScales($scales);

  function loadScales(scales) {
    const i = {};
    Object.values(scales).forEach(scale => {
      if (
        scale.supports.indexOf(sample.file_type) !== -1 &&
        Object.keys(scale.components).indexOf("interface") !== -1
      ) {
        i[scale.name] = scale;
      }
    });
    interfaces = sorted(i);
  }

  function pull() {
    const p = pullers[puller];
    Object.keys(p.args).forEach(
      key => p.args[key] === undefined && delete p.args[key]
    );
    const extra = { format: p.format };
    if (p.args) {
      extra.args = p.args;
    }
    if (p.timeout) {
      extra.timeout = p.timeout;
    }
    snake
      .postScaleInterface(selected, "pull", puller, sample.sha256_digest, {
        ...extra
      })
      .then(resp => {
        pullers[puller].resp = resp.data;
        if (typeof resp.data !== 'undefined') {
          if (resp.status !== "success") {
            pullers[puller].resp.interface = {
              output: resp.message,
              format: 'plaintext'
            }
          }
        } else {
          pullers[puller].errors = resp.message.args;
        }
        pullers = pullers;
      });
  }

  function push() {
    const p = pushers[pusher];
    Object.keys(p.args).forEach(
      key => p.args[key] === undefined && delete p.args[key]
    );
    const extra = { format: p.format };
    if (p.args) {
      extra.args = p.args;
    }
    if (p.timeout) {
      extra.timeout = p.timeout;
    }
    snake
      .postScaleInterface(selected, "push", pusher, sample.sha256_digest, {
        ...extra
      })
      .then(resp => {
        drawer = true;
        pushers[pusher].resp = resp.data.interface;
        pushers = pushers;
      });
  }

  function selectInterface(i) {
    if (i === selected) {
      return;
    }
    puller = undefined;
    pusher = undefined;
    pullers = {};
    pushers = {};
    selected = i;
  }

  function selectPuller(p) {
    if (!pullers[p]) {
      pullers[p] = JSON.parse(JSON.stringify(base));
      // NOTE: Needed for hydration issue
      pullers[p].format = validFormats(
        interfaces[selected].components.interface[p].formats
      )[0];
    }
    puller = p;
  }

  function selectPusher(p) {
    if (!pushers[p]) {
      pushers[p] = JSON.parse(JSON.stringify(base));
    }
    pusher = p;
  }

  function validFormats(formats) {
    const f = [];
    default_formats.forEach(format => {
      if (formats.includes(format)) {
        f.push(format);
      }
    });
    return f;
  }
</script>

<style lang="scss">
  .interfaces {
    height: 100%;
    width: 100%;
  }
  .arguments {
    display: flex;
    flex-flow: column;
    flex-grow: 1;
  }
  .column,
  .columns {
    display: flex;
  }
  .commands {
    border-bottom: 1px solid $white-ter;
    height: 10rem;
    min-height: 10rem;
    overflow: auto;
  }
  .puller {
    margin: 0;
  }
  .pullerbar {
    border-right: 1px solid $white-ter;
    display: flex;
    flex-flow: column;
    height: 100%;
    padding: 0.75rem;
  }
  .pusher-output {
    height: 10rem;
  }
  .pusherbar {
    border-right: 1px solid $white-ter;
    display: flex;
    flex-flow: column;
    height: 100%;
    padding: 0.75rem;
  }
  .panel-block {
    flex-grow: 1;
    overflow: auto;
    padding: 0;
  }
  .panel-heading {
    display: flex;
  }
  .panel-heading > p {
    display: flex;
    flex-grow: 1;
  }
</style>

<svelte:head>
  <title>Samples - {sample.name}</title>
</svelte:head>

<div class="interfaces">
  <nav class="panel is-flex is-flex-column is-high">
    <div class="panel-heading">
      <p>Interfaces</p>
      <div class="select is-small">
        <select value={selected}>
          <option disabled hidden selected>No scale selected...</option>
          {#each Object.keys(interfaces) as i}
            <option
              on:click={() => {
                selectInterface(i);
              }}>
              {toCaps(i)}
            </option>
          {/each}
        </select>
      </div>
    </div>
    <div class="panel-block">
      {#if selected}
        <div class="puller columns is-high is-variable is-wide">
          {#if Object.values(interfaces[selected].components.interface).filter(command => command.type === 'push').length > 0}
            <div class="pusherbar column is-narrow">
              <span class="heading">Pushers</span>
              <div class="commands">
                <ul class="menu-list">
                  {#each Object.entries(interfaces[selected].components.interface) as [k, v]}
                    {#if v.type === 'push'}
                      <li>
                        <a
                          class="heading {pusher === k ? 'is-active' : ''}"
                          on:click={() => {
                            selectPusher(k);
                          }}>
                          {k}
                        </a>
                      </li>
                    {/if}
                  {/each}
                </ul>
              </div>
              <span class="heading">Arguments</span>
              <div class="arguments">
                {#if pusher}
                  <p class="heading">Format</p>
                  <div class="select is-fullwidth is-small">
                    <select bind:value={pushers[pusher].format}>
                      {#each validFormats(interfaces[selected].components.interface[pusher].formats) as format}
                        <option>{format}</option>
                      {/each}
                    </select>
                  </div>
                  <p class="heading">Timeout</p>
                  <div>
                    <input
                      class="input is-small"
                      type="number"
                      placeholder="600"
                      bind:value={pushers[pusher].timeout} />
                  </div>
                  {#if interfaces[selected].components.interface[pusher].args}
                    {#each Object.entries(interfaces[selected].components.interface[pusher].args) as [arg, info]}
                      <Argument
                        argument={arg}
                        {info}
                        error={pushers[pusher].errors[arg]}
                        bind:value={pushers[pusher].args[arg]} />
                    {/each}
                  {/if}
                {:else}
                  <span>No pusher selected...</span>
                {/if}
              </div>
              <Collapse let:open open={drawer}>
                <a class="heading is-flex" slot="trigger">
                  <span class="is-wide">Output</span>
                  {#if open}
                    <span class="mdi mdi-menu-down" />
                  {:else}
                    <span class="mdi mdi-menu-right" />
                  {/if}
                </a>
                <div class="pusher-output">
                  {#if pusher}
                    {#if pushers[pusher].resp}
                      <Output
                        format={pushers[pusher].resp.format}
                        output={pushers[pusher].resp.output} />
                    {:else}
                      <span>Pusher not run...</span>
                    {/if}
                  {:else}
                    <span>No pusher selected...</span>
                  {/if}
                </div>
              </Collapse>
              <div class="level">
                <div class="level-left" />
                <div class="level-right">
                  <div class="level-item">
                    <button class="button" disabled={!pusher} on:click={push}>
                      Push
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/if}
          <div class="column is-paddingless is-wide">
            <div class="columns is-high is-marginless is-variable is-wide">
              <div class="column pullerbar is-narrow">
                <span class="heading mini">Pullers</span>
                <div class="commands">
                  <ul class="menu-list">
                    {#each Object.entries(interfaces[selected].components.interface) as [k, v]}
                      {#if v.type === 'pull'}
                        <li>
                          <a
                            class="heading {puller === k ? 'is-active' : ''}"
                            on:click={() => {
                              selectPuller(k);
                            }}>
                            {k}
                          </a>
                        </li>
                      {/if}
                    {/each}
                  </ul>
                </div>
                <span class="heading mini">Arguments</span>
                <div class="arguments">
                  {#if puller}
                    <p class="heading">Format</p>
                    <div class="select is-fullwidth is-small">
                      <select bind:value={pullers[puller].format}>
                        {#each validFormats(interfaces[selected].components.interface[puller].formats) as format}
                          <option>{format}</option>
                        {/each}
                      </select>
                    </div>
                    <p class="heading">Timeout</p>
                    <div>
                      <input
                        class="input is-small"
                        type="number"
                        placeholder="600"
                        bind:value={pullers[puller].timeout} />
                    </div>
                    {#if interfaces[selected].components.interface[puller].args}
                      {#each Object.entries(interfaces[selected].components.interface[puller].args) as [arg, info]}
                        <Argument
                          argument={arg}
                          {info}
                          error={pullers[puller].errors[arg]}
                          bind:value={pullers[puller].args[arg]} />
                      {/each}
                    {/if}
                  {:else}
                    <span>No puller selected...</span>
                  {/if}
                </div>
                <div class="level">
                  <div class="level-left" />
                  <div class="level-right">
                    <div class="level-item">
                      <button class="button" disabled={!puller} on:click={pull}>
                        Pull
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column is-paddingless">
                {#if puller}
                  {#if pullers[puller].resp}
                    <Output
                      format={pullers[puller].resp.interface.format}
                      output={pullers[puller].resp.interface.output} />
                  {:else}
                    <div class="is-flex is-high is-wide">
                      <div class="no-content">
                        <span class="mdi mdi-source-pull" />
                        <span>Puller not run...</span>
                      </div>
                    </div>
                  {/if}
                {:else}
                  <div class="is-flex is-high is-wide">
                    <div class="no-content">
                      <span class="mdi mdi-source-pull" />
                      <span>No puller selected...</span>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      {:else}
        <div class="is-flex is-high is-wide">
          <div class="no-content">
            <span class="mdi mdi-scale-balance" />
            <span>No scale selected...</span>
          </div>
        </div>
      {/if}
    </div>
  </nav>
</div>
