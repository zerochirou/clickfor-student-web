import z from 'zod';
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const imageFileType = z
  .instanceof(File, { message: 'Harus berupa file!' })
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: 'Ukuran gambar maksimal adalah 2MB.',
  })
  .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: 'Format gambar harus JPEG, JPG, atau PNG.',
  });
