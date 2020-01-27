<script>
  import dompurify from 'dompurify';
  import hljs from 'highlight.js';
  import marked from 'marked';

  export let format = undefined;
  export let output;

  const renderer = new marked.Renderer();
  renderer.code = (code, language) => {
    const validLang = !!(language && hljs.getLanguage(language));
    const highlighted = validLang ? hljs.highlight(language, code).value : code;
    return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
  };
  renderer.heading = function (text, level) {
    let c = '';
    if (level === 1) { c = 'title' };
    if (level === 2) { c = 'subtitle' };
    return `<h${level} class='${c}'>${text}</h${level}>`;
  };
  renderer.table = (header, body) => {
    return `<table class="table" style="width:100%"><thead>${header}</thead><tbody>${body}</tbody></table>`;
  };
  marked.setOptions({
    breaks: true,
    renderer,
    xhtml: true,
  });

  // TODO: Use a component so we can do colours and things
  function prettyJson(output) {
    const json = JSON.stringify(output)
    let pretty = "";
    let indent_level = 0;
    let open = false;
    let b_count = 0;
    for (let i = 0; i < json.length; i++) {
      let char = json.charAt(i);
      if (!open && char === '"' && b_count % 2 === 0) {
        open = true;
      } else if (open && char === '"' && b_count % 2 === 0) {
        open = false;
      }
      if (!open) {
        if (["}", "]"].indexOf(char) !== -1) {
          pretty += "\n";
          indent_level -= 1;
          pretty += "  ".repeat(indent_level);
        }
      }
      pretty += char;
      if (!open) {
        if (["{", "["].indexOf(char) !== -1) {
          pretty += "\n";
          indent_level += 1;
          pretty += "  ".repeat(indent_level);
        }
        if ([","].indexOf(char) !== -1) {
          pretty += "\n";
          pretty += "  ".repeat(indent_level);
        }
      }
      if (char === '\\') {
        b_count += 1;
      } else {
        b_count = 0;
      }
    }
    return pretty;
  }
</script>

<style>
  pre {
    background: unset;
    padding: 0;
  }
  .output {
    height: 100%;
    overflow: auto;
    width: 100%;
  }
  .output-inner {
    padding: 0.75rem;
  }
</style>

<div class="output">
  <div class="output-inner">
    {#if !output}
      <pre>No output...</pre>
    {:else if format === 'json'}
      <pre>{prettyJson(output)}</pre>
    {:else if format === 'markdown'}
      <div class="markdown">
        {@html dompurify.sanitize(marked(output))}
      </div>
    {:else}
      <pre>{output}</pre>
    {/if}
  </div>
</div>
