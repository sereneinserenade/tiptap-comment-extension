<template>
  <div class="tiptap flex container my-2 gap-2">
    <section class="editor-container flex flex-col">
      <section class="flex gap-2">
        <i-button @click="toggleCommentMode" type="button" class="">
          {{ isCommentModeOn ? "Comment mode is ON " : "Comment mode is OFF " }} &nbsp;
          <icon-mdi-comment v-if="isCommentModeOn" /> 
          <icon-mdi-comment-off v-else />
        </i-button>
        <i-button @click="log(tiptapEditor?.getHTML())" type="button" class="">
          HTML to Console
        </i-button>
      </section>

      <section class="mt-6">
        <editor-content :editor="tiptapEditor" />
      </section>

      <BubbleMenu v-if="tiptapEditor" :tippy-options="{ duration: 100, placement: 'bottom' }"
        :editor="tiptapEditor" :shouldShow="({ editor }) => (isCommentModeOn && !editor.state.selection.empty && !activeCommentsInstance.uuid)"
        class="bubble-menu flex flex-col gap-2">
        <i-textarea v-model="commentText" @keypress.enter.stop.prevent="() => setComment()" cols="30" rows="4"
          placeholder="Add new comment..." />

        <section class="flex justify-end gap-2">
          <i-button @click="() => commentText = ''">Clear</i-button>

          <i-button @click="() => setComment()">
            Add &nbsp; <kbd> Ent </kbd>
          </i-button>
        </section>
      </BubbleMenu>
    </section>

    <OuterCommentVue :active-comments-instance="activeCommentsInstance" :all-comments="allComments"
      :format-date="formatDate" :focus-content="focusContent" :is-comment-mode-on="isCommentModeOn"
      @set-comment="setComment" />
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
    <p>I'm trying to make <span data-comment="{&quot;uuid&quot;:&quot;0b8803d1-5f95-4c08-abb8-265e79e2bb9e&quot;,&quot;comments&quot;:[{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1654988104420,&quot;content&quot;:&quot;Adding a new comment&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1654988113766,&quot;content&quot;:&quot;Adding a new sub-comment&quot;},{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1654988130484,&quot;content&quot;:&quot;so that's how it works!&quot;}]}">comment extension</span>, so you can <span data-comment="{&quot;uuid&quot;:&quot;2f185c7e-e5e5-45d1-9748-3007bb3db928&quot;,&quot;comments&quot;:[{&quot;userName&quot;:&quot;sereneinserenade&quot;,&quot;time&quot;:1654988119128,&quot;content&quot;:&quot;new comment&quot;}]}">add comment</span> here ☮️ and see how it goes. Add a comment here.</p>
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
  .editor-container {
    width: 60%;
    border: 1px dashed gray;
    padding: 1rem;
    border-radius: 8px;
  }

  .bubble-menu {
    border: 1px dashed gray;
    backdrop-filter: blur(2rem);
    padding: 1rem;
    border-radius: 8px;
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
