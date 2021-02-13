<script>
  // XXX: This file is still a mess :(
  import { BASE_URL } from "config";
  import { formatTags, sorted, toCaps } from "utils/helpers";
  import { goto } from "@sapper/app";
  import { send } from "api/common";
  import * as snake from "api/snake";
  import { scales } from "../stores/snake";
  import Modal from "./Modal.svelte";
  import Tags from "./Tags.svelte";

  export let active = false;

  const stages = ["submission_type", "submission", "scales", "summary"];

  let commands = {};
  let errors = {};
  let failed = false;
  let stage = 0;
  let uploaded = [];
  let uploading = false;

  let scale_command = undefined;
  let scale_name = undefined;
  let scale_type = undefined;

  // Form Fields
  let archive = false;
  let archive_password = "";
  let args = {};
  let description = "";
  let files = [];
  let sample_type = "file";
  let submission_type = "sample";
  let tags = "";

  $: commandScales = getCommandScales($scales, sample_type);
  $: interfaceScales = getInterfaceScales($scales, sample_type);
  $: uploadScales = getUploadScales($scales, sample_type);

  function addCommand() {
    commands[`${scale_type}${scale_name}${scale_command}`] = {
      type: scale_type,
      name: scale_name,
      command: scale_command
    };
    commands = commands;
  }

  function getCommandScales(scales, sample_type) {
    const valid = {};
    Object.entries(scales).forEach(([k, v]) => {
      if (
        v.supports.includes(sample_type) &&
        Object.keys(v.components).includes("commands")
      ) {
        valid[k] = v;
      }
    });
    return valid;
  }

  function getInterfaceScales(scales, sample_type) {
    const valid = {};
    Object.entries(scales).forEach(([k, v]) => {
      if (
        v.supports.includes(sample_type) &&
        Object.keys(v.components).includes("interface")
      ) {
        let check = false;
        Object.values(v.components["interface"]).forEach(i => {
          if (i.type === "push") {
            check = true;
          }
        });
        if (check) {
          valid[k] = v;
        }
      }
    });
    return valid;
  }

  function getUploadScales(scales, sample_type) {
    const valid = {};
    Object.entries(scales).forEach(([k, v]) => {
      if (
        v.supports.includes(sample_type) &&
        Object.keys(v.components).includes("upload")
      ) {
        valid[k] = v;
      }
    });
    return valid;
  }

  function goToSample() {
    // TODO: Should check if array...
    goto(`samples/${uploaded[0].sha256_digest}`);
    active = false;
  }

  function next() {
    if (stage === 1) {
      errors = {};
      if (submission_type === "sample") {
        if (files.length === 0) {
          errors.sample = true;
          return;
        }
      } else {
        let failed = false;
        Object.entries(
          $scales[submission_type].components["upload"].args
        ).forEach(([k, v]) => {
          // XXX: This is not complete, we should use the argument component...
          if (typeof args[k] === "undefined") {
            if (v.required && !v.default) {
              errors[k] = true;
              failed = true;
            }
            if (v.default) {
              args[k] = v.default;
            }
          }
        });
        if (failed) {
          return;
        }
      }
    }
    if (stage < 3) {
      stage += 1;
    }
  }

  function previous() {
    if (stage > 0) {
      stage -= 1;
    }
  }

  function submit() {
    uploading = true;
    stage = 4;
    let body = {};
    let path = "";
    if (submission_type === "sample") {
      if (files.length > 1) {
        // Samples
        const data = {};
        const form = new FormData();
        for (let i = 0; i < files.length; i++) {
          data[i] = {
            name: files[i].name,
            description: description,
            file_type: sample_type,
            tags: tags
          };
          form.append(i, files[i]);
        }
        form.append("data", JSON.stringify(data));
        body = form;
        path = "upload/files";
      } else {
        // Sample based
        const form = new FormData();
        form.append("file", files[0]);
        form.append("name", files[0].name);
        form.append("tags", tags);
        form.append("description", description);
        form.append("file_type", sample_type);
        if (archive) {
          form.append("extract", archive);
          if (archive_password !== "") {
            form.append("password", archive_password);
          }
        }
        body = form;
        path = `upload/${sample_type}`;
      }
    } else {
      // Scale upload based
      const data = {
        args: args,
        description: description,
        file_type: sample_type,
        tags: tags
      };
      if (archive) {
        data.extract = archive;
        if (password !== "") {
          data.password = password;
        }
      }
      body = JSON.stringify(data);
      path = `scale/${submission_type}/upload`;
    }
    let exists = false;
    const url = `${BASE_URL}/api?_path=${path}`;
    return send({
      method: "POST",
      url,
      raw: body
    })
      .then(res => {
        console.log(res.status);
        // NOTE: 409 will not occur for bulk uploads
        if (res.status === 409) {
          // TODO: Visual indicator...
          exists = true;
        } else if (res.status < 200 || res.status >= 300) {
          return Promise.reject(res);
        }
        return res.json();
      })
      .then(async data => {
        if ("samples" in data.data) {
          uploaded = data.data.samples;
        } else {
          uploaded = [data.data.sample];
        }
        if (!exists) {
          for (let i = 0; i < uploaded.length; i++) {
            const sample = uploaded[i];
            const cmds = [];
            const intfs = [];
            Object.entries(commands).forEach(([k, v]) => {
              if (v.type === "command") {
                cmds.push({
                  scale: v.name,
                  command: v.command,
                  sha256_digests: [sample.sha256_digest],
                  asynchronous: true
                });
              } else if (v.type === "interface") {
                intfs.push(v);
              }
            });
            await snake.postCommands(cmds);
            for (let j = 0; j < intfs.length; j++) {
              const intf = intfs[j];
              await snake.postScaleInterface(
                intf.name,
                "push",
                intf.command,
                sample.sha256_digest
              );
            }
          }
        }
        uploading = false;
        stage = 5;
      })
      .catch(e => {
        console.error(e);
        failed = true;
        uploading = false;
        stage = 5;
      });
  }
