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
import { useBlog } from "@/context/BlogProvider";
import { toFa } from "@/context/carLabels";
import { useSession } from "@/context/SessionProvider";
import { requiredText } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image, Plus, Video, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const composerSchema = z.object({
  title: requiredText("عنوان نوشته الزامی است"),
  excerpt: requiredText("خلاصه نوشته الزامی است"),
  content: requiredText("متن نوشته را وارد کنید"),
  tags: requiredText("حداقل یک برچسب وارد کنید"),
});

type ComposerValues = z.infer<typeof composerSchema>;

export default function BlogComposer() {
  const router = useRouter();
  const { role } = useSession();
  const { createPost } = useBlog();
  const [mediaKind, setMediaKind] = useState<"image" | "video">("image");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const [media, setMedia] = useState<
    { id: string; kind: "image" | "video"; url: string; caption?: string }[]
  >([]);

  const canCreate = role === "owner" || role === "admin";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ComposerValues>({
    resolver: zodResolver(composerSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      content: "",
      tags: "",
    },
  });

  const author = useMemo(
    () =>
      role === "owner"
        ? {
            name: "مالک ZeroMarket",
            handle: "@zeromarket-owner",
            role: "مالک پلتفرم",
            avatar: "OW",
            verified: true,
          }
        : {
            name: "مدیر ZeroMarket",
            handle: "@zeromarket-admin",
            role: "مدیر محتوا",
            avatar: "AD",
            verified: true,
          },
    [role],
  );

  const addMedia = () => {
    const url = mediaUrl.trim();
    if (!url) {
      return;
    }

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

    const slug = createPost({
      title: values.title,
      excerpt: values.excerpt,
      content: blocks,
      tags,
      media,
      author,
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
        <Link
          href="/dashboard/owner"
          className="btn-secondary inline-flex text-sm"
        >
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
                            prev.filter((entry) => entry.id !== item.id),
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
