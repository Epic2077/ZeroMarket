"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBlog } from "@/context/BlogProvider";
import { toFa } from "@/context/carLabels";
import { useSession } from "@/context/SessionProvider";
import { requiredText } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image, Plus, Video, X, UserPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createBlogAuthor } from "@/lib/supabase/blog";

const composerSchema = z.object({
  title: requiredText("عنوان نوشته الزامی است"),
  excerpt: requiredText("خلاصه نوشته الزامی است"),
  content: requiredText("متن نوشته را وارد کنید"),
  tags: requiredText("حداقل یک برچسب وارد کنید"),
  authorId: requiredText("انتخاب نویسنده الزامی است"),
  sourceName: z.string().optional(),
  sourceUrl: z.string().url("لینک معتبر وارد کنید").optional().or(z.literal("")),
});

type ComposerValues = z.infer<typeof composerSchema>;

export default function BlogComposer() {
  const router = useRouter();
  const { role } = useSession();
  const { createPost, authors } = useBlog();
  const [mediaKind, setMediaKind] = useState<"image" | "video">("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const [media, setMedia] = useState<
    { id: string; kind: "image" | "video"; url: string; caption?: string }[]
  >([]);
  const [showNewAuthor, setShowNewAuthor] = useState(false);
  const [creatingAuthor, setCreatingAuthor] = useState(false);

  const canCreate = role === "owner" || role === "admin";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ComposerValues>({
    resolver: zodResolver(composerSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      tags: "",
      authorId: authors[0]?.id ?? "",
    },
  });

  const selectedAuthorId = watch("authorId");
  const selectedAuthor = authors.find((a) => a.id === selectedAuthorId);

  const addMedia = () => {
    const url = mediaUrl.trim();
    if (!url) return;

    const entry = {
      id: `media-${Date.now()}-${media.length + 1}`,
      kind: mediaKind,
      url,
      caption: mediaCaption.trim() || undefined,
    } as const;

    setMedia((prev) => [...prev, entry]);
    setMediaUrl("");
    setMediaCaption("");
  };

  const handleCreateAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showNewAuthor) return;

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const name = formData.get("name") as string;
    const handle = formData.get("handle") as string;
    const authorRole = formData.get("role") as string;
    const avatar = formData.get("avatar") as string;

    if (!name || !handle) {
      toast.error("نام و هندل نویسنده الزامی است");
      return;
    }

    setCreatingAuthor(true);
    try {
      const newAuthor = await createBlogAuthor({
        name,
        handle: handle.startsWith("@") ? handle : `@${handle}`,
        role: authorRole || "نویسنده",
        avatar: avatar || name.charAt(0).toUpperCase(),
        verified: true,
      });

      if (newAuthor) {
        toast.success("نویسنده جدید با موفقیت ایجاد شد");
        setShowNewAuthor(false);
        (e.target as HTMLFormElement).reset();
      }
    } catch (error) {
      console.error("Failed to create author:", error);
      toast.error("خطا در ایجاد نویسنده");
    } finally {
      setCreatingAuthor(false);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!canCreate) {
      toast.error("فقط مالک یا مدیر می تواند پست ثبت کند");
      return;
    }

    const blocks = values.content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const tags = values.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const author = selectedAuthor || authors[0];
    if (!author) {
      toast.error("هیچ نویسنده‌ای یافت نشد");
      return;
    }

    const slug = await createPost({
      title: values.title,
      excerpt: values.excerpt,
      content: blocks,
      tags,
      media,
      author: {
        id: author.id,
        name: author.name,
        handle: author.handle,
        role: author.role,
        avatar: author.avatar,
        verified: author.verified,
      },
      sourceName: values.sourceName || undefined,
      sourceUrl: values.sourceUrl || undefined,
    });

    toast.success("پست جدید با موفقیت منتشر شد");
    router.push(`/blog/${slug}`);
  });

  if (!canCreate) {
    return (
      <div className="card-elevated p-6 sm:p-8 text-center space-y-3">
        <p className="text-lg font-800 text-foreground">دسترسی محدود است</p>
        <p className="text-sm leading-7 text-muted-foreground">
          برای انتشار پست باید با نقش مدیر یا مالک وارد شوید.
        </p>
        <Link href="/dashboard/owner" className="btn-secondary inline-flex text-sm">
          رفتن به پنل مالک
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <article className="card-elevated p-4 sm:p-5 border-primary/20 bg-linear-to-br from-background to-primary/5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <div className="section-label">پنل محتوا</div>
            <h2 className="text-lg sm:text-xl font-800 text-foreground mt-1">
              انتشار پست جدید
            </h2>
          </div>
          <span className="status-active">
            {role === "owner" ? "مالک" : "مدیر"}
          </span>
        </div>
      </article>

      <form onSubmit={onSubmit} noValidate className="card-elevated p-4 sm:p-5">
        <FieldGroup>
          <Field data-invalid={!!errors.title}>
            <FieldLabel htmlFor="blog-title">عنوان</FieldLabel>
            <Input
              id="blog-title"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            <FieldError>{errors.title?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.excerpt}>
            <FieldLabel htmlFor="blog-excerpt">خلاصه</FieldLabel>
            <Input
              id="blog-excerpt"
              aria-invalid={!!errors.excerpt}
              {...register("excerpt")}
            />
            <FieldError>{errors.excerpt?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.content}>
            <FieldLabel htmlFor="blog-content">
              متن (هر پاراگراف در یک خط)
            </FieldLabel>
            <textarea
              id="blog-content"
              rows={9}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              aria-invalid={!!errors.content}
              {...register("content")}
            />
            <FieldError>{errors.content?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.tags}>
            <FieldLabel htmlFor="blog-tags">
              برچسب ها (با ویرگول جدا کنید)
            </FieldLabel>
            <Input
              id="blog-tags"
              aria-invalid={!!errors.tags}
              {...register("tags")}
            />
            <FieldDescription>
              مثال: تحلیل بازار, قیمت, خودرو صفر
            </FieldDescription>
            <FieldError>{errors.tags?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.sourceName}>
            <FieldLabel htmlFor="blog-source-name">نام منبع (اختیاری)</FieldLabel>
            <Input
              id="blog-source-name"
              aria-invalid={!!errors.sourceName}
              {...register("sourceName")}
              placeholder="نام سایت یا منبع خبری"
            />
            <FieldError>{errors.sourceName?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.sourceUrl}>
            <FieldLabel htmlFor="blog-source-url">لینک منبع (اختیاری)</FieldLabel>
            <Input
              id="blog-source-url"
              type="url"
              aria-invalid={!!errors.sourceUrl}
              {...register("sourceUrl")}
              placeholder="https://example.com/article"
            />
            <FieldError>{errors.sourceUrl?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.authorId}>
            <FieldLabel htmlFor="blog-author">نویسنده</FieldLabel>
            <Select onValueChange={(value) => register("authorId").onChange({ target: { value } } as any)} defaultValue={authors[0]?.id ?? ""}>
              <SelectTrigger id="blog-author" aria-invalid={!!errors.authorId}>
                <SelectValue placeholder="نویسنده را انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={author.id ?? ""}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-700 flex items-center justify-center">
                        {author.avatar}
                      </span>
                      <div>
                        <p className="text-sm font-700 text-foreground">{author.name}</p>
                        <p className="text-2xs text-muted-foreground">{author.handle} · {author.role}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.authorId && <FieldError>{errors.authorId.message}</FieldError>}

            {role === "owner" && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowNewAuthor(!showNewAuthor)}
                  className="inline-flex items-center gap-1.5 text-sm font-700 text-primary hover:underline"
                >
                  <UserPlus size={14} />
                  {showNewAuthor ? "انصراف" : "افزودن نویسنده جدید"}
                </button>

                {showNewAuthor && (
                  <form onSubmit={handleCreateAuthor} className="mt-3 space-y-3 p-3 rounded-xl border border-border bg-muted/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        name="name"
                        placeholder="نام نویسنده"
                        required
                        disabled={creatingAuthor}
                      />
                      <Input
                        name="handle"
                        placeholder="هندل (مثال: @username)"
                        required
                        disabled={creatingAuthor}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        name="role"
                        placeholder="نقش (مثال: تحلیل‌گر بازار)"
                        disabled={creatingAuthor}
                      />
                      <Input
                        name="avatar"
                        placeholder="آواتار (مثال: MR)"
                        maxLength={2}
                        disabled={creatingAuthor}
                      />
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => setShowNewAuthor(false)} disabled={creatingAuthor}>
                        انصراف
                      </Button>
                      <Button type="submit" disabled={creatingAuthor}>
                        {creatingAuthor ? (
                          <>
                            <Loader2 size={14} className="animate-spin mr-2" />
                            در حال ایجاد...
                          </>
                        ) : (
                          <>
                            <UserPlus size={14} className="mr-2" />
                            ایجاد نویسنده
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel>مدیا (تصویر یا ویدیو)</FieldLabel>
            <div className="rounded-2xl border border-border p-3 space-y-3 bg-muted/20">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setMediaKind("image")}
                  className={`rounded-xl border px-3 py-2 text-sm font-700 inline-flex items-center justify-center gap-1.5 ${
                    mediaKind === "image"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground"
                  }`}
                >
                  <Image size={14} /> تصویر
                </button>
                <button
                  type="button"
                  onClick={() => setMediaKind("video")}
                  className={`rounded-xl border px-3 py-2 text-sm font-700 inline-flex items-center justify-center gap-1.5 ${
                    mediaKind === "video"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground"
                  }`}
                >
                  <Video size={14} /> ویدیو
                </button>
                <Button type="button" variant="outline" onClick={addMedia}>
                  <Plus size={14} /> افزودن مدیا
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  value={mediaUrl}
                  onChange={(event) => setMediaUrl(event.target.value)}
                  placeholder={
                    mediaKind === "image"
                      ? "لینک تصویر"
                      : "لینک ویدیو (YouTube یا mp4)"
                  }
                />
                <Input
                  value={mediaCaption}
                  onChange={(event) => setMediaCaption(event.target.value)}
                  placeholder="کپشن اختیاری"
                />
              </div>

              {!!media.length && (
                <div className="space-y-2">
                  {media.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2"
                    >
                      <span className="text-2xs text-muted-foreground">
                        {toFa(index + 1)}
                      </span>
                      <span className="text-xs font-700 text-foreground">
                        {item.kind === "image" ? "تصویر" : "ویدیو"}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-2xs text-muted-foreground">
                        {item.url}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setMedia((prev) =>
                            prev.filter((entry) => entry.id !== item.id)
                          )
                        }
                        className="rounded-md border border-border p-1 text-muted-foreground hover:text-danger"
                        aria-label="حذف مدیا"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Field>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Link href="/blog" className="btn-secondary text-sm">
              انصراف
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "در حال انتشار..." : "انتشار پست"}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
}