</script>

<style lang="scss">
  .stages {
    color: $grey-lighter;
    display: flex;
    height: 100%;
    margin: auto;
    min-height: 0;
    min-width: 0;
    padding: 0 1.5rem;
    span {
      margin: auto 0;
      padding: 0.5rem;
    }
    span.is-active {
      color: $text;
    }
    div {
      margin: auto 0;
      width: 100%;
      hr {
        margin-bottom: 1.2rem;
        width: 100%;
      }
      hr.is-active {
        border-top: 1px solid $text;
      }
    }
  }

  .sample {
    display: flex;
    flex-flow: column;
    > div {
      display: flex;
      margin-bottom: 0.5rem;
      > div:not(:last-child) {
        margin-right: 0.5rem;
      }
    }
    &:not(:last-child) {
      border-bottom: 1px solid $white-ter;
      margin-bottom: 0.75rem;
    }
  }

  .upload-content {
    display: flex;
    flex-grow: 1;
    overflow: auto;
    .column {
      padding: 0;
    }
    .columns {
      margin: 0;
    }
  }
  .upload-header {
    display: flex;
    margin-bottom: 1.5rem;
    white-space: nowrap;
    .title {
      margin-bottom: 0 !important;
    }
  }
  .upload-modal {
    display: flex;
    flex-flow: column;
    height: 40rem;
    min-height: 0;
  }
  .upload-files {
    border: 1px dashed $grey-light;
    border-radius: $radius-large;
    cursor: pointer;
    display: flex;
    flex-flow: column;
    padding: 0.25em;
    margin-bottom: 0.5rem;
    input[type="file"] {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      outline: none;
      cursor: pointer;
    }
    span,
    p {
      margin: auto;
    }
    &:hover {
      border-color: $primary !important;
      background: rgba($primary, 0.05) !important;
    }
    &.is-danger {
      border-color: $danger;
      background: rgba($danger, 0.05);
    }
  }
</style>

