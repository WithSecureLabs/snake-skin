<template>
  <div id="tags" class="tags">
    <template v-for="tag in formatted_tags">
      <span class="tag" :class="tag.class" :key="tag.name">{{ tag.name }}</span>
    </template>
  </div>
</template>

<script>
import { TAGS } from '@/settings';

export default {
  name: 'Tags',
  props: {
    tags: {
      default: () => '',
      type: String,
    },
  },

  computed: {
    formatted_tags() {
      const tags = this.tags.trimLeft().split(',');
      const formattedTags = [];
      tags.forEach((tag) => {
        if (tag === '') {
          return;
        }
        formattedTags.push(this.styleTag(tag.trimLeft()));
      });
      return formattedTags;
    },
  },

  methods: {
    styleTag(tag) {
      let tagName;
      let tagStyle;
      TAGS.delimiters.some((delim) => {
        const parts = tag.split(delim);
        if (parts.length === 2) {
          [tagStyle, tagName] = parts;
          return true;
        }
        return false;
      });
      if (typeof tagStyle !== 'undefined') {
        TAGS.types.some((type) => {
          if (type.keyword === tagStyle.toLowerCase()) {
            tagStyle = type.style;
            return true;
          }
          return false;
        });
      }
      // NOTE: Do not split the style and name
      // if (typeof tagName === 'undefined') {
      tagName = tag;
      // }
      if (typeof tagStyle === 'undefined') {
        tagStyle = 'is-primary';
      }
      return {
        class: tagStyle,
        name: tagName,
      };
    },
  },
};
</script>
