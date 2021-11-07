<template>
  <div class="tiptap mt-12">
    <BubbleMenu
      v-if="tiptapEditor"
      :tippy-options="{ duration: 100, placement: 'bottom' }"
      :editor="tiptapEditor"
      class="bubble-menu"
    >
      <section v-if="showComment" class="comment-section w-[200px]">
        <article
          class="comment w-80"
          v-for="comment in activeComments"
          :key="`${comment.userName}_${comment.time}`"
        >
          <div class="comment-details">
            <strong>
              {{ comment.userName }}
            </strong>

            <span class="date-time">
              {{ formatDate(comment.time) }}
            </span>
          </div>

          <span class="content">
            {{ comment.content }}
          </span>
        </article>

        <textarea
          type="textarea"
          class="comment-input resize-none border-gray-500"
          v-model="commentText"
          placeholder="Add comment..."
          @keypress.enter="setComment"
          ref="textAreaRef"
        />
      </section>
      <section class="comment-adder-section bg-white " v-else>
        <textarea
          v-model="commentText"
          @keypress.enter.stop.prevent="setComment"
          cols="30"
          rows="10"
          placeholder="Add comment..."
          class="shadow-lg border-none outline-none"
        />

        <button
          class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded shadow-lg"
          @click="setComment"
        >
          add comment
        </button>
      </section>
    </BubbleMenu>

    <editor-content :editor="tiptapEditor" />
  </div>
</template>

<script type="ts" setup>
import { ref } from 'vue';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import format from 'date-fns/format';

import { Comment } from './extension/comment';
/* imports over */

const dateTimeFormat = 'dd.MM.yyyy HH:mm';

const formatDate = (d) => format(new Date(d), dateTimeFormat);

const currentUserName = ref('sereneinserenade');

const commentText = ref('');

const showComment = ref(false);

const activeComments = ref([]);

const setCommentDetails = (editor) => {
  showComment.value = editor.isActive('comment');

  const comment = editor.getAttributes('comment')?.comment;

  // eslint-disable-next-line no-unused-expressions
  showComment.value ? activeComments.value = JSON.parse(comment) : activeComments.value = [];
};

const tiptapEditor = useEditor({
  content: '<p>I\'m trying to make comment <span data-comment="[{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1635693990145,&quot;content&quot;:&quot;Initial Comment&quot;}]">extension</span>, so you can add comment here ☮️ and see how it goes.</p> ',

  extensions: [StarterKit, Comment],

  onUpdate({ editor }) {
    setCommentDetails(editor);
  },

  onSelectionUpdate({ editor }) {
    setCommentDetails(editor);
  },
});

const setComment = () => {
  if (commentText.value.length) {
    // eslint-disable-next-line no-unused-expressions
    tiptapEditor.value
      ?.chain()
      .setComment(JSON.stringify([...activeComments.value, { userName: currentUserName.value, time: Date.now(), content: commentText.value }]))
      .run();
  }

  setTimeout(() => commentText.value = '', 50);
};
</script>

<style lang="scss">
.tiptap {
  height: 100vh;
  display: flex;
  justify-content: center;

  .comment-section {
    background: white;
    box-shadow: 0 0 5px grey;
    border-radius: 6px;

    article.comment {
      padding: 0.5em;
      display: flex;
      flex-direction: column;

      .comment-details {
        display: flex;
        flex-direction: column;
        margin: 0 0 8px 0;
        .date-time {
          font-size: 0.7em;
        }
      }
    }

    textarea {
      padding: 0.5em;
      display: flex;
      border-radius: 6px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
        "Open Sans", "Helvetica Neue", sans-serif;
      width: 100%;
    }
  }

  .comment-adder-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: white;

    textarea {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell,
        "Open Sans", "Helvetica Neue", sans-serif;
      border-radius: 6px;
      padding: 0.5em;
    }
  }

  .ProseMirror {
    outline: none !important;

    span[data-comment] {
      background: rgba(172, 255, 47, 0.5);

      &::after {
        content: " 💬";
        user-select: all;
      }
    }
  }
}
</style>