<Modal bind:active canClose={!uploading}>
  <div class="upload-modal box">
    <div class="upload-header">
      <h1 class="title">Upload</h1>
      <div class="stages is-wide">
        {#each stages as s, i}
          {#if i > 0}
            <div>
              <hr class={i <= stage ? 'is-active' : ''} />
            </div>
          {/if}
          <span class={i <= stage ? 'is-active' : ''}>
            {toCaps(s, { delimiter: '_' })}
          </span>
        {/each}
      </div>
    </div>
    <div class="upload-content">
      {#if stage === 0}
        <div class="columns is-wide">
          <div class="column control">
            <label class="label">Sample Type</label>
            <div>
              <label class="radio">
                <input
                  type="radio"
                  name="sample_type"
                  bind:group={sample_type}
                  value="file" />
                File (doc, exe, txt, etc...)
              </label>
            </div>
            <div>
              <label class="radio">
                <input
                  type="radio"
                  name="sample_type"
                  bind:group={sample_type}
                  value="memory" />
                Memory (aff4, dmp, mdmp, raw, etc...)
              </label>
            </div>
          </div>
          <div class="column control">
            <label class="label">Submission Type</label>
            <div>
              <label class="radio">
                <input
                  type="radio"
                  name="submission_type"
                  bind:group={submission_type}
                  value="sample" />
                Sample{sample_type === 'file' ? '(s)' : ''}
              </label>
            </div>
            {#each Object.keys(sorted(uploadScales)) as uploadScale}
              <div>
                <label class="radio">
                  <input
                    type="radio"
                    name="submission_type"
                    bind:group={submission_type}
                    value={uploadScale} />
                  {toCaps(uploadScale)}
                </label>
              </div>
            {/each}
          </div>
        </div>
      {:else if stage === 1}
        <div class="columns is-wide">
          <div class="column">
            {#if submission_type === 'sample'}
              <div class="field">
                <div class="upload control">
                  <label class="label">
                    Sample{sample_type === 'file' ? '(s)' : ''}
                  </label>
                  <div class="upload-files {errors.sample ? 'is-danger' : ''}">
                    <span class="mdi mdi-upload is-size-1" />
                    <p>Drop your samples here or click to upload</p>
                    <input
                      class="file-input"
                      type="file"
                      name="sample"
                      multiple={sample_type === 'file'}
                      bind:files />
                  </div>
                  <Tags tags={[...files].map(f => f.name)} />
                </div>
              </div>
            {:else}
              <!-- TODO: Do properly: type, validation... -->
              {#each Object.entries($scales[submission_type].components['upload'].args) as [k, v]}
                <div class="field">
                  <label class="label">{toCaps(k)}</label>
                  <input
                    class="input {errors[k] ? 'is-danger' : ''}"
                    type="text"
                    placeholder={k}
                    bind:value={args[k]} />
                </div>
              {/each}
            {/if}
            <div class="field">
              <label class="label">Archive</label>
              <input type="checkbox" bind:checked={archive} />
              Extract sample on upload
            </div>
            {#if archive}
              <div class="field">
                <label class="label">Archive Password</label>
                <input
                  class="input"
                  type="text"
                  placeholder="Enter password if archive is password protected"
                  bind:value={archive_password} />
              </div>
            {/if}
            <div class="field">
              <label class="label">Tags</label>
              <!-- TODO: Make a tag input component -->
              <input
                class="input"
                type="text"
                placeholder="No tags..."
                bind:value={tags} />
              <Tags formatted tags={formatTags(tags)} />
            </div>
            <div class="field">
              <label class="label">Description</label>
              <textarea
                class="is-wide"
                placeholder="No description..."
                bind:value={description} />
            </div>
          </div>
        </div>
      {:else if stage === 2}
        <div class="columns is-wide">
          <div class="column">
            <div class="columns is-wide">
              <div class="column">
                <div class="field">
                  <label class="label">Type</label>
                  <div class="control">
                    <div class="select is-small">
                      <select
                        bind:value={scale_type}
                        on:change={() => {
                          scale_command = undefined;
                          scale_name = undefined;
                        }}>
                        <option disabled hidden selected>
                          No type selected...
                        </option>
                        {#if Object.keys(commandScales).length > 0}
                          <option>command</option>
                        {/if}
                        {#if Object.keys(interfaceScales).length > 0}
                          <option>interface</option>
                        {/if}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Scale</label>
                  <div class="control">
                    <div class="select is-small">
                      <select
                        bind:value={scale_name}
                        on:change={() => {
                          scale_command = undefined;
                        }}
                        disabled={scale_type === undefined}>
                        <option
                          disabled
                          hidden
                          selected={scale_name === undefined}
                          value={undefined}>
                          No scale selected...
                        </option>
                        {#if scale_type === 'command'}
                          {#each Object.keys(sorted(commandScales)) as s}
                            <option>{s}</option>
                          {/each}
                        {:else if scale_type === 'interface'}
                          {#each Object.keys(sorted(interfaceScales)) as s}
                            <option>{s}</option>
                          {/each}
                        {/if}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label">Command</label>
                  <div class="control">
                    <div class="select is-small">
                      <select
                        bind:value={scale_command}
                        disabled={scale_name === undefined}>
                        <option
                          disabled
                          hidden
                          selected={scale_command === undefined}
                          value={undefined}>
                          No command selected...
                        </option>
                        {#if scale_type === 'command' && scale_name !== undefined}
                          {#each Object.keys(sorted(commandScales[scale_name].components['commands'])) as s}
                            <option>{s}</option>
                          {/each}
                        {:else if scale_type === 'interface' && scale_name !== undefined}
                          {#each Object.entries(sorted(interfaceScales[scale_name].components['interface'])) as [s, v]}
                            {#if v.type === 'push'}
                              <option>{s}</option>
                            {/if}
                          {/each}
                        {/if}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div class="column is-flex is-narrow">
                <div class="control" style="margin-top:auto">
                  <button
                    class="button is-small is-primary"
                    disabled={scale_type === undefined || scale_name === undefined || scale_command === undefined || typeof commands[`${scale_type}${scale_name}${scale_command}`] !== 'undefined'}
                    on:click={addCommand}>
                    Add
                  </button>
                </div>
              </div>
            </div>
            <div>
              <table class="table is-wide">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Scale</th>
                    <th>Command</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {#if Object.keys(commands).length > 0}
                    {#each Object.entries(sorted(commands)) as [k, command]}
                      <tr>
                        <td>{command.type}</td>
                        <td>{command.name}</td>
                        <td>{command.command}</td>
                        <td>
                          <button
                            class="button is-small is-danger"
                            on:click={() => {
                              delete commands[k];
                              commands = commands;
                            }}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    {/each}
                  {:else}
                    <tr>No commands added...</tr>
                  {/if}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      {:else if stage === 3}
        <div class="columns is-wide">
          <div class="column">
            <div class="item">
              <p class="heading is-marginless">Sample Type</p>
              <p>{sample_type}</p>
            </div>
            <div class="item">
              <p class="heading is-marginless">Submission Type</p>
              <p>{submission_type}</p>
            </div>
            {#if submission_type === 'sample'}
              <div class="item">
                <p class="heading is-marginless">Sample(s)</p>
                <Tags tags={[...files].map(f => f.name)} />
              </div>
            {/if}
            <div class="item">
              <p class="heading is-marginless">Archive</p>
              <p>{archive}</p>
            </div>
            {#if archive && archive_password !== ''}
              <div class="item">
                <p class="heading is-marginless">Archive Password</p>
                <p>{archive_password}</p>
              </div>
            {/if}
            <div class="item">
              <p class="heading is-marginless">Description</p>
              <p>{description ? description : 'No description...'}</p>
            </div>
            {#if Object.keys(commands).length > 0}
              <div>
                <p class="heading is-marginless">Commands</p>
                <table class="is-wide">
                  <thead>
                    <tr>
                      <th class="is-size-7">Type</th>
                      <th class="is-size-7">Scale</th>
                      <th class="is-size-7">Command</th>
                    </tr>
                  </thead>
                  <tbody>
                    {#each Object.entries(sorted(commands)) as [k, command]}
                      <tr>
                        <td>{command.type}</td>
                        <td>{command.name}</td>
                        <td>{command.command}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
          </div>
        </div>
      {:else if stage === 4}
        <div class="columns is-wide">
          <div class="is-flex is-high is-wide">
            <div class="no-content">
              <progress class="progress is-primary" max="100">0%</progress>
            </div>
          </div>
        </div>
      {:else if stage === 5}
        <div class="columns is-wide">
          {#if failed}
            <div class="is-flex is-high is-wide">
              <div class="no-content">
                <span class="mdi mdi-alert-circle" />
                <span>Upload failed...</span>
              </div>
            </div>
          {:else}
            <div class="column">
              <p class="subtitle">Samples</p>
              {#each uploaded as sample}
                <div class="sample">
                  <div>
                    <div>
                      <p class="heading">SHA256 Digest</p>
                      <p>
                        <a rel="prefetch" href="samples/{sample.sha256_digest}">
                          {sample.sha256_digest}
                        </a>
                      </p>
                    </div>
                  </div>
                  <div>
                    <div>
                      <p class="heading">Timestamp</p>
                      <p>{sample.timestamp}</p>
                    </div>
                    <div>
                      <p class="heading">Name</p>
                      <p>{sample.name}</p>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}
    </div>
    <div class="level">
      <div class="level-left">
        <div class="control">
          {#if stage < 5}
            <button
              class="button is-text"
              disabled={uploading}
              on:click={() => {
                active = false;
              }}>
              Cancel
            </button>
          {/if}
        </div>
      </div>
      <div class="level-right">
        <div class="field is-grouped">
          {#if stage > 0 && stage < 5}
            <div class="control">
              <button class="button" disabled={uploading} on:click={previous}>
                Previous
              </button>
            </div>
          {/if}
          {#if stage === 5}
            <button
              class="button"
              disabled={uploading}
              on:click={() => {
                active = false;
              }}>
              Close
            </button>
          {:else if stage >= 3}
            <div class="control">
              <button
                class="button is-link"
                disabled={uploading}
                on:click={submit}>
                Submit
              </button>
            </div>
          {:else}
            <div class="control">
              <button
                class="button is-link"
                disabled={uploading}
                on:click={next}>
                Next
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</Modal>
