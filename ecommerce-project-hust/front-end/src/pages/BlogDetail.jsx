import { useEffect, useState } from 'react'
import { XCircleIcon } from '@heroicons/react/24/outline'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  CalendarIcon,
  UserIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ArrowLeftIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import Loading from '../components/UI/Loading'
import { toast } from 'react-toastify'

const BlogDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [commentContent, setCommentContent] = useState('')
  const [commentName, setCommentName] = useState('')
  const [commentEmail, setCommentEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/blog/posts/${slug}`, {
        params: { include_comments: 'true' }
      })
      setPost(res.data.post)
    } catch (error) {
      console.error('Error fetching post:', error)
      toast.error('Không tìm thấy bài viết')
      navigate('/blog')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()

    const content = replyingTo ? replyContent : commentContent

    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung bình luận')
      return
    }

    if (!user && (!commentName.trim() || !commentEmail.trim())) {
      toast.error('Vui lòng nhập tên và email')
      return
    }

    setSubmitting(true)
    try {
      const response = await api.post(`/blog/posts/${post.id}/comments`, {
        content,
        name: commentName,
        email: commentEmail,
        parent_id: replyingTo || null
      })
      // Use message from API response (different for admin vs regular user)
      toast.success(response.data.message || 'Bình luận của bạn đã được gửi thành công')
      setCommentContent('')
      setCommentName('')
      setCommentEmail('')
      setReplyingTo(null)
      setReplyContent('')
      fetchPost() // Refresh comments
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi gửi bình luận')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = (commentId) => {
    if (replyingTo === commentId) {
      setReplyingTo(null)
      setReplyContent('')
    } else {
      setReplyingTo(commentId)
      setReplyContent('')
    }
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setReplyContent('')
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <Loading />
  }

  if (!post) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-medium"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          Quay lại danh sách bài viết
        </Link>

        {/* Post Content */}
        <article className="card p-8 mb-8">
          {/* Categories */}
          {post.categories && post.categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/blog?category_id=${cat.id}`}
                  className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-semibold rounded-full hover:bg-primary-200 transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              <span>{post.author_name || post.author_username || 'Admin'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              <span>{formatDate(post.published_at || post.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <EyeIcon className="h-5 w-5" />
              <span>{post.views || 0} lượt xem</span>
            </div>
            <div className="flex items-center gap-2">
              <ChatBubbleLeftIcon className="h-5 w-5" />
              <span>{post.comment_count || 0} bình luận</span>
            </div>
          </div>

          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 rounded-xl overflow-hidden">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Excerpt */}
          {post.excerpt && (
            <div className="mt-8 p-4 bg-primary-50 border-l-4 border-primary-600 rounded">
              <p className="text-gray-700 italic">{post.excerpt}</p>
            </div>
          )}
        </article>

        {/* Comments Section */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Bình luận ({post.comment_count || 0})
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-8">
            <div className="space-y-4">
              {!user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tên *
                    </label>
                    <input
                      type="text"
                      value={commentName}
                      onChange={(e) => setCommentName(e.target.value)}
                      className="input"
                      required={!user}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={commentEmail}
                      onChange={(e) => setCommentEmail(e.target.value)}
                      className="input"
                      required={!user}
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {replyingTo ? 'Trả lời bình luận *' : 'Bình luận *'}
                </label>
                {replyingTo && (
                  <div className="mb-2 p-2 bg-primary-50 border border-primary-200 rounded text-sm text-gray-700">
                    Đang trả lời bình luận của {post.comments?.find(c => c.id === replyingTo)?.name || 'người dùng'}
                  </div>
                )}
                <textarea
                  value={replyingTo ? replyContent : commentContent}
                  onChange={(e) => replyingTo ? setReplyContent(e.target.value) : setCommentContent(e.target.value)}
                  rows={4}
                  className="input"
                  placeholder={replyingTo ? "Nhập câu trả lời của bạn..." : "Nhập bình luận của bạn..."}
                  required
                />
              </div>
              {replyingTo && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelReply}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Hủy trả lời
                  </button>
                </div>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary flex items-center gap-2"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
                {submitting ? 'Đang gửi...' : 'Gửi bình luận'}
              </button>
            </div>
          </form>

          {/* Comments List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-6">
              {post.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  formatDate={formatDate}
                  user={user}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
            </p>
          )}
        </div>
      </div>

      <style jsx global>{`
        .blog-content {
          color: #374151;
          line-height: 1.8;
        }
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4 {
          color: #111827;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content p {
          margin-bottom: 1.5rem;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }
        .blog-content ul,
        .blog-content ol {
          margin: 1.5rem 0;
          padding-left: 2rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        .blog-content blockquote {
          border-left: 4px solid #2563eb;
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: #6b7280;
        }
        .blog-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .blog-content a:hover {
          color: #1d4ed8;
        }
        .blog-content code {
          background-color: #f3f4f6;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        .blog-content pre {
          background-color: #1f2937;
          color: #f9fafb;
          padding: 1.5rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 2rem 0;
        }
        .blog-content pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
        }
      `}</style>
    </div>
  )
}

// Comment Item Component
const CommentItem = ({ comment, onReply, formatDate, user, level = 0 }) => {
  return (
    <div className={`${level > 0 ? 'ml-8 border-l-2 border-gray-200 pl-6 mt-4' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-gray-900">
              {comment.user_name || comment.name || 'Khách'}
            </h4>
            <p className="text-sm text-gray-500">
              {formatDate(comment.created_at)}
            </p>
          </div>
        </div>
        <p className="text-gray-700 mb-3 whitespace-pre-wrap">{comment.content}</p>
        {level === 0 && (
          <button
            onClick={() => onReply(comment.id)}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Trả lời
          </button>
        )}
      </div>
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              formatDate={formatDate}
              user={user}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default BlogDetail

