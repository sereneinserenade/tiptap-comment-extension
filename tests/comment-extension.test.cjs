const test = require("node:test");
const assert = require("node:assert/strict");

const { Editor, Mark, Node } = require("@tiptap/core");
const extensionExports = require("../dist/index.cjs.js");

const {
  Comment,
  CommentExtension,
  commentPluginKey,
  getCommentRanges,
} = extensionExports;

const Doc = Node.create({
  name: "doc",
  topNode: true,
  content: "block+",
});

const Paragraph = Node.create({
  name: "paragraph",
  group: "block",
  content: "inline*",
  parseHTML() {
    return [{ tag: "p" }];
  },
  renderHTML() {
    return ["p", 0];
  },
});

const Text = Node.create({
  name: "text",
  group: "inline",
});

const Bold = Mark.create({
  name: "bold",
  parseHTML() {
    return [{ tag: "strong" }];
  },
  renderHTML() {
    return ["strong", 0];
  },
});

function createEditor({
  content = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Hello",
          },
        ],
      },
    ],
  },
  commentOptions = {},
} = {}) {
  return new Editor({
    extensions: [
      Doc,
      Paragraph,
      Text,
      Bold,
      CommentExtension.configure(commentOptions),
    ],
    content,
  });
}

function getCommentTexts(editor) {
  const commentTexts = [];

  editor.state.doc.descendants((node) => {
    const commentMark = node.marks?.find((mark) => mark.type.name === "comment");

    if (!commentMark) {
      return;
    }

    commentTexts.push({
      commentId: commentMark.attrs.commentId,
      text: node.text || "",
    });
  });

  return commentTexts;
}

test("exports a Comment alias and helper surface", () => {
  assert.equal(Comment, CommentExtension);
  assert.equal(typeof commentPluginKey.getState, "function");
  assert.equal(typeof getCommentRanges, "function");
});

test("setComment returns true and inserted text after the mark stays unmarked", () => {
  const editor = createEditor();

  editor.commands.setTextSelection({ from: 1, to: 6 });

  assert.equal(editor.commands.setComment("comment-1"), true);

  editor.commands.setTextSelection(6);
  assert.equal(editor.storage.comment.activeCommentId, null);

  editor.commands.command(({ tr, dispatch }) => {
    tr.insertText("!", 6);
    dispatch?.(tr);
    return true;
  });

  assert.deepEqual(getCommentTexts(editor), [
    {
      commentId: "comment-1",
      text: "Hello",
    },
  ]);

  const paragraph = editor.getJSON().content[0];
  const lastNode = paragraph.content[1];

  assert.equal(lastNode.text, "!");
  assert.equal(lastNode.marks, undefined);

  editor.destroy();
});

test("unsetComment without an id removes the active comment range", () => {
  const editor = createEditor();

  editor.commands.setTextSelection({ from: 1, to: 6 });
  editor.commands.setComment("comment-1");

  editor.commands.setTextSelection(3);

  assert.equal(editor.commands.unsetComment(), true);
  assert.deepEqual(getCommentTexts(editor), []);

  editor.destroy();
});

test("removeComment removes every matching comment range across the document", () => {
  const editor = createEditor({
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "World" }],
        },
      ],
    },
  });

  editor.commands.setTextSelection({ from: 1, to: 6 });
  editor.commands.setComment("shared");
  editor.commands.setTextSelection({ from: 8, to: 13 });
  editor.commands.setComment("shared");

  assert.equal(editor.commands.removeComment("shared"), true);
  assert.deepEqual(getCommentTexts(editor), []);

  editor.destroy();
});

test("getCommentRanges groups adjacent text segments with the same comment id", () => {
  const editor = createEditor({
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "He",
              marks: [{ type: "comment", attrs: { commentId: "comment-1" } }],
            },
            {
              type: "text",
              text: "ll",
              marks: [
                { type: "comment", attrs: { commentId: "comment-1" } },
                { type: "bold" },
              ],
            },
            {
              type: "text",
              text: "o",
            },
          ],
        },
      ],
    },
  });

  assert.deepEqual(getCommentRanges(editor.state.doc), [
    {
      commentId: "comment-1",
      from: 1,
      to: 5,
      text: "Hell",
    },
  ]);

  editor.destroy();
});

test("selectComment focuses the first logical range for a comment id", () => {
  const editor = createEditor({
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "AB",
              marks: [{ type: "comment", attrs: { commentId: "first" } }],
            },
            {
              type: "text",
              text: "CD",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "EF",
              marks: [{ type: "comment", attrs: { commentId: "first" } }],
            },
          ],
        },
      ],
    },
  });

  assert.equal(editor.commands.selectComment("first"), true);
  assert.equal(editor.state.selection.from, 1);
  assert.equal(editor.state.selection.to, 3);

  editor.destroy();
});

test("hoverComment updates plugin and storage state", () => {
  const editor = createEditor();

  editor.commands.setTextSelection({ from: 1, to: 6 });
  editor.commands.setComment("comment-1");

  assert.equal(editor.commands.hoverComment("comment-1"), true);
  assert.equal(editor.storage.comment.hoveredCommentId, "comment-1");

  assert.equal(editor.commands.hoverComment(null), true);
  assert.equal(editor.storage.comment.hoveredCommentId, null);

  editor.destroy();
});

test("selection callbacks receive unique active ids and null-safe active id values", () => {
  const activated = [];
  const selected = [];
  const editor = createEditor({
    content: {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "AB",
              marks: [{ type: "comment", attrs: { commentId: "comment-1" } }],
            },
            {
              type: "text",
              text: "CD",
            },
          ],
        },
      ],
    },
    commentOptions: {
      onCommentActivated: (commentId) => activated.push(commentId),
      onCommentSelectionChange: (commentIds) => selected.push(commentIds),
    },
  });

  editor.commands.setTextSelection(2);
  editor.commands.setTextSelection(4);

  assert.equal(activated.at(-2), "comment-1");
  assert.equal(activated.at(-1), null);
  assert.deepEqual(selected.at(-2), ["comment-1"]);
  assert.deepEqual(selected.at(-1), []);

  editor.destroy();
});
