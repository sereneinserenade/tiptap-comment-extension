<template>
  <article
    class="comment external-comment-area my-2 transition-all rounded-md overflow-hidden"
    v-for="(comment, i) in allComments"
    :key="i + 'external_comment'"
    :class="[`${comment.jsonComments.uuid === activeCommentsInstance.uuid ? 'ml-4' : 'ml-8 cursor-pointer'}`]"
    @click.stop.prevent="focusContent({ from: comment.from, to: comment.to })"
  >
    <article class="text-lg font-bold p-3 border-b-2 border-solid">"{{ comment.text }}" 💬</article>

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

    <!-- v-if="comment.jsonComments.uuid === activeCommentsInstance.uuid" -->
    <section
      class="flex flex-col w-full gap-1 transition-all"
      :class="[`${comment.jsonComments.uuid === activeCommentsInstance.uuid ? 'border-blue-900' : 'max-h-0 border-blue-300'}`]"
    >
      <textarea
        v-model="commentText"
        @keypress.enter.stop.prevent="setComment"
        cols="30"
        rows="3"
        placeholder="Add comment..."
        class="p-3 m-3 bg-gray-600 shadow-inner outline-none rounded-md"
        :ref="el => { textareaRefs[comment.jsonComments.uuid] = el }"
      />

      <section class="flex flex-row gap-1 m-3">
        <button
          class="bg-transparent hover:bg-red-400 text-red-600 font-semibold hover:text-white py-2 px-4 border-2 border-red-400 hover:border-transparent rounded-2xl shadow-lg w-1/3"
          @click="() => (commentText = '')"
        >Clear</button>

        <button
          class="bg-transparent hover:bg-blue-400 text-blue-600 font-semibold hover:text-white py-2 px-4 border-2 border-blue-400 hover:border-transparent rounded-2xl shadow-lg w-2/3"
          @click="setComment"
        >
          Add
          <kbd class>(Ent)</kbd>
        </button>
      </section>
    </section>
  </article>
</template>

<script setup lang="ts">
import {
  defineProps, ref, defineEmits, watch, computed,
} from 'vue'

interface CommentInstance {
  uuid?: string
  comments?: any[]
}

const emit = defineEmits(['setComment'])

interface Props {
  allComments: any[]
  activeCommentsInstance: CommentInstance
  focusContent: ({ from, to }: { from: number, to: number }) => void
  formatDate: (d: any) => string | null
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
    if (!val) return

    const activeTextArea: HTMLTextAreaElement = textareaRefs.value[val]

    if (activeTextArea) activeTextArea.focus()
  }, 100);
})
</script>

<style lang="scss">
.external-comment-area {
  width: 400px;
  box-shadow: 0 0 0 1px rgba($color: white, $alpha: 0.2);

  .external-comment:last-of-type {
    border: none;
  }
}
</style>
