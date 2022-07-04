<template>
  <section class="outer-comment-container flex flex-col gap-2">
    <article
      v-for="(comment, i) in allComments"
      :key="i + 'external_comment'"
      class="main-comment external-comment-area flex flex-col gap-2 "
      :class="[`${comment.jsonComments.uuid === activeCommentsInstance.uuid ? 'active' : 'cursor-pointer'}`]"
      @click.stop.prevent="focusContent({ from: comment.from, to: comment.to })"
    >
      <article
        v-for="(jsonComment, j) in comment.jsonComments.comments"
        :key="`${j}_${Math.random()}`"
        class="sub-comment"
      >
        <div class="comment-details">
          <strong class="text-md">{{ jsonComment.userName }}</strong>

          <span class="text-sm">{{ formatDate(jsonComment.time) }}</span>
        </div>

        <span class="content">{{ jsonComment.content }}</span>
      </article>

      <section
        v-if="comment.jsonComments.uuid === activeCommentsInstance.uuid"
        class="flex flex-col gap-2"
        :class="[`${comment.jsonComments.uuid === activeCommentsInstance.uuid ? 'border-blue-900' : 'max-h-0 border-blue-300'}`]"
      >
        <i-textarea
          :ref="el => { textareaRefs[comment.jsonComments.uuid] = el }"
          v-model="commentText"
          cols="30"
          rows="3"
          placeholder="Add comment..."
          @keypress.enter.stop.prevent="setComment"
        />

        <section class="flex flex-row gap-2 justify-end">
          <i-button @click="() => (commentText = '')">
            Clear
          </i-button>

          <i-button @click="setComment">
            Add &nbsp; <kbd> ⏎ </kbd>
          </i-button>
        </section>
      </section>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref, watch, computed, } from 'vue'

interface CommentInstance {
  uuid?: string
  comments?: any[]
}

const emit = defineEmits([ 'setComment' ])

interface Props {
  allComments: any[]
  activeCommentsInstance: CommentInstance
  focusContent: ({ from, to }: { from: number, to: number }) => void
  formatDate: (d: any) => string | null
  isCommentModeOn: boolean
}

const props = defineProps<Props>()

const commentText = ref<string>('')

const textareaRefs = ref<Record<string, any>>({})

const activeCommentInstanceUuid = computed(() => props.activeCommentsInstance.uuid)

const setComment = () => {
  emit('setComment', commentText.value)
  commentText.value = ''
}

watch(activeCommentInstanceUuid, (val) => {
  setTimeout(() => {
    if (!val || !props.isCommentModeOn) return

    const activeTextArea: HTMLTextAreaElement = textareaRefs.value[val]

    if (activeTextArea) activeTextArea.focus()
  }, 100)
})
</script>

<style lang="scss">
.outer-comment-container {
  width: 40%;

  .main-comment {
    transition: all 0.1s ease-in-out;
    border: 1px dashed gray;
    padding: 1rem;
    border-radius: 8px;
    backdrop-filter: blur(5px);

    h2 {
      margin-top: 8px;
    }


    &.active {
      transform: translateX(-2rem);
    }

    .comment-details {
      display: flex;
      gap: 4px;

      .text-md {
        align-self: flex-start;
      }

      .text-sm {
        font-size: 12px;
        align-self: flex-end;
      }
    }
  }
}
</style>
