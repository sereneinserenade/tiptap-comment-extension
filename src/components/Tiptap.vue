<template>
  <div class="p-4 h-full flex flex-row tiptap bg-gray-900 text-white">
    <div class="ml-4 flex flex-col tiptap-container">
      <section class="flex gap-4">
        <button
          @click="toggleCommentMode"
          type="button"
          class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded shadow-lg"
        >{{ isCommentModeOn ? "Comment mode is ON" : "Comment mode OFF" }}</button>
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
        <section class="comment-adder-section flex bg-gray-800 shadow-lg p-3 rounded-md gap-4">
          <section aria-label="textarea-section">
            <textarea
              v-model="commentText"
              @keypress.enter.stop.prevent="() => setComment()"
              cols="30"
              rows="4"
              placeholder="Add new comment..."
              class="bg-gray-600 border-blue-500 outline-none shadow-inner"
            />
          </section>

          <section class="flex flex-row w-full gap-1">
            <button
              class="bg-transparent hover:bg-red-400 text-red-500 font-semibold hover:text-white py-2 px-4 border border-red-400 hover:border-transparent rounded-2xl shadow-sm w-1/3"
              @click="() => commentText = ''"
            >Clear</button>

            <button
              class="bg-transparent hover:bg-blue-400 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-400 hover:border-transparent rounded-2xl shadow-sm w-2/3"
              @click="() => setComment()"
            >
              Add
              <kbd class>(Ent)</kbd>
            </button>
          </section>
        </section>
      </BubbleMenu>
    </div>

    <section class="flex flex-col">
      <OuterCommentVue
        :active-comments-instance="activeCommentsInstance"
        :all-comments="allComments"
        :format-date="formatDate"
        :focus-content="focusContent"
        :is-comment-mode-on="isCommentModeOn"
        @set-comment="setComment"
      />
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
import OuterCommentVue from './OuterComment.vue'
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

  editor.state.doc.descendants((node, pos) => {
    const { marks } = node

    marks.forEach((mark) => {
      if (mark.type.name === 'comment') {
        const markComments = mark.attrs.comment;

        const jsonComments = markComments ? JSON.parse(markComments) : null;

        if (jsonComments !== null) {
          tempComments.push({
            node,
            jsonComments,
            from: pos,
            to: pos + (node.text?.length || 0),
            text: node.text,
          });
        }
      }
    })
  })

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

const getIsCommentModeOn = () => isCommentModeOn.value

const tiptapEditor = useEditor({
  content: `
    <p>I'm trying to make comment extension, so you can add comment here ☮️ and<span data-comment="{&quot;uuid&quot;:&quot;d1858137-e0d8-48ac-9f38-ae778b56c719&quot;,&quot;comments&quot;:[{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1648338852939,&quot;content&quot;:&quot;First comment&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1648338857073,&quot;content&quot;:&quot;Following Comment&quot;}]}"> see how it goes.</span> Add a <span data-comment="{&quot;uuid&quot;:&quot;f57e894f-926c-4242-b0ee-53c719631907&quot;,&quot;comments&quot;:[{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1648338869890,&quot;content&quot;:&quot;second comment&quot;}]}">comment</span> here.</p>
  `,

  extensions: [StarterKit, Comment.configure({ isCommentModeOn: getIsCommentModeOn })],

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

const setComment = (val?: string) => {
  const localVal = val || commentText.value

  if (!localVal.trim().length) return

  const activeCommentInstance: CommentInstance = JSON.parse(JSON.stringify(activeCommentsInstance.value))

  const commentsArray = typeof activeCommentInstance.comments === 'string' ? JSON.parse(activeCommentInstance.comments) : activeCommentInstance.comments

  if (commentsArray) {
    commentsArray.push({
      userName: currentUserName.value,
      time: Date.now(),
      content: localVal,
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
        content: localVal,
      }],
    })

    // eslint-disable-next-line no-unused-expressions
    tiptapEditor.value?.chain().setComment(commentWithUuid).run()
  }

  setTimeout(() => (commentText.value = ''), 50)
}

const toggleCommentMode = () => {
  isCommentModeOn.value = !isCommentModeOn.value
  if (isCommentModeOn.value) tiptapEditor.value?.setEditable(false)
  else tiptapEditor.value?.setEditable(true)
}

const focusContent = ({ from, to }: { from: number, to: number }) => {
  tiptapEditor.value?.chain().setTextSelection({ from, to }).run()
}

onMounted(() => toggleCommentMode())
</script>

<style lang="scss">
.tiptap {
  .tiptap-container {
    min-width: 800px;
  }

  .comment-adder-section {
    display: flex;
    flex-direction: column;
    gap: 4px;

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
