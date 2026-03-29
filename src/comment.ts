import { Mark, mergeAttributes } from "@tiptap/core";
import type { Attributes, Range } from "@tiptap/core";
import type { Mark as PMMark, Node as PMNode } from "@tiptap/pm/model";
import { Plugin, PluginKey, TextSelection } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    comment: {
      /**
       * Set a comment (add)
       */
      setComment: (commentId: string) => ReturnType;
      /**
       * Unset a comment from the current selection, or remove all comment
       * ranges for the provided commentId.
       */
      unsetComment: (commentId?: string) => ReturnType;
      /**
       * Remove all comment ranges for the given commentId.
       */
      removeComment: (commentId: string) => ReturnType;
      /**
       * Select the first logical range for the given commentId.
       */
      selectComment: (commentId: string) => ReturnType;
      /**
       * Mark a comment as hovered for decoration-driven UIs.
       */
      hoverComment: (commentId: string | null) => ReturnType;
    };
  }
}

export interface CommentRange extends Range {
  commentId: string;
  text: string;
}

export interface CommentPluginState {
  activeCommentIds: string[];
  hoveredCommentId: string | null;
  decorations: DecorationSet;
}

interface CommentPluginMeta {
  hoveredCommentId: string | null;
}

export interface CommentOptions {
  HTMLAttributes: Attributes;
  activeClass: string;
  hoveredClass: string;
  onCommentActivated: (commentId: string | null) => void;
  onCommentSelectionChange: (commentIds: string[]) => void;
}

export interface CommentStorage {
  activeCommentId: string | null;
  activeCommentIds: string[];
  hoveredCommentId: string | null;
}

export const commentPluginKey = new PluginKey<CommentPluginState>("comment");

