<script>
  import { fade, slide } from "svelte/transition";
  import { stores } from "@sapper/app";

  export let segment;

  const { page, session } = stores();

  let collapsed = false;
  let routes = [
    {
      name: "Dashboard",
      segment: undefined,
      icon: "mdi-view-dashboard"
    },
    {
      name: "Samples",
      segment: "samples",
      icon: "mdi-file-multiple",
      children: [
        { name: "Details", segment: undefined, icon: "mdi-file" },
        { name: "Notes", segment: "notes", icon: "mdi-book-open" },
        { name: "Analysis", segment: "analysis", icon: "mdi-magnify" },
        { name: "Interfaces", segment: "interfaces", icon: "mdi-access-point" }
      ]
    },
    {
      name: "Scales",
      segment: "scales",
      icon: "mdi-scale-balance"
    }
  ];

  $: segments = $page.path.split("/");

  function collapse() {
    collapsed = !collapsed;
  }
</script>

<style lang="scss">
  .side {
    background: $white-ter;
    display: flex;
    flex: 0;
    position: relative;
  }
  .side > ul {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: auto;
    transition: all 2s;
  }

  .button {
    background: none;
    border: unset;
    box-shadow: none !important;
    outline: none;
  }
  .collapse {
    bottom: 0;
    outline: none;
    position: absolute;
    width: 100%;
  }
  .menu-list > li > ul {
    margin-right: 0;
    padding: 0;
  }
  .route {
    display: flex;
    flex: 0;
    line-height: 1.75rem;
  }
  .route {
    span:not(:last-child) {
      padding-right: 0.5rem;
    }
  }
  .route.sub {
    padding: 0.25rem 0.5rem;
  }
</style>

<aside id="side" class="side">
  <ul class="menu-list">
    {#each routes as route}
      <li>
        <a
          class="route {segment === route.segment && segments.length === 2 ? 'is-active' : ''}"
          href={route.segment ? route.segment : '.'}>
          <span class="mdi {route.icon} is-size-4" />
          {#if !collapsed}
            <span transition:fade={{ duration: 200 }}>{route.name}</span>
          {/if}
        </a>
        <!-- NOTE: Not truly dynamic as we have specific segmentation -->
        {#if route.children && route.segment == segment && segments.length > 2}
          <ul transition:slide={{ duration: 200 }}>
            {#each route.children as child}
              <li>
                <a
                  class="route sub {segments.length > 2 && segments[3] === child.segment ? 'is-active' : ''}"
                  href="samples/{segments[2]}{child.segment ? `/${child.segment}` : ''}">
                  <span class="mdi {child.icon}" />
                  {#if !collapsed}
                    <span transition:fade={{ duration: 200 }}>
                      {child.name}
                    </span>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>
  <button class="button collapse" on:click={collapse}>
    <span
      class="mdi {collapsed === true ? 'mdi-arrow-right' : 'mdi-arrow-left'}" />
  </button>
</aside>
