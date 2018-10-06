<template>
  <div v-if="args" id="arguments" class="arguments">
    <template v-for="(v, k) in args">
      <b-field :label="toCaps(k, {'delimiter': '_'})" :key="k">

        <!-- Dropdown -->
        <b-select v-if="v.values.length > 0"
                  v-model="$props.data[k]"
                  :placeholder="getDefault(v)"
        >
          <option v-if="v.default === null" value="null">None</option>
          <option v-for="value in v.values" :key="value" :value="value">{{ value }}</option>
        </b-select>

        <!-- Checkbox -->
        <b-checkbox v-else-if="(v.type === 'boolean') && ($props.data[k] = v.default)"
                    v-model="$props.data[k]"
        >
          {{ toCaps(k) }}
        </b-checkbox>

        <!-- Number -->
        <b-input v-else-if="v.type === 'integer'"
                 type="number"
                 v-model.number="$props.data[k]"
                 :placeholder="inputPlaceholder(k, v)"
        ></b-input>

        <!-- String -->
        <b-input v-else
                 v-model="$props.data[k]"
                 :placeholder="inputPlaceholder(k, v)"
        ></b-input>

      </b-field>
    </template>
  </div>
</template>

<script>
import { toCaps } from '@/utils/helpers';

export default {
  name: 'Arguments',
  props: {
    arguments: {
      default: () => {},
      type: Object,
    },
    data: {
      default: () => {},
      type: Object,
    },
    timeout: {
      default: () => null,
      type: Number,
    },
  },
  data: () => ({
    args: {},
  }),

  mounted() {
    this.args = this.arguments;
  },

  methods: {
    toCaps,

    getDefault(argument) {
      if (argument.default == null) {
        return 'None';
      }
      return argument.default;
    },

    inputPlaceholder(key, value) {
      const label = this.toCaps(key, { delimiter: '_' });
      const def = this.getDefault(value);
      return `Enter ${label}... (default: ${def})`;
    },
  },

  watch: {
    arguments(value) {
      this.args = value;
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
