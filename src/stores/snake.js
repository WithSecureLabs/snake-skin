import { readable } from 'svelte/store';
import * as snake from 'api/snake';

// FIXME: This will need to become an Object with state...
export const scales = readable({}, set => {
  if (process.browser) {
    snake.getScales().then(async resp => {
      if (resp.status !== "success") {
        console.error(resp);
        set([]);
        return;
      }
      let s = {}
      for (const scale of resp.data.scales) {
        const components = {};
        // TODO: We should add 'populate' to the api...
        if (scale.components.indexOf("commands") !== -1) {
          let c = {};
          await snake.getScaleCommands(scale.name).then(resp => {
            resp.data.commands.forEach(command => {
              c[command.command] = command;
            })
          });
          components["commands"] = c;
        }
        if (scale.components.indexOf("interface") !== -1) {
          let c = {};
          await snake.getScaleInterface(scale.name).then(resp => {
            resp.data.interface.forEach(command => {
              c[command.command] = command;
            })
          });
          components["interface"] = c;
        }
        if (scale.components.indexOf("upload") !== -1) {
          await snake.getScaleUpload(scale.name).then(resp => {
            components["upload"] = resp.data.upload;
          });
        }
        scale.components = components;
        s[scale.name] = scale;
      }
      set(s);
    });
  }
});
