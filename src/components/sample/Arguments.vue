<template>
  <div v-if="args" id="arguments" class="arguments">
    <template v-for="(v, k) in args">
      <b-field :label="label(k, v)"
               :key="k"
               :type="getType(inv, k)"
      >
        <!-- Dropdown -->
        <b-select v-if="v.values && v.values.length > 0"
                  v-model="$props.data[k]"
                  :placeholder="getDefault(v)"
        >
          <option v-if="v.default === null" value="null">None</option>
          <option v-for="value in v.values" :key="value" :value="value">{{ value }}</option>
        </b-select>

        <!-- Checkbox -->
        <b-checkbox v-else-if="v.type === 'boolean'"
                    :value="getValue('boolean', k, v)"
                    @input="setValue('boolean', k, $event)"
        >
          {{ toCaps(k) }}
        </b-checkbox>

        <!-- Number -->
        <b-input v-else-if="v.type === 'integer'"
                 type="number"
                 :placeholder="inputPlaceholder(k, v)"
                 :value="$props.data[k]"
                 @input="setValue('number', k, $event)"
        ></b-input>

        <!-- String -->
        <b-input v-else
                 :placeholder="inputPlaceholder(k, v)"
                 :value="$props.data[k]"
                 @input="setValue('string', k, $event)"
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
    invalid: {
      default: () => [],
      type: Array,
    },
  },
  data: () => ({
    args: {},
    inv: [],
  }),

  mounted() {
    this.args = this.arguments;
    this.inv = this.invalid;
  },

  methods: {
    toCaps,

    getDefault(argument) {
      if (argument.default == null) {
        return 'None';
      }
      return `${argument.default}`;
    },

    inputPlaceholder(key, value) {
      const label = this.toCaps(key, { delimiter: '_' });
      const def = this.getDefault(value);
      return `Enter ${label}... (default: ${def})`;
    },

    label(k, v) {
      const label = toCaps(k, { delimiter: '_' });
      if (v.required) {
        return `${label}*`;
      }
      return label;
    },

    getType(inv, key) {
      if (inv.indexOf(key) !== -1) {
        return 'is-danger';
      }
      return '';
    },

    getValue(type, key, value) {
      if (type === 'boolean') {
        if (typeof this.data[key] === 'undefined') {
          return value.default;
        }
      }
      return this.data[key];
    },

    setValue(type, key, value) {
      if (this.invalid) {
        const index = this.invalid.indexOf(key);
        this.$delete(this.inv, index);
      }
      if (value === null || value === '') {
        // NOTE: If null just delete the key
        if (typeof this.data[key] !== 'undefined') {
          delete this.data[key];
        }
      } else if (type === 'number') {
        this.data[key] = parseInt(value, 10);
      } else {
        this.data[key] = value;
      }
    },
  },

  watch: {
    arguments(value) {
      this.args = value;
    },
    invalid(value) {
      if (value) {
        this.inv = value;
      }
    },
  },
};
</script>

<style lang="scss" scoped>

</style>
