<p align="center">
  <img src="assets/logo.svg" width="200"/>
  
  ![GitHub Sponsors](https://img.shields.io/github/sponsors/sereneinserenade?color=%23bf3989&label=Sponsor%20Me&style=for-the-badge)
  ![GitHub Repo stars](https://img.shields.io/github/stars/sereneinserenade/tiptap-comment-extension?label=Star%20the%20Repo&style=for-the-badge)
  DM Me on Discord - sereneinserenade#4869
</p>

[Tiptap Extension](https://tiptap.dev/guide/custom-extensions) for having Google-Docs like pro-commenting in Tiptap.

A ⭐️ to the repo if you 👍 / ❤️ what I'm doing would be much appreciated. If you're using this extension and making money from it, it'd be very kind of you to **[❤️ Sponsor me](https://github.com/sponsors/sereneinserenade)**. If you're looking for a **dev to work you on your project's Rich Text Editor** with or as \*\*a frontend developer, [DM me on Discord/Twitter/LinkedIn](https://github.com/sereneinserenade)👨‍💻🤩.

I've made a bunch of extensions for Tiptap 2, some of them are **Resiable Images And Videos**, **Search and Replace**, **LanguageTool integration** with tiptap. You can check it our here <https://github.com/sereneinserenade#a-glance-of-my-projects>.

## Demo (truly detailed)

- You can try it out at <https://sereneinserenade.github.io/tiptap-comment-extension/>

## How to use

```bash
npm i @sereneinserenade/tiptap-comment-extension
```

```ts
import StarterKit from "@tiptap/starter-kit";
import Comment from "@sereneinserenade/tiptap-comment-extension";

const extensions = [
  StarterKit,
  Comment.configure({
    HTMLAttributes: {
      class: "my-comment",
    },
    onCommentActivated: (commentId) => {
      setActiveCommentId(commentId);

      if (commentId) setTimeout(() => focusCommentWithActiveId(commentId));
    },
  }),
];
```

For a demo, look at https://github.com/sereneinserenade/tiptap-comment-extension/blob/main/demos/react/src/components/Tiptap.tsx#L77-L91

## Stargazers

[![Stargazers repo roster for @sereneinserenade/tiptap-comment-extension](https://reporoster.com/stars/dark/sereneinserenade/tiptap-comment-extension)](https://github.com/sereneinserenade/tiptap-comment-extension/stargazers)
