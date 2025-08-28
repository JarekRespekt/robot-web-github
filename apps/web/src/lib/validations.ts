import { z } from "zod";

export const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Заголовок обов'язковий")
    .min(2, "Заголовок повинен містити принаймні 2 символи")
    .max(100, "Заголовок не може перевищувати 100 символів"),
  description: z
    .string()
    .max(500, "Опис не може перевищувати 500 символів")
    .optional(),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(1, "Заголовок обов'язковий")
    .min(2, "Заголовок повинен містити принаймні 2 символи")
    .max(100, "Заголовок не може перевищувати 100 символів")
    .optional(),
  description: z
    .string()
    .max(500, "Опис не може перевищувати 500 символів")
    .optional(),
  status: z
    .enum(["new", "in_progress", "done", "failed"], {
      message: "Невірний статус завдання",
    })
    .optional(),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;