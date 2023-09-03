import { BubbleMenu, EditorContent, JSONContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import { Comment } from '@sereneinserenade/tiptap-comment-extension'
import { v4 } from 'uuid'

import { CommentIcon } from './CommentIcon'

import { useEffect, useRef, useState } from 'react'
import './Tiptap.scss'

const content: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: {
        level: 1,
      },
      content: [
        {
          type: 'text',
          text: 'Hello World!',
        },
      ],
    },
  ],
}

interface Comment {
  id: string
  content: string
  replies: Comment[]
  createdAt: Date
}

const getNewComment = (content: string): Comment => {
  return {
    id: `a${v4()}a`,
    content,
    replies: [],
    createdAt: new Date()
  }
}

const Tiptap = () => {
  const [comments, setComments] = useState<Comment[]>([])

  const [activeCommentId, setActiveCommentId] = useState<string | null>(null)

  const commentsSectionRef = useRef<HTMLDivElement | null>(null)

  const focusCommentWithActiveId = () => {
    if (!commentsSectionRef.current) return

    const commentInput = commentsSectionRef.current.querySelector<HTMLInputElement>(`input#${activeCommentId}`)

    if (!commentInput) return

    commentInput.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    })

    commentInput.focus()
  }

  useEffect(
    () => {
      focusCommentWithActiveId()
    },
    [activeCommentId]
  )

  const extensions = [
    StarterKit,
    Comment.configure(
      {
        HTMLAttributes: {
          class: 'my-comment'
        },
        onCommentActivated: (commentId) => {
          setActiveCommentId(commentId)
          setTimeout(focusCommentWithActiveId)
        }
      }
    )
  ]

  const editor = useEditor(
    {
      extensions,
      content,
    }
  )

  const setComment = () => {
    const newComment = getNewComment('')

    setComments([...comments, newComment])

    editor?.commands.setComment(newComment.id)

    setActiveCommentId(newComment.id)
  }

  return (
    <div className='flex gap-2 p-8'>
      <EditorContent editor={editor} />
      {
        editor && (
          <>
            <section className='flex flex-col gap-2 p-2 border rounded-lg w-96 border-slate-200' ref={commentsSectionRef}>
              {
                comments.length ? (
                  comments.map(comment => (
                    <div
                      key={comment.id}
                      className='flex flex-col gap-4 p-2 border rounded-lg border-slate-400'
                    >
                      <span className='flex items-end gap-2'>
                        <a href='https://github.com/sereneinserenade' className='font-semibold border-b border-blue-200'>
                          sereneinserenade
                        </a>

                        <span className='text-xs text-slate-400'>
                          {comment.createdAt.toLocaleDateString()}
                        </span>
                      </span>

                      <input
                        value={comment.content || ''}
                        disabled={comment.id !== activeCommentId}
                        className='p-2 bg-transparent rounded-lg text-inherit focus:outline-none focus:ring-2 ring-blue-200'
                        id={comment.id}
                        onInput={
                          (event) => {
                            const value = (event.target as HTMLInputElement).value

                            setComments(comments.map(comment => {
                              if (comment.id === activeCommentId) {
                                return {
                                  ...comment,
                                  content: value
                                }
                              }

                              return comment
                            }))
                          }
                        }
                        onKeyDown={
                          (event) => {
                            if (event.key !== 'Enter') return

                            setActiveCommentId(null)
                          }
                        }
                      />

                      {
                        comment.id === activeCommentId && (
                          <button
                            className='rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20'
                            onClick={() => {
                              setActiveCommentId(null)
                              editor.commands.focus()
                            }}
                          >
                            Save
                          </button>
                        )
                      }
                    </div>
                  ))
                ) : (
                  <span className='pt-8 text-center text-slate-400'>
                    No comments yet
                  </span>
                )
              }
            </section>


            <BubbleMenu editor={editor} className='p-1 border rounded-lg border-slate-400'>
              <button
                className='rounded-md bg-white/10 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20'
                onClick={setComment}
              >
                <CommentIcon />
              </button>
            </BubbleMenu>
          </>
        )
      }
    </div>
  )
}

export default Tiptap
