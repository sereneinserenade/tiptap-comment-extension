<template>
  <div class="tiptap">
    <div class="menubar">
      <button @click="addComment">
        Add comment
      </button>
      <input @keypress.enter="addComment" type="textarea" v-model="commentText" />
    </div>
    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { ref } from 'vue';

import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import { Comment } from './extension/comment';

export default {
  components: {
    EditorContent,
  },

  setup() {
    const editor = useEditor({
      content: "<p> I'm running Tiptap with Vue.js. 🎉</p>",
      extensions: [StarterKit, Comment],
    });

    const commentText = ref('Initial Comment');

    const addComment = () => (commentText.value.length
      ? editor.value
        ?.chain()
        .addComment(commentText.value)
        .focus()
        .run()
      : false);

    return { editor, commentText, addComment };
  },
};
</script>

<style lang="scss">
.tiptap {
  height: 100vh;

  .ProseMirror {
    outline: none !important;
  }
}
</style>
