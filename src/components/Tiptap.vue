<template>
  <div class="flex flex-row justify-center tiptap">
    <div class="flex max-w-screen-md flex-col">
      <section>
        <button
          @click="toggleCommentMode"
          type="button"
          class="
              bg-transparent
              hover:bg-blue-500
              text-blue-700
              font-semibold
              hover:text-white
              py-2
              px-4
              border border-blue-500
              hover:border-transparent
              rounded
              shadow-lg
          "
        >
          {{ isCommentModeOn ? "Comment mode ON" : "Comment mode OFF" }}
        </button>
      </section>

      <br />

      <section class="">
        <editor-content :editor="tiptapEditor" />
      </section>

      <BubbleMenu
        v-if="tiptapEditor"
        :tippy-options="{ duration: 100, placement: 'bottom' }"
        :editor="tiptapEditor"
        class="bubble-menu"
        :shouldShow="() => isCommentModeOn"
      >
        <section v-if="showCommentMenu" class="comment-section shadow-lg bg-gray-100 rounded-md">
          <article
            class="comment w-80 border-b-2"
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
            class="comment-input resize-y focus:outline-none rounded-none"
            v-model="commentText"
            placeholder="Add comment..."
            @keypress.enter="setComment"
            ref="textAreaRef"
          />
        </section>

        <section
          v-if="showAddCommentSection && !showCommentMenu"
          class="comment-adder-section bg-white shadow-lg"
        >
          <textarea
            v-model="commentText"
            @keypress.enter.stop.prevent="setComment"
            cols="30"
            rows="4"
            placeholder="Add comment..."
            class="border-none outline-none"
          />

          <section class="flex flex-row w-full gap-1">
            <button
              class="
                bg-transparent
                hover:bg-red-500
                text-red-700
                font-semibold
                hover:text-white
                py-2
                px-4
                border border-red-500
                hover:border-transparent
                rounded
                shadow-lg
                w-1/3
              "
              @click="() => commentText = ''"
            >
              Clear
            </button>

            <button
              class="
                bg-transparent
                hover:bg-blue-500
                text-blue-700
                font-semibold
                hover:text-white
                py-2
                px-4
                border border-blue-500
                hover:border-transparent
                rounded
                shadow-lg
                w-2/3
              "
              @click="setComment"
            >
              Add
            </button>

          </section>

        </section>
      </BubbleMenu>
    </div>

    <section class="docs-like-comments-section">
      <article
        class="comment external-comment"
        v-for="(comment, i) in allComments"
        :key="i + 'external_comment'"
      >
        <article class="">
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
      </article>
      <!-- </article> -->
    </section>
  </div>
</template>

<script setup type="ts">
import { onMounted, ref } from 'vue';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import format from 'date-fns/format';

import { Comment } from './extension/comment';
/* imports over */

const dateTimeFormat = 'dd.MM.yyyy HH:mm';

const formatDate = (d) => (d ? format(new Date(d), dateTimeFormat) : null);

const currentUserName = ref('sereneinserenade');

const commentText = ref('');

const showCommentMenu = ref(false);

// const showComment = ref(false);

const isCommentModeOn = ref(false);

const showAddCommentSection = ref(true);

const activeComments = ref([]);

const allComments = ref([]);

const findCommentsAndStoreValues = () => {
  const proseMirror = document.querySelector('.ProseMirror');

  const comments = proseMirror.querySelectorAll('span[data-comment]');

  const tempComments = [];

  comments.forEach((node) => {
    const nodeComments = node.getAttribute('data-comment');

    const jsonComments = nodeComments ? JSON.parse(nodeComments) : null;

    if (jsonComments !== null) {
      tempComments.push({
        node,
        jsonComments,
      });
    }
  });

  // debugger;

  allComments.value = tempComments;
};

const setCurrentComment = (editor) => {
  const newVal = editor.isActive('comment');

  setTimeout(() => showCommentMenu.value = newVal, 50);

  showAddCommentSection.value = !editor.state.selection.empty;

  if (newVal) activeComments.value = JSON.parse(editor.getAttributes('comment').comment);
  else activeComments.value = [];
};

const tiptapEditor = useEditor({
  content:
    '<p>I\'m trying to make comment <span data-comment="[{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1635693990145,&quot;content&quot;:&quot;Initial Comment&quot;}]">extension</span>, so you can add comment here ☮️ and see how it goes.</p> ',

  extensions: [StarterKit, Comment],

  onUpdate({ editor }) {
    findCommentsAndStoreValues();

    setCurrentComment(editor);
  },

  onSelectionUpdate({ editor }) {
    setCurrentComment(editor);
  },

  editorProps: {
    attributes: {
      spellcheck: 'false',
    },
  },
});

const setComment = () => {
  if (!commentText.value.trim().length) return;

  const comment = JSON.stringify([
    ...activeComments.value,
    {
      userName: currentUserName.value,
      time: Date.now(),
      content: commentText.value,
    },
  ]);

  // eslint-disable-next-line no-unused-expressions
  tiptapEditor.value?.chain().setComment(comment).run();

  setTimeout(() => (commentText.value = ''), 50);
};

const toggleCommentMode = () => {
  isCommentModeOn.value = !isCommentModeOn.value;
  if (isCommentModeOn.value) tiptapEditor.value.setEditable(false);
  else tiptapEditor.value.setEditable(true);
};

onMounted(() => setTimeout(findCommentsAndStoreValues, 100));
</script>

<style lang="scss">
.tiptap {
  .comment-section {
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
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      width: 100%;
    }
  }

  .comment-adder-section {
    display: flex;
    flex-direction: column;
    gap: 4px;
    background: white;

    textarea {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      border-radius: 6px;
      padding: 0.5em;
    }
  }

  .ProseMirror {
    outline: none !important;

    &:focus {
      outline: none !important;
    }

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
