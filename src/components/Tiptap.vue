<template>
  <div class="m-4 flex flex-row tiptap">
    <div class="ml-4 flex flex-col tiptap-container">
      <section>
        <button
          @click="toggleCommentMode"
          type="button"
          class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded shadow-lg"
        >{{ isCommentModeOn ? "Comment mode ON" : "Comment mode OFF" }}</button>
        <button
          @click="log(tiptapEditor.getHTML())"
          type="button"
          class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded shadow-lg"
        >HTML to Console</button>
      </section>

      <section class="mt-6">
        <editor-content :editor="tiptapEditor" />
      </section>

      <BubbleMenu
        v-if="tiptapEditor && isCommentModeOn"
        :tippy-options="{ duration: 100, placement: 'bottom' }"
        :editor="tiptapEditor"
        class="bubble-menu"
        :shouldShow="() => (isCommentModeOn && isTextSelected && !activeCommentsInstance.uuid)"
      >
        <section class="comment-adder-section bg-white shadow-lg">
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
              class="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded shadow-lg w-1/3"
              @click="() => (commentText = '')"
            >Clear</button>

            <button
              class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded shadow-lg w-2/3"
              @click="setComment"
            >Add</button>
          </section>
        </section>
      </BubbleMenu>
    </div>

    <section class="flex flex-col">
      <article
        class="comment external-comment shadow-lg my-2 bg-gray-100 transition-all rounded-md overflow-hidden"
        v-for="(comment, i) in allComments"
        :key="i + 'external_comment'"
        :class="[`${comment.jsonComments.uuid === activeCommentsInstance.uuid ? 'ml-4' : 'ml-8'}`]"
      >
        <article
          v-for="(jsonComment, j) in comment.jsonComments.comments"
          :key="`${j}_${Math.random()}`"
          class="external-comment border-b-2 border-gray-200 p-3"
        >
          <div class="comment-details">
            <strong>{{ jsonComment.userName }}</strong>

            <span class="ml-1 date-time text-xs">{{ formatDate(jsonComment.time) }}</span>
          </div>

          <span class="content">{{ jsonComment.content }}</span>
        </article>

        <section
          v-if="comment.jsonComments.uuid === activeCommentsInstance.uuid"
          class="flex flex-col w-full gap-1"
        >
          <textarea
            v-model="commentText"
            @keypress.enter.stop.prevent="setComment"
            cols="30"
            rows="3"
            placeholder="Add comment..."
            class="p-3 border-none outline-none"
          />

          <section class="flex flex-row w-full gap-1">
            <button
              class="bg-transparent hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-lg shadow-lg w-1/3"
              @click="() => (commentText = '')"
            >Clear</button>

            <button
              class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-lg shadow-lg w-2/3"
              @click="setComment"
            >
              Add (
              <kbd class>Ent</kbd>)
            </button>
          </section>
        </section>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable import/no-extraneous-dependencies */
import { onMounted, ref } from 'vue'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/vue-3'
import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import format from 'date-fns/format'
import { v4 as uuidv4 } from 'uuid'

import { Comment } from './extension/comment'
/* imports over */

const dateTimeFormat = 'dd.MM.yyyy HH:mm'

const formatDate = (d: any) => (d ? format(new Date(d), dateTimeFormat) : null)

const currentUserName = ref('sereneinserenade')

const commentText = ref('')

const showCommentMenu = ref(false)

const isCommentModeOn = ref(false)

const isTextSelected = ref(false)

const showAddCommentSection = ref(true)

interface CommentInstance {
  uuid?: string
  comments?: any[]
}

const activeCommentsInstance = ref<CommentInstance>({})

const allComments = ref<any[]>([])

const findCommentsAndStoreValues = (editor: Editor) => {
  const tempComments: any[] = []

  const { doc } = editor.state

  doc.descendants((node, pos) => {
    debugger

    const { marks } = node

    marks.forEach((mark) => {
      if (mark.type.name === 'comment') {
        const markComments = mark.attrs.comment;

        const jsonComments = markComments ? JSON.parse(markComments) : null;

        if (jsonComments !== null) {
          tempComments.push({
            node,
            jsonComments,
            pos,
          });
        }
      }
    })
  })

  if (!tempComments.length) {
    allComments.value = []
    return
  }

  allComments.value = tempComments
}

