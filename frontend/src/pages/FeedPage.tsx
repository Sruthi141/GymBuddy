import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { postService, type Post } from '../services/postService';
import { useToast } from '../context/ToastContext';
import { validatePhoto } from '../utils/validation';
import { Heart, MessageCircle, Bookmark, Send, ImagePlus, Loader2, X } from 'lucide-react';

export default function FeedPage() {
    const { user } = useAuth();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [commentText, setCommentText] = useState<Record<string, string>>({});
    const [createContent, setCreateContent] = useState('');
    const [createMedia, setCreateMedia] = useState<File[]>([]);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async (p = 1) => {
        if (p === 1) setLoading(true);
        try {
            const { posts: data, pagination } = await postService.getFeed(p);
            setPosts((prev) => (p === 1 ? data : [...prev, ...data]));
            setHasMore(pagination.page < pagination.pages);
        } catch (err) {
            console.error('Failed to load feed:', err);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const { liked, likes: count } = await postService.likePost(postId);
            setPosts((prev) =>
                prev.map((p) => {
                    if (p._id !== postId) return p;
                    const ids = p.likes || [];
                    const hasLiked = ids.some((id: string) => String(id) === user?.id);
                    const newLikes = liked ? [...ids, user?.id] : ids.filter((id: string) => String(id) !== user?.id);
                    return { ...p, likes: newLikes };
                })
            );
        } catch (err) {
            console.error('Like failed:', err);
        }
    };

    const handleCreatePost = async () => {
        const content = createContent.trim();
        if (!content && createMedia.length === 0) {
            toast.addToast('Add a caption or photo', 'warning');
            return;
        }
        setCreating(true);
        try {
            const fd = new FormData();
            fd.append('content', content);
            fd.append('type', 'gym-photo');
            createMedia.forEach((f) => fd.append('media', f));
            const { post } = await postService.createPost(fd);
            setPosts((prev) => [post, ...prev]);
            setCreateContent('');
            setCreateMedia([]);
            toast.addToast('Post created', 'success');
        } catch (err) {
            toast.addToast('Failed to create post', 'error');
        } finally {
            setCreating(false);
        }
    };

    const addMediaFiles = (files: FileList | null) => {
        if (!files) return;
        const valid: File[] = [];
        for (let i = 0; i < Math.min(files.length, 5 - createMedia.length); i++) {
            const f = files[i];
            if (validatePhoto(f).valid) valid.push(f);
        }
        setCreateMedia((prev) => [...prev, ...valid].slice(0, 5));
    };

    const handleComment = async (postId: string) => {
        const text = commentText[postId]?.trim();
        if (!text) return;
        try {
            await postService.commentPost(postId, text);
            setCommentText((prev) => ({ ...prev, [postId]: '' }));
            const { post } = await postService.getPost(postId);
            setPosts((prev) => prev.map((p) => (p._id === postId ? post : p)));
        } catch (err) {
            console.error('Comment failed:', err);
        }
    };

    const getAvatar = (author: Post['author']) =>
        author.profilePhoto || author.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(author.name)}`;

    if (loading && posts.length === 0) {
        return (
            <div className="min-h-screen pt-24 pb-12 px-4">
                <div className="max-w-2xl mx-auto space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-card p-6 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-full bg-dark-600" />
                                <div className="flex-1">
                                    <div className="h-4 bg-dark-600 rounded w-1/3 mb-2" />
                                    <div className="h-3 bg-dark-600 rounded w-1/6" />
                                </div>
                            </div>
                            <div className="h-48 bg-dark-600 rounded-2xl mt-4" />
                            <div className="h-4 bg-dark-600 rounded w-3/4 mt-4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold text-white mb-6">Feed</h1>

                {/* Create post */}
                <div className="glass-card p-4 mb-6">
                    <textarea
                        value={createContent}
                        onChange={(e) => setCreateContent(e.target.value)}
                        placeholder="Share your workout, progress, or gym moment..."
                        className="input-field min-h-[80px] resize-none mb-3"
                        maxLength={2000}
                    />
                    {createMedia.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {createMedia.map((f, i) => (
                                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-dark-700">
                                    <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setCreateMedia((p) => p.filter((_, j) => j !== i))}
                                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger flex items-center justify-center"
                                    >
                                        <X className="w-3 h-3 text-white" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className="hidden"
                            onChange={(e) => addMediaFiles(e.target.files)}
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 text-dark-300 hover:text-primary text-sm"
                        >
                            <ImagePlus className="w-5 h-5" /> Photo ({createMedia.length}/5)
                        </button>
                        <button
                            onClick={handleCreatePost}
                            disabled={creating || (!createContent.trim() && createMedia.length === 0)}
                            className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                        </button>
                    </div>
                </div>

                {posts.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <ImagePlus className="w-16 h-16 text-dark-500 mx-auto mb-4" />
                        <h2 className="text-lg font-semibold text-white mb-2">No posts yet</h2>
                        <p className="text-dark-300 text-sm">
                            Share your first gym photo or progress update to get started.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {posts.map((post) => (
                            <article key={post._id} className="glass-card overflow-hidden">
                                <div className="p-4 flex items-center gap-3">
                                    <img
                                        src={getAvatar(post.author)}
                                        alt=""
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold text-white">{post.author.name}</p>
                                        <p className="text-xs text-dark-400">
                                            {post.gym?.name || 'Personal'} •{' '}
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {post.content && (
                                    <p className="px-4 pb-2 text-dark-200 text-sm">{post.content}</p>
                                )}
                                {post.media?.length > 0 && (
                                    <div className="aspect-square max-h-96 bg-dark-800">
                                        <img
                                            src={post.media[0].url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-4 flex items-center gap-4">
                                    <button
                                        onClick={() => handleLike(post._id)}
                                        className="flex items-center gap-1.5 text-dark-300 hover:text-danger transition-colors"
                                    >
                                        <Heart
                                            className={`w-5 h-5 ${post.likes?.length ? 'fill-danger text-danger' : ''}`}
                                        />
                                        <span className="text-sm">{post.likes?.length || 0}</span>
                                    </button>
                                    <span className="flex items-center gap-1.5 text-dark-300">
                                        <MessageCircle className="w-5 h-5" />
                                        <span className="text-sm">{post.comments?.length || 0}</span>
                                    </span>
                                    <button className="ml-auto text-dark-400 hover:text-primary transition-colors">
                                        <Bookmark className="w-5 h-5" />
                                    </button>
                                </div>
                                {post.comments?.length > 0 && (
                                    <div className="px-4 pb-2 space-y-2">
                                        {post.comments.slice(0, 3).map((c, i) => (
                                            <p key={i} className="text-sm text-dark-300">
                                                <span className="font-medium text-white">{c.user?.name}</span>{' '}
                                                {c.text}
                                            </p>
                                        ))}
                                    </div>
                                )}
                                <div className="p-4 flex gap-2 border-t border-dark-600/50">
                                    <input
                                        type="text"
                                        placeholder="Add a comment..."
                                        value={commentText[post._id] || ''}
                                        onChange={(e) =>
                                            setCommentText((prev) => ({ ...prev, [post._id]: e.target.value }))
                                        }
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && handleComment(post._id)
                                        }
                                        className="input-field flex-1 py-2 text-sm"
                                    />
                                    <button
                                        onClick={() => handleComment(post._id)}
                                        className="btn-primary py-2 px-4"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </article>
                        ))}
                        {hasMore && posts.length > 0 && (
                            <div className="text-center">
                                <button
                                    onClick={() => {
                                        const next = page + 1;
                                        setPage(next);
                                        loadFeed(next);
                                    }}
                                    className="btn-secondary text-sm"
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
