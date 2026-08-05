import { defineCollection, z } from 'astro:content';

// Masallar için şema — her masalın aynı yapıya sahip olması
// SEO ve tutarlılık için kritik.
const masallar = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),              // meta description (~150-160 karakter) — SEO için
    pubDate: z.coerce.date(),             // yayın tarihi
    updatedDate: z.coerce.date().optional(),
    kategori: z.enum([
      'uyku-masallari',
      'arkadaslik-masallari',
      'cesaret-masallari',
      'sevgi-masallari',
      'ogretici-masallari',
    ]),
    yasAraligi: z.string(),               // örn: "2-5 yaş"
    okumaSuresi: z.number(),              // dakika
    dersler: z.array(z.string()).min(3),  // ebeveynler için çıkartılacak dersler
    tartismaSorulari: z.array(z.string()).min(3),
    keywords: z.array(z.string()).min(3), // SEO anahtar kelimeler
    author: z.string().default('bebekmasallari.com'),
  }),
});

export const collections = { masallar };