const { log } = console

const setCurrentComment = (editor: Editor) => {
  const newVal = editor.isActive('comment')

  if (newVal) {
    setTimeout(() => (showCommentMenu.value = newVal), 50)

    showAddCommentSection.value = !editor.state.selection.empty

    const parsedComment = JSON.parse(editor.getAttributes('comment').comment)

    parsedComment.comment = typeof parsedComment.comments === 'string' ? JSON.parse(parsedComment.comments) : parsedComment.comments

    activeCommentsInstance.value = parsedComment
  } else {
    activeCommentsInstance.value = {}
  }
}

const tiptapEditor = useEditor({
  content: '<p>I\'m trying to make comment extension, so you<span data-comment="{&quot;uuid&quot;:&quot;cc3d6027-4500-484e-a26a-146371c210ff&quot;,&quot;comments&quot;:[{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256036089,&quot;content&quot;:&quot;Talking with myself&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256052643,&quot;content&quot;:&quot;Actually no, I am making a video/demo for you guys&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256065012,&quot;content&quot;:&quot;And there you go&quot;}]}"> can add comm</span>ent here ☮️ and see how it goes. Add a comment <span data-comment="{&quot;uuid&quot;:&quot;a077d444-2c4d-4ccf-958b-8f3fcc33dd27&quot;,&quot;comments&quot;:[{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256014964,&quot;content&quot;:&quot;A new world of comments&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256023904,&quot;content&quot;:&quot;Ah, so the last of us 2 is out&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256027778,&quot;content&quot;:&quot;Yes, it is&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1639256059546,&quot;content&quot;:&quot;Ah some more&quot;}]}">HERE.</span></p>',

  extensions: [StarterKit, Comment],

  onUpdate({ editor }) {
    findCommentsAndStoreValues(editor)

    setCurrentComment(editor)
  },

  onSelectionUpdate({ editor }) {
    setCurrentComment(editor)

    isTextSelected.value = !!editor.state.selection.content().size
  },

  onCreate({ editor }) {
    findCommentsAndStoreValues(editor)
  },

  editorProps: {
    attributes: {
      spellcheck: 'false',
    },
  },
})

const setComment = () => {
  if (!commentText.value.trim().length) return

  const activeCommentInstance: CommentInstance = JSON.parse(JSON.stringify(activeCommentsInstance.value))

  const commentsArray = typeof activeCommentInstance.comments === 'string' ? JSON.parse(activeCommentInstance.comments) : activeCommentInstance.comments

  if (commentsArray) {
    commentsArray.push({
      userName: currentUserName.value,
      time: Date.now(),
      content: commentText.value,
    })

    const commentWithUuid = JSON.stringify({
      uuid: activeCommentsInstance.value.uuid || uuidv4(),
      comments: commentsArray,
    })

    // eslint-disable-next-line no-unused-expressions
    tiptapEditor.value?.chain().setComment(commentWithUuid).run()
  } else {
    const commentWithUuid = JSON.stringify({
      uuid: uuidv4(),
      comments: [{
        userName: currentUserName.value,
        time: Date.now(),
        content: commentText.value,
      }],
    })

    // eslint-disable-next-line no-unused-expressions
    tiptapEditor.value?.chain().setComment(commentWithUuid).run()
  }

  setTimeout(() => (commentText.value = ''), 50)
}

const toggleCommentMode = () => {
  isCommentModeOn.value = !isCommentModeOn.value
  if (isCommentModeOn.value) tiptapEditor.value.setEditable(false)
  else tiptapEditor.value.setEditable(true)
}
</script>

<style lang="scss">
.tiptap {
  .tiptap-container {
    min-width: 800px;
  }

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

  .external-comment {
    width: 400px;
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
