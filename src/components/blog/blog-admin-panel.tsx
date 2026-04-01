"use client";

import {ChangeEvent, FormEvent, useEffect, useState} from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {ArrowRight, ImagePlus, LockKeyhole, LogOut, PenSquare, PencilLine, ShieldCheck, X} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/text-area";
import {getLocalizedPagePath, SiteLocale} from "@/lib/site-locale";
import {InternalBlogPost} from "@/lib/internal-blog";

interface SessionPayload {
    authenticated: boolean;
    email: string | null;
    configured: boolean;
    usesDefaults: boolean;
}

interface BlogFormState {
    title: string;
    excerpt: string;
    authorName: string;
    coverImage: string;
    tags: string;
    content: string;
}

const initialFormState: BlogFormState = {
    title: "",
    excerpt: "",
    authorName: "The Adamant Team",
    coverImage: "",
    tags: "",
    content: "",
};

async function requestBlogAdminSession() {
    const response = await fetch("/api/blog-admin/session", {cache: "no-store"});
    return await response.json() as SessionPayload;
}

async function requestInternalBlogPosts() {
    const response = await fetch("/api/blog-admin/posts", {cache: "no-store"});

    if (!response.ok) {
        return [] as InternalBlogPost[];
    }

    const payload = await response.json() as { posts?: InternalBlogPost[] };
    return payload.posts ?? [];
}

