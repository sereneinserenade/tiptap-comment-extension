<template>
  <node-view-wrapper
    class="comment"
    :class="{ show: isCommentOpen }"
    spellcheck="false"
    ref="commentj"
    contenteditable="false"
  >
    <node-view-content
      @click="openComment"
      class="content"
      contenteditable="false"
    />

    <section class="popup" :class="{ show: isCommentOpen }">
      {{ node ? node.attrs.comment : '' }}

      <button class="close-button" @click="closeComment">
        X
      </button>
    </section>
  </node-view-wrapper>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue';
import { NodeViewWrapper, nodeViewProps, NodeViewContent } from '@tiptap/vue-3';

export default defineComponent({
  components: {
    NodeViewWrapper,
    NodeViewContent,
  },

  name: 'CommentComponent',

  props: nodeViewProps,

  setup() {
    const isCommentOpen = ref(false);

    const closeComment = () => (isCommentOpen.value = false);

    const openComment = () => (isCommentOpen.value = true);

    return { isCommentOpen, closeComment, openComment };
  },
});
</script>

<style lang="scss">
.comment {
  .content {
    display: inline;
    cursor: pointer;
    background: rgba(0, 128, 0, 0.1);
  }

  .popup {
    position: absolute;
    display: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    padding: 0.5em;
    z-index: 1000;
    background: white;

    &.show {
      display: flex;
    }

    .close-button {
      align-self: flex-end;
    }
  }
}
</style>
