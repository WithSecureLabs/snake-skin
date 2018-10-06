<template>
  <div v-if="item instanceof Array">
    <ul>
      <li v-for="v in item" :key="v">
        <span>-</span><json :item="v" style="margin-left:30px"></json>
      </li>
    </ul>
  </div>
  <table v-else-if="item instanceof Object">
    <tr v-for="(v, k) in item" :key="k">
      <td><b>{{ k }}:</b></td>
      <td><json :item="v" style="margin-left:30px"></json></td>
    </tr>
  </table>
  <span v-else>
    {{ item }}
  </span>
</template>
<script>
export default {
  name: 'json',
  props: ['item'],
};
</script>
<style scoped lang="scss">
</style>
