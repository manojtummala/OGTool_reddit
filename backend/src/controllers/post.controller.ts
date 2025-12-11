import { prisma } from "../index";
import { Request, Response } from "express";


function extractCommentText(comment: any): string | null {
  if (typeof comment.text === "string") return comment.text;
  if (typeof comment.body === "string") return comment.body;
  if (typeof comment.content === "string") return comment.content;
  return null;
}

/**
 * Recursively processes comments + replies
 */
async function processCommentTree(comment: any, postId: string, parentId: string | null = null) {
  const text = extractCommentText(comment);
  console.log("current comment text: ", text);
  if (!text) return;

  let dbComment;

  // Check if comment has a valid ID and if it exists in the database
  const commentId = comment.id || comment.comment_id;
  if (commentId && typeof commentId === 'string' && commentId.trim().length > 0) {
    try {
      // Verify the comment exists and belongs to this post
      const existingComment = await prisma.comment.findFirst({
        where: { 
          id: commentId,
          postId: postId
        }
      });

      if (existingComment) {
        dbComment = await prisma.comment.update({
          where: { id: commentId },
          data: {
            text,
            parentCommentId: parentId,
          }
        });
      } else {
        console.warn(`Comment ID ${commentId} not found for post ${postId}, creating new comment`);
        dbComment = await prisma.comment.create({
          data: {
            text,
            authorUsername: comment.authorUsername ?? comment.author_username ?? "unknown",
            timestamp: new Date(),
            postId,
            parentCommentId: parentId,
          }
        });
      }
    } catch (err) {
      console.warn(`Failed to update comment ${commentId}, creating new:`, err);
      dbComment = await prisma.comment.create({
        data: {
          text,
          authorUsername: comment.authorUsername ?? comment.author_username ?? "unknown",
          timestamp: new Date(),
          postId,
          parentCommentId: parentId,
        }
      });
    }
  } else {
    dbComment = await prisma.comment.create({
      data: {
        text,
        authorUsername: comment.authorUsername ?? comment.author_username ?? "unknown",
        timestamp: new Date(),
        postId,
        parentCommentId: parentId,
      }
    });
  }

  if (Array.isArray(comment.replies)) {
    await Promise.all(
      comment.replies.map((reply: any) =>
        processCommentTree(reply, postId, dbComment.id)
      )
    );
  }

  return dbComment;
}

export const updatePostWithComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { post_id, title, body, subreddit, comments } = req.body;

    const updatedPost = await prisma.post.update({
      where: { id: post_id },
      data: { title, body, subreddit },
    });

    if (Array.isArray(comments)) {
      await Promise.all(
        comments.map((comment) => processCommentTree(comment, post_id))
      );
    }

    res.json(updatedPost);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("COMMENT UPDATE ERR:", message);
    res.status(500).json({ error: message });
  }
};

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try{
    const id = req.params.id;
    console.log("Attempting to update Post ID:", id);
    if (!id) {
      res.status(400).json({ error: "Invalid post id" });
      return;
    }
    const { title, body, subreddit, personaId, targetId } = req.body;
    const post = await prisma.post.update({
      where: { id },
      data: { title, body, subreddit, personaId, targetId },
    });
    res.json(post);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try{
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: "Invalid post id" });
      return;
    }
    await prisma.post.delete({ where: { id } });
    res.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
};

// export const updatePostWithComments = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { post_id, title, body, subreddit, comments } = req.body;
    
//     // 1. Update the post itself
//     const updatedPost = await prisma.post.update({
//       where: { id: post_id }, // Use the ID from body, or req.params if you change the route to /:id/comments
//       data: { title, body, subreddit },
//     });

//     // 2. Handle comments (upsert/create logic here depending on your needs)
//     // This is a simplified example assuming you want to update existing ones
//     if (comments && Array.isArray(comments)) {
//       console.log("Updating comments", comments.length);

//       await Promise.all(comments.map(async (comment: any) => {
//         if (comment.id) {
//           const commentText = comment.text || comment.content || comment.body;
//           console.log('current comment text: ', comment.id);
          
//           if (commentText !== undefined) {
//             await prisma.comment.update({
//               where: { id: comment.id },
//               data: { text: commentText }
//             });
//             console.log('update comment text: ', commentText);
//           }
//         }
//       }));
//     }
//     res.json(updatedPost);
//   } catch (err: unknown) {
//     const message = err instanceof Error ? err.message : String(err);
//     res.status(500).json({ error: message });
//   }
// };