"use client";

import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import z from "zod";
import { useState } from "react";
import { CgSpinnerTwoAlt } from "react-icons/cg";

import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Announcement } from "@prisma/client";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUpload from "@/components/image-upload";
import { Textarea } from "@/components/ui/textarea";

type AnnouncementFormProps = {
  initialData: Announcement | null;
};
const announcementSchema = z.object({
  type: z.string().optional(),
  title: z.string().min(1, "Announcement title is required"),
  image: z.string().min(1, "Image is required"),
  content: z.string().optional(),
  isActive: z.boolean(),
});
type AnnouncementSchema = z.infer<typeof announcementSchema>;
function AnnouncementForm({ initialData }: AnnouncementFormProps) {
  const title = initialData ? "Update Announcement" : "Create Announcement";
  const subtitle = initialData
    ? "Edit an announcement"
    : "Add a new announcement";
  const toastMessage = initialData
    ? "Announcement updated."
    : "Announcement created";
  const router = useRouter();
  const form = useForm<AnnouncementSchema>({
    resolver: zodResolver(announcementSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          type: initialData.type || "",
          title: initialData.title || "",
          image: initialData.image || "",
          content: initialData.content || "",
        }
      : {
          title: "",
          image: "",
          content: "",
          isActive: false,
        },
  });
  const [isLoading, setIsLoading] = useState(false);
  const onSubmitted = async (data: AnnouncementSchema) => {
    try {
      setIsLoading(true);
      if (initialData) {
        await axios.patch(`/api/announcement/${initialData.id}`, data);
      } else {
        await axios.post("/api/announcement", data);
      }
      toast.success(toastMessage);
      router.push("/dashboard/announcement");
      router.refresh();
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <div className="flex overflow-y-auto items-center justify-between">
        <div className="flex space-x-6">
          <Button
            onClick={() => router.back()}
            variant={"outline"}
            size={"icon"}
          >
            <ChevronLeft />
          </Button>
          <Header title={title} subtitle={subtitle} />
        </div>
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitted)} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Announcement title..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isLoading}
                      placeholder="Announcement content..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder="Announcement type..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      className="border-white"
                      disabled={isLoading}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Available</FormLabel>
                    <FormDescription>
                      This announcement will appear in the store.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      disable={isLoading}
                      value={field.value ? field.value : ""}
                      onChange={(url: string) => field.onChange(url)}
                      onDelete={() => field.onChange("")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isLoading} type="submit">
            {isLoading && <CgSpinnerTwoAlt className=" animate-spin" />}
            {isLoading
              ? initialData
                ? "Save Change..."
                : "Creating..."
              : initialData
              ? "Save Change"
              : "Create"}
          </Button>
        </form>
      </Form>
    </>
  );
}

export default AnnouncementForm;
