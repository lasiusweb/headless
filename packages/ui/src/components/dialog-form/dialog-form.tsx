import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "../button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "../form";

interface DialogFormProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  formSchema: any; // Should be a Zod schema but keeping generic for now
  onSubmit: (data: any) => void;
  children: (form: any) => React.ReactNode; // Render prop for form fields
  submitText?: string;
  cancelText?: string;
}

const DialogForm: React.FC<DialogFormProps> = ({
  isOpen,
  onClose,
  title,
  description,
  formSchema,
  onSubmit,
  children,
  submitText = "Submit",
  cancelText = "Cancel",
}) => {
  const form = useForm({
    // resolver: zodResolver(formSchema), // Would need zod for this
    mode: "onChange",
  });

  const handleSubmit = (data: any) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {children(form)}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {cancelText}
              </Button>
              <Button type="submit">{submitText}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export { DialogForm };