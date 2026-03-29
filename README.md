# Tiptap Comment Extension:

<p align="center">
  <img src="assets/logo.svg" width="200"/>
  
  ![GitHub Sponsors](https://img.shields.io/github/sponsors/sereneinserenade?color=%23bf3989&label=Sponsor%20Me&style=for-the-badge)
  ![GitHub Repo stars](https://img.shields.io/github/stars/sereneinserenade/tiptap-comment-extension?label=Star%20the%20Repo&style=for-the-badge)
  DM Me on Discord - sereneinserenade#4869
</p>

[Tiptap Extension](https://tiptap.dev/guide/custom-extensions) for having Google-Docs like pro-commenting in Tiptap.

Supports both TipTap 2 and TipTap 3.

A ⭐️ to the repo if you 👍 / ❤️ what I'm doing would be much appreciated. If you're using this extension and making money from it, it'd be very kind of you to **[❤️ Sponsor me](https://github.com/sponsors/sereneinserenade)**. If you're looking for a **dev to work you on your project's Rich Text Editor** with or as **a frontend developer**, [DM me on Discord/Twitter/LinkedIn](https://github.com/sereneinserenade)👨‍💻🤩.

I've made a bunch of extensions for Tiptap 2, some of them are **Resiable Images And Videos**, **Search and Replace**, **LanguageTool integration** with tiptap. You can check it our here <https://github.com/sereneinserenade#a-glance-of-my-projects>.

## Demo:

Try live demo: https://sereneinserenade.github.io/tiptap-comment-extension/

https://github.com/sereneinserenade/tiptap-comment-extension/assets/45892659/5d66b6b7-7de0-4cc4-bfe4-0ec00d34aa4a

## How to use

```bash
npm i @sereneinserenade/tiptap-comment-extension
```

```ts
import StarterKit from "@tiptap/starter-kit";
import { Comment } from "@sereneinserenade/tiptap-comment-extension";

const extensions = [
  StarterKit,
  Comment.configure({
    HTMLAttributes: {
      class: "my-comment",
    },
    activeClass: "my-comment--active",
    hoveredClass: "my-comment--hovered",
    onCommentActivated: (commentId) => {
      setActiveCommentId(commentId);
    },
    onCommentSelectionChange: (commentIds) => {
      setSelectedCommentIds(commentIds);
    },
  }),
];
```

For more details, look at [react demo.](https://github.com/sereneinserenade/tiptap-comment-extension/blob/main/demos/react/src/components/Tiptap.tsx#L77-L91)

## API:

### Comment.configure

```ts
Comment.configure({
  HTMLAttributes: {
    class: "my-comment",
  },
  activeClass: "my-comment--active",
  hoveredClass: "my-comment--hovered",
  onCommentActivated: (commentId) => {
    setActiveCommentId(commentId);
  },
  onCommentSelectionChange: (commentIds) => {
    setSelectedCommentIds(commentIds);
  },
});
```

## Commands:

- `setComment`: Sets the comment for the current selection with the given commentId. <br/>
  Example: `editor.commands.setComment('<a-comment-id>')`
- `unsetComment`: Removes the comment mark from the current selection, or from a specific commentId when one is provided. <br/>
  Example: `editor.commands.unsetComment()` or `editor.commands.unsetComment('<a-comment-id>')`
- `removeComment`: Removes every range for the given commentId in the document. <br/>
  Example: `editor.commands.removeComment('<a-comment-id>')`
- `selectComment`: Selects the first logical range for the given commentId. <br/>
  Example: `editor.commands.selectComment('<a-comment-id>')`
- `hoverComment`: Sets or clears the hovered comment id for decoration-driven sidebars. <br/>
  Example: `editor.commands.hoverComment('<a-comment-id>')`

## Helpers:

- `getCommentRanges(doc, commentId?)`: returns grouped logical ranges for comments, which is useful for building a sidebar without duplicating split inline segments.

## Notes:

- This package is still a lightweight mark-based anchor layer. Comment bodies, replies, resolved state, and persistence should live in your own app state.
- Overlapping comments are not supported in the current mark-based model.

## Stargazers

[![Stargazers repo roster for @sereneinserenade/tiptap-comment-extension](https://reporoster.com/stars/dark/sereneinserenade/tiptap-comment-extension)](https://github.com/sereneinserenade/tiptap-comment-extension/stargazers)