function areStringArraysEqual(left: string[], right: string[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function getCommentMark(mark: PMMark, commentId?: string) {
  return (
    mark.type.name === "comment" &&
    (commentId === undefined || mark.attrs.commentId === commentId)
  );
}

export function getCommentRanges(doc: PMNode, commentId?: string): CommentRange[] {
  const commentRanges: CommentRange[] = [];
  let previousRange: CommentRange | null = null;

  doc.descendants((node, pos) => {
    const commentMark = node.marks.find((mark) => getCommentMark(mark, commentId));

    if (!commentMark) {
      previousRange = null;
      return;
    }

    const range = {
      commentId: commentMark.attrs.commentId,
      from: pos,
      to: pos + node.nodeSize,
      text: node.textContent,
    };

    if (
      previousRange &&
      previousRange.commentId === range.commentId &&
      previousRange.to === range.from
    ) {
      previousRange.to = range.to;
      previousRange.text += range.text;
      return;
    }

    commentRanges.push(range);
    previousRange = range;
  });

  return commentRanges;
}

function getSelectionCommentIds(
  doc: PMNode,
  selectionFrom: number,
  selectionTo: number,
  empty: boolean,
  marks: readonly PMMark[],
) {
  if (empty) {
    return [
      ...new Set(
        marks
          .filter((mark) => getCommentMark(mark))
          .map((mark) => mark.attrs.commentId as string),
      ),
    ];
  }

  const commentIds = new Set<string>();

  doc.nodesBetween(selectionFrom, selectionTo, (node) => {
    node.marks.forEach((mark) => {
      if (!getCommentMark(mark)) {
        return;
      }

      commentIds.add(mark.attrs.commentId);
    });
  });

  return [...commentIds];
}

function buildDecorations(
  doc: PMNode,
  activeCommentIds: string[],
  hoveredCommentId: string | null,
  activeClass: string,
  hoveredClass: string,
) {
  if (!activeClass && !hoveredClass) {
    return DecorationSet.empty;
  }

  const decorations = getCommentRanges(doc)
    .map((range) => {
      const classNames = [];

      if (activeClass && activeCommentIds.indexOf(range.commentId) >= 0) {
        classNames.push(activeClass);
      }

      if (hoveredClass && hoveredCommentId === range.commentId) {
        classNames.push(hoveredClass);
      }

      if (!classNames.length) {
        return null;
      }

      return Decoration.inline(range.from, range.to, {
        class: classNames.join(" "),
      });
    })
    .filter(Boolean) as Decoration[];

  return decorations.length ? DecorationSet.create(doc, decorations) : DecorationSet.empty;
}

function createPluginState(
  doc: PMNode,
  activeCommentIds: string[],
  hoveredCommentId: string | null,
  activeClass: string,
  hoveredClass: string,
): CommentPluginState {
  return {
    activeCommentIds,
    hoveredCommentId,
    decorations: buildDecorations(
      doc,
      activeCommentIds,
      hoveredCommentId,
      activeClass,
      hoveredClass,
    ),
  };
}

function removeCommentRanges(tr: any, commentRanges: CommentRange[], mark: PMMark) {
  commentRanges.forEach((range) => {
    tr.removeMark(range.from, range.to, mark);
  });
}

export const CommentExtension = Mark.create<CommentOptions, CommentStorage>({
  name: "comment",

  priority: 1000,

  spanning: true,

  inclusive: false,

  keepOnSplit: false,

  exitable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      activeClass: "is-active-comment",
      hoveredClass: "is-hovered-comment",
      onCommentActivated: () => {},
      onCommentSelectionChange: () => {},
    };
  },

  addAttributes() {
    return {
      commentId: {
        default: null,
        parseHTML: (element) =>
          (element as HTMLSpanElement).getAttribute("data-comment-id"),
        renderHTML: (attributes) => {
          if (!attributes.commentId) {
            return {};
          }

          return { "data-comment-id": attributes.commentId };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-comment-id]",
        getAttrs: (element) =>
          !!(element as HTMLSpanElement).getAttribute("data-comment-id")?.trim() &&
          null,
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ];
  },

  addStorage() {
    return {
      activeCommentId: null,
      activeCommentIds: [],
      hoveredCommentId: null,
    };
  },

  onCreate() {
    const pluginState = commentPluginKey.getState(this.editor.state);
    const activeCommentIds = getSelectionCommentIds(
      this.editor.state.doc,
      this.editor.state.selection.from,
      this.editor.state.selection.to,
      this.editor.state.selection.empty,
      this.editor.state.selection.$from.marks(),
    );

    this.storage.activeCommentIds = activeCommentIds;
    this.storage.activeCommentId = activeCommentIds[0] || null;
    this.storage.hoveredCommentId = pluginState?.hoveredCommentId || null;
  },

  onTransaction({ transaction }) {
    const activeCommentIds = getSelectionCommentIds(
      this.editor.state.doc,
      this.editor.state.selection.from,
      this.editor.state.selection.to,
      this.editor.state.selection.empty,
      this.editor.state.selection.$from.marks(),
    );
    const activeCommentId = activeCommentIds[0] || null;
    const hoveredCommentId =
      (transaction.getMeta(commentPluginKey) as CommentPluginMeta | undefined)
        ?.hoveredCommentId ??
      commentPluginKey.getState(this.editor.state)?.hoveredCommentId ??
      null;
    const shouldNotifyActiveId =
      this.storage.activeCommentId !== activeCommentId;
    const shouldNotifySelectionIds = !areStringArraysEqual(
      this.storage.activeCommentIds,
      activeCommentIds,
    );

    this.storage.activeCommentId = activeCommentId;
    this.storage.activeCommentIds = activeCommentIds;
    this.storage.hoveredCommentId = hoveredCommentId;

    if (shouldNotifyActiveId) {
      this.options.onCommentActivated(activeCommentId);
    }

    if (shouldNotifySelectionIds) {
      this.options.onCommentSelectionChange(activeCommentIds);
    }
  },

  addCommands() {
    return {
      setComment:
        (commentId) =>
        ({ state, dispatch }) => {
          if (!commentId || state.selection.empty) {
            return false;
          }

          const tr = state.tr;

          tr.addMark(
            state.selection.from,
            state.selection.to,
            this.type.create({ commentId }),
          );
          tr.removeStoredMark(this.type);

          dispatch?.(tr);

          return true;
        },

      unsetComment:
        (commentId) =>
        ({ state, dispatch }) => {
          const tr = state.tr;

          if (commentId) {
            removeCommentRanges(
              tr,
              getCommentRanges(tr.doc, commentId),
              this.type.create({ commentId }),
            );
            dispatch?.(tr);
            return true;
          }

          if (!state.selection.empty) {
            tr.removeMark(state.selection.from, state.selection.to, this.type);
            dispatch?.(tr);
            return true;
          }

          const activeCommentId = getSelectionCommentIds(
            state.doc,
            state.selection.from,
            state.selection.to,
            state.selection.empty,
            state.selection.$from.marks(),
          )[0];

          if (!activeCommentId) {
            return false;
          }

          const activeRange = getCommentRanges(state.doc, activeCommentId).find(
            (range) =>
              state.selection.from >= range.from &&
              state.selection.from <= range.to,
          );

          if (!activeRange) {
            return false;
          }

          tr.removeMark(
            activeRange.from,
            activeRange.to,
            this.type.create({ commentId: activeCommentId }),
          );
          dispatch?.(tr);

          return true;
        },

      removeComment:
        (commentId) =>
        ({ state, dispatch }) => {
          if (!commentId) {
            return false;
          }

          const tr = state.tr;

          removeCommentRanges(
            tr,
            getCommentRanges(tr.doc, commentId),
            this.type.create({ commentId }),
          );
          dispatch?.(tr);

          return true;
        },

      selectComment:
        (commentId) =>
        ({ state, dispatch }) => {
          if (!commentId) {
            return false;
          }

          const commentRange = getCommentRanges(state.doc, commentId)[0];

          if (!commentRange) {
            return false;
          }

          const tr = state.tr.setSelection(
            TextSelection.create(state.doc, commentRange.from, commentRange.to),
          );

          dispatch?.(tr);

          return true;
        },

      hoverComment:
        (commentId) =>
        ({ state, dispatch }) => {
          const tr = state.tr;

          tr.setMeta(commentPluginKey, {
            hoveredCommentId: commentId,
          } satisfies CommentPluginMeta);
          tr.setMeta("addToHistory", false);

          dispatch?.(tr);
          this.storage.hoveredCommentId = commentId;

          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const activeClass = this.options.activeClass;
    const hoveredClass = this.options.hoveredClass;

    return [
      new Plugin<CommentPluginState>({
        key: commentPluginKey,
        state: {
          init: (_, state) =>
            createPluginState(
              state.doc,
              getSelectionCommentIds(
                state.doc,
                state.selection.from,
                state.selection.to,
                state.selection.empty,
                state.selection.$from.marks(),
              ),
              null,
              activeClass,
              hoveredClass,
            ),
          apply: (tr, pluginState, _oldState, newState) => {
            const meta = tr.getMeta(commentPluginKey) as CommentPluginMeta | undefined;

            return createPluginState(
              newState.doc,
              getSelectionCommentIds(
                newState.doc,
                newState.selection.from,
                newState.selection.to,
                newState.selection.empty,
                newState.selection.$from.marks(),
              ),
              meta?.hoveredCommentId ?? pluginState.hoveredCommentId,
              activeClass,
              hoveredClass,
            );
          },
        },
        props: {
          decorations: (state) => commentPluginKey.getState(state)?.decorations,
        },
      }),
    ];
  },
});

export const Comment = CommentExtension;
