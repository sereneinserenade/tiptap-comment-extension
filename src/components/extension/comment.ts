/* eslint-disable import/no-extraneous-dependencies */

import { Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import CommentComponent from './CommentComponent.vue';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /**
       * @description Set comment for selected text.
       */
      addComment: (comment: string) => ReturnType,
    }
  }
}

// eslint-disable-next-line import/prefer-default-export
export const Comment = Node.create({
  name: 'comment',

  content: 'text*',

  group: 'block',

  addAttributes() {
    return {
      comment: {
        parseHTML: (element) => ({
          comment: element.getAttribute('data-comment'),
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'comment',
        getAttrs: (node) => {
          const comment = (node as HTMLElement).getAttribute('data-comment');
          return comment ? { comment } : false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['comment', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      addComment: (comment: string) => ({ commands }) => commands.setNode('comment', { comment }),
    };
  },

  addNodeView() {
    return VueNodeViewRenderer(CommentComponent as any);
  },
});