export function BlogAdminPanel({locale}: { locale: SiteLocale }) {
    const [session, setSession] = useState<SessionPayload | null>(null);
    const [sessionStatus, setSessionStatus] = useState<"loading" | "guest" | "authenticated">("loading");
    const [posts, setPosts] = useState<InternalBlogPost[]>([]);
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isSavingPost, setIsSavingPost] = useState(false);
    const [editorError, setEditorError] = useState("");
    const [formState, setFormState] = useState(initialFormState);
    const [editingPostId, setEditingPostId] = useState<string | null>(null);
    const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState("");
    const [isUploadingCover, setIsUploadingCover] = useState(false);

    useEffect(() => {
        let cancelled = false;

        void (async () => {
            try {
                const payload = await requestBlogAdminSession();

                if (cancelled) {
                    return;
                }

                setSession(payload);

                if (payload.authenticated) {
                    setSessionStatus("authenticated");
                    const nextPosts = await requestInternalBlogPosts();

                    if (!cancelled) {
                        setPosts(nextPosts);
                    }

                    return;
                }

                setSessionStatus("guest");
            } catch {
                if (!cancelled) {
                    setSessionStatus("guest");
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!selectedCoverFile) {
            setCoverPreviewUrl("");
            return;
        }

        const previewUrl = URL.createObjectURL(selectedCoverFile);
        setCoverPreviewUrl(previewUrl);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [selectedCoverFile]);

    async function refreshSession() {
        try {
            const payload = await requestBlogAdminSession();

            setSession(payload);

            if (payload.authenticated) {
                setSessionStatus("authenticated");
                setPosts(await requestInternalBlogPosts());
                return;
            }

            setSessionStatus("guest");
        } catch {
            setSessionStatus("guest");
        }
    }

    async function handleLogin(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoggingIn(true);
        setLoginError("");

        try {
            const response = await fetch("/api/blog-admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: loginEmail,
                    password: loginPassword,
                }),
            });

            const payload = await response.json() as { error?: string };

            if (!response.ok) {
                throw new Error(payload.error || "Could not log in.");
            }

            toast.success("Blog admin unlocked.");
            setLoginPassword("");
            await refreshSession();
        } catch (error) {
            const message = error instanceof Error ? error.message : "Could not log in.";
            setLoginError(message);
            toast.error(message);
        } finally {
            setIsLoggingIn(false);
        }
    }

    async function handleLogout() {
        await fetch("/api/blog-admin/logout", {
            method: "POST",
        });

        setPosts([]);
        setSessionStatus("guest");
        setSession((current) => current ? {...current, authenticated: false} : current);
        resetEditor();
        toast.success("Logged out.");
    }

    async function handleSavePost(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSavingPost(true);
        setEditorError("");

        try {
            const coverImage = await resolveCoverImage();
            const requestBody = {
                ...formState,
                id: editingPostId,
                coverImage,
            };
            const isEditing = Boolean(editingPostId);
            const response = await fetch("/api/blog-admin/posts", {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });

            const payload = await response.json() as { error?: string; post?: InternalBlogPost };

            if (!response.ok || !payload.post) {
                throw new Error(payload.error || "Could not save the article.");
            }

            setPosts((current) => {
                if (isEditing) {
                    return current.map((post) => post.id === payload.post!.id ? payload.post! : post);
                }

                return [payload.post!, ...current];
            });

            resetEditor();
            toast.success(isEditing ? "Article updated." : "Article published on the internal blog.");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Could not save the article.";
            setEditorError(message);
            toast.error(message);
        } finally {
            setIsSavingPost(false);
        }
    }

    function handleCoverFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0] ?? null;
        setSelectedCoverFile(file);
        setEditorError("");
    }

    function startEditing(post: InternalBlogPost) {
        setEditingPostId(post.id);
        setFormState({
            title: post.title,
            excerpt: post.excerpt,
            authorName: post.authorName,
            coverImage: post.coverImage || "",
            tags: post.tags.join(", "),
            content: post.content,
        });
        setSelectedCoverFile(null);
        setEditorError("");
        window.scrollTo({top: 0, behavior: "smooth"});
    }

    function resetEditor() {
        setEditingPostId(null);
        setFormState(initialFormState);
        setSelectedCoverFile(null);
        setEditorError("");
        setIsUploadingCover(false);
    }

    async function resolveCoverImage() {
        if (!selectedCoverFile) {
            return formState.coverImage;
        }

        setIsUploadingCover(true);

        try {
            const uploadPayload = new FormData();
            uploadPayload.append("file", selectedCoverFile);

            const response = await fetch("/api/blog-admin/upload", {
                method: "POST",
                body: uploadPayload,
            });

            const payload = await response.json() as { error?: string; url?: string };

            if (!response.ok || !payload.url) {
                throw new Error(payload.error || "Could not upload the cover image.");
            }

            setFormState((current) => ({...current, coverImage: payload.url!}));
            setSelectedCoverFile(null);
            return payload.url;
        } finally {
            setIsUploadingCover(false);
        }
    }

    if (sessionStatus === "loading") {
        return (
            <div className="glass-panel p-8 text-sm text-foreground/68">
                Checking blog admin session...
            </div>
        );
    }

    if (sessionStatus === "guest") {
        return (
            <div className="glass-panel grid gap-6 p-8 lg:grid-cols-[0.88fr_1.12fr]">
                <div>
                    <p className="section-kicker">
                        <LockKeyhole className="h-4 w-4"/>
                        Member login
                    </p>
                    <h2 className="section-title max-w-xl">
                        Sign in to publish and edit internal blog posts on The Adamant.
                    </h2>
                    <p className="section-copy max-w-xl">
                        This local publisher keeps a cookie-based admin session and writes articles straight into the
                        site&apos;s internal blog data, so they show up inside the `/blog` section immediately.
                    </p>

                    <div className="mt-6 rounded-[1.5rem] border border-black/8 bg-black/[0.03] p-5 text-sm leading-7 text-foreground/68 dark:border-white/10 dark:bg-white/[0.03]">
                        <p className="font-semibold text-foreground">Free local media option</p>
                        <p className="mt-2">
                            Cover images can be uploaded for free into `public/uploads/blog-covers`. This works now in
                            local development and keeps costs at zero. For Vercel persistence later, you&apos;ll need
                            storage or a CMS.
                        </p>
                    </div>
                </div>

                <form className="rounded-[1.7rem] border border-black/8 bg-white/82 p-6 dark:border-white/10 dark:bg-white/[0.04] sm:p-8" onSubmit={handleLogin}>
                    <div className="space-y-5">
                        <div>
                            <Label htmlFor="blog-admin-email" required>Email</Label>
                            <Input
                                id="blog-admin-email"
                                type="email"
                                autoComplete="email"
                                value={loginEmail}
                                onChange={(event) => setLoginEmail(event.target.value)}
                                placeholder="yashverma@theadamant.com"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="blog-admin-password" required>Password</Label>
                            <Input
                                id="blog-admin-password"
                                type="password"
                                autoComplete="current-password"
                                value={loginPassword}
                                onChange={(event) => setLoginPassword(event.target.value)}
                                placeholder="Enter the admin password"
                                required
                            />
                        </div>

                        {loginError && (
                            <div className="rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                                {loginError}
                            </div>
                        )}

                        <button type="submit" className="button-primary w-full" disabled={isLoggingIn}>
                            {isLoggingIn ? "Unlocking..." : "Unlock blog admin"}
                            <ArrowRight className="h-4 w-4"/>
                        </button>

                        <p className="text-xs leading-6 text-foreground/58">
                            {session?.usesDefaults
                                ? "Development fallback credentials are active. Set BLOG_ADMIN_EMAILS, BLOG_ADMIN_PASSWORD, and BLOG_ADMIN_SESSION_SECRET before production use."
                                : "Production credentials are controlled through BLOG_ADMIN_EMAILS, BLOG_ADMIN_PASSWORD, and BLOG_ADMIN_SESSION_SECRET."}
                        </p>
                    </div>
                </form>
            </div>
        );
    }

    const coverPreview = coverPreviewUrl || formState.coverImage;
    const isEditing = Boolean(editingPostId);

    return (
        <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
            <form className="glass-panel p-8 sm:p-9" onSubmit={handleSavePost}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="section-kicker">
                            <PenSquare className="h-4 w-4"/>
                            {isEditing ? "Edit article" : "Publish article"}
                        </p>
                        <h2 className="mt-4 text-3xl font-semibold text-foreground">
                            {isEditing ? "Update an internal blog post." : "Add a new blog post to your internal site."}
                        </h2>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {isEditing && (
                            <button type="button" className="button-secondary" onClick={resetEditor}>
                                Cancel edit
                                <X className="h-4 w-4"/>
                            </button>
                        )}
                        <button type="button" className="button-secondary" onClick={handleLogout}>
                            Log out
                            <LogOut className="h-4 w-4"/>
                        </button>
                    </div>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                    <div className="md:col-span-2">
                        <Label htmlFor="blog-title" required>Title</Label>
                        <Input
                            id="blog-title"
                            value={formState.title}
                            onChange={(event) => setFormState((current) => ({...current, title: event.target.value}))}
                            placeholder="How to improve conversion with a faster service site"
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="blog-excerpt">Excerpt</Label>
                        <Textarea
                            id="blog-excerpt"
                            value={formState.excerpt}
                            onChange={(event) => setFormState((current) => ({...current, excerpt: event.target.value}))}
                            placeholder="A short summary that appears on the blog cards and metadata."
                            rows={3}
                        />
                    </div>

                    <div>
                        <Label htmlFor="blog-author">Author name</Label>
                        <Input
                            id="blog-author"
                            value={formState.authorName}
                            onChange={(event) => setFormState((current) => ({...current, authorName: event.target.value}))}
                            placeholder="The Adamant Team"
                        />
                    </div>

                    <div>
                        <Label htmlFor="blog-tags">Tags</Label>
                        <Input
                            id="blog-tags"
                            value={formState.tags}
                            onChange={(event) => setFormState((current) => ({...current, tags: event.target.value}))}
                            placeholder="SEO, UX, Website Strategy"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="blog-cover-image">Cover image</Label>
                            <span className="text-xs text-foreground/55">Upload free locally or paste a URL</span>
                        </div>

                        <div className="mt-3 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                            <div className="rounded-[1.4rem] border border-black/8 bg-black/[0.03] p-4 dark:border-white/10 dark:bg-white/[0.03]">
                                <Label htmlFor="blog-cover-upload">Upload image file</Label>
                                <Input
                                    id="blog-cover-upload"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/avif"
                                    onChange={handleCoverFileChange}
                                    className="mt-2"
                                />
                                <p className="mt-3 text-xs leading-6 text-foreground/55">
                                    Free local upload. Supports JPG, PNG, WEBP, AVIF up to 5MB.
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="blog-cover-image">Or use image URL</Label>
                                <Input
                                    id="blog-cover-image"
                                    type="url"
                                    value={formState.coverImage}
                                    onChange={(event) => setFormState((current) => ({...current, coverImage: event.target.value}))}
                                    placeholder="https://images.example.com/blog-cover.jpg"
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        {coverPreview && (
                            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-black/8 bg-white/70 dark:border-white/10 dark:bg-white/[0.04]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={coverPreview}
                                    alt="Cover preview"
                                    className="h-52 w-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <Label htmlFor="blog-content" required>Article content</Label>
                        <Textarea
                            id="blog-content"
                            value={formState.content}
                            onChange={(event) => setFormState((current) => ({...current, content: event.target.value}))}
                            placeholder={"Write the post here.\n\nUse blank lines between paragraphs.\nUse ## for section headings.\nUse - for bullet lists."}
                            rows={14}
                            required
                        />
                    </div>
                </div>

                {editorError && (
                    <div className="mt-5 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
                        {editorError}
                    </div>
                )}

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm leading-6 text-foreground/62">
                        Signed in as <span className="font-semibold text-foreground">{session?.email}</span>.
                    </p>
                    <button type="submit" className="button-primary" disabled={isSavingPost || isUploadingCover}>
                        {isSavingPost ? (isUploadingCover ? "Uploading cover..." : isEditing ? "Saving changes..." : "Publishing...") : (isEditing ? "Save changes" : "Publish on blog")}
                        <ArrowRight className="h-4 w-4"/>
                    </button>
                </div>
            </form>

            <div className="glass-panel p-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-foreground text-background">
                        <ShieldCheck className="h-5 w-5"/>
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">Published internally</p>
                        <p className="text-sm text-foreground/62">All approved company logins can publish and edit</p>
                    </div>
                </div>

                <div className="mt-6 space-y-4">
                    {posts.length > 0 ? posts.map((post) => (
                        <article key={post.id} className="rounded-[1.4rem] border border-black/8 bg-white/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
                            {post.coverImage && (
                                <div className="mb-4 overflow-hidden rounded-[1rem]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="h-32 w-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {post.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="feature-chip !px-3 !py-1 text-xs">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h3 className="mt-4 text-lg font-semibold text-foreground">{post.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-foreground/68">{post.excerpt}</p>
                            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-foreground/55">
                                <span>{new Intl.DateTimeFormat("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                }).format(new Date(post.publishedAt))}</span>
                                <div className="flex items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => startEditing(post)}
                                        className="inline-flex items-center gap-2 font-semibold text-foreground transition hover:text-primary"
                                    >
                                        <PencilLine className="h-4 w-4"/>
                                        Edit
                                    </button>
                                    <Link
                                        href={getLocalizedPagePath(locale, `blog/${post.slug}`)}
                                        className="inline-flex items-center gap-2 font-semibold text-foreground transition hover:text-primary"
                                    >
                                        View
                                        <ArrowRight className="h-4 w-4"/>
                                    </Link>
                                </div>
                            </div>
                        </article>
                    )) : (
                        <div className="rounded-[1.4rem] border border-dashed border-black/12 px-5 py-6 text-sm leading-7 text-foreground/65 dark:border-white/12">
                            No internal articles yet. The first one you publish here will show up at the top of the blog section.
                        </div>
                    )}

                    <div className="rounded-[1.4rem] border border-black/8 bg-black/[0.03] p-5 text-sm leading-7 text-foreground/65 dark:border-white/10 dark:bg-white/[0.03]">
                        <div className="flex items-center gap-3 text-foreground">
                            <ImagePlus className="h-4 w-4"/>
                            <span className="font-semibold">Free upload path right now</span>
                        </div>
                        <p className="mt-2">
                            Cover images are stored under `public/uploads/blog-covers`, so there is no paid image
                            service involved for local use. If you later want deployed persistence, move this to a
                            storage provider or CMS.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
