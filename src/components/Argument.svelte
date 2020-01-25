<script>
  import { toCaps } from "utils/helpers";

  export let argument;
  export let info;
  export let error;
  export let value = undefined;
</script>

<style>
  .argument {
    width: 100%;
  }
  .argument:not(:last-child) {
    margin-bottom: 1rem;
  }
  .argument select {
    width: 100%;
  }
</style>

<div class="argument">
  <p class="heading">
    {toCaps(argument, { delimiter: '_' })}{info.required ? ' *' : ''}
  </p>
  {#if info.values}
    <div class="select is-small">
      <select class="is-fullwidth" bind:value>
        {#if info.default === null}
          <option hidden={info.required}>none</option>
        {/if}
        {#each info.values as value}
          <option>{value}</option>
        {/each}
      </select>
    </div>
  {:else if argument.type === 'integer'}
    <input
      class="input is-small {error ? 'is-danger' : ''}"
      type="number"
      placeholder={info.default}
      bind:value />
    {#if error}
      <p class="help is-danger">{error}</p>
    {/if}
  {:else if argument.type === 'boolean'}
    <label class="checkbox is-small">
      <input
        type="checkbox"
        checked={value ? value : info.default}
        on:input={event => {
          value = event.target.checked;
        }} />
      True
    </label>
  {:else}
    <input
      class="input is-small {error ? 'is-danger' : ''}"
      type="string"
      placeholder={info.default}
      bind:value />
    {#if error}
      <p class="help is-danger">{error}</p>
    {/if}
  {/if}
</div>
