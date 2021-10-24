<template>
  <node-view-wrapper
    class="comment"
    :class="{ show: showContent }"
    spellcheck="false"
    ref="comment"
    contenteditable="false"
  >
    <node-view-content
      @click="openComment"
      class="content"
      contenteditable="false"
    />

    <section class="popup" :class="{ show: isCommentOpen }">
      {{ node.attrs.comment }}

      <button class="close-button" @click="closeComment">
        X
      </button>
    </section>
  </node-view-wrapper>
</template>

<script>
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
    cursor: pointer;
    background: rgba(0, 128, 0, 0.1);
  }

  .popup {
    position: absolute;
    display: none;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
    border-radius: 6px;
    padding: 0.5em;

    &.show {
      display: flex;
    }

    .close-button {
      align-self: flex-end;
    }
  }
}
</style>
