# Aulianza Clone

Clone **frontend** web portofolio [aulianza.com](https://aulianza.com) yang dibangun dengan **Next.js 15 (App Router)**, **React 19**, dan **Tailwind CSS 4**. Project ini dibuat untuk belajar dan bereksperimen dengan animasi dan interaksi UI (GSAP, Matter.js, Framer Motion, Lenis).

Project ini hanya berisi sisi frontend. Tidak ada API, server action, atau database di dalam repository; seluruh data berasal dari file statis di `lib/`.

> **Catatan:** Seluruh konten pribadi (nama, foto, proyek, artikel, dan sebagainya) berasal dari pemilik asli situs dan tidak boleh digunakan sebagai identitas pribadi tanpa izin.

## Tentang Project

Repository ini adalah hasil clone frontend dari situs portofolio aulianza.com. Tujuannya adalah mempelajari cara membangun situs portofolio dengan Next.js App Router, animasi GSAP dan Matter.js, serta struktur konten berbasis JSON.

Sebagian besar isi (teks, proyek, artikel, foto) bukan milik pembuat repository ini. Sebelum digunakan untuk situs pribadi, ganti seluruh konten dengan konten Anda sendiri. Lihat bagian [Batasan dan Catatan Penting](#batasan-dan-catatan-penting).

## Fitur

- Halaman: Home, About, Portfolio (dengan halaman detail per proyek), Blog (dengan halaman detail per artikel), Tools, Uses, Under the Hood, Stats, Guestbook, Contact, dan halaman 404.
- Hero dengan efek fluid canvas, chip berbasis fisika (Matter.js), marquee, dan smooth scroll (Lenis).
- Konten dikelola melalui file JSON di folder `lib/`, tanpa database.
- Halaman detail (portfolio, blog, tools) dibangun secara statis di build time dengan `generateStaticParams`.

## Tech Stack

| Kategori | Teknologi |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, TypeScript 5.7 |
| Styling | Tailwind CSS 4, `tailwind-merge`, `clsx` |
| Animasi | GSAP (`@gsap/react`), Framer Motion, Lenis, Matter.js |
| Ikon | lucide-react |
| Package manager | pnpm (repo memakai `pnpm-lock.yaml`) |

## Prasyarat

- Node.js (versi LTS direkomendasikan; repo belum menetapkan versi Node secara eksplisit)
- pnpm

## Instalasi

```bash
git clone https://github.com/jinstack69/clone-web-portofolio-aulianza.com.git
cd clone-web-portofolio-aulianza.com
pnpm install
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Script

| Perintah | Fungsi |
|---|---|
| `pnpm dev` | Menjalankan server development |
| `pnpm build` | Membuat build production |
| `pnpm start` | Menjalankan hasil build production |
| `pnpm lint` | Menjalankan `next lint` |

## Struktur Direktori

```
app/              Route App Router (satu folder per halaman), layout.tsx, fonts.ts
components/
  sections/       Blok halaman (hero, selected work, physics chips, dll.)
  shared/         Komponen reusable (navbar, footer, smooth-scroll, dll.)
  ui/             Komponen UI (markdown-view, project-mockup)
hooks/            Custom hooks (use-reveal-group, use-subpage-hero)
lib/              Data JSON, locale-context.tsx, utils.ts
public/           Font, gambar, dan og-aulianza.png
```

## Mengubah Konten

Sebagian besar konten berada di file JSON dalam `lib/`, misalnya `projects-data.json`, `articles-detail-data.json`, `about-data.json`, `tools-data.json`, `uses-data.json`, `stats-data.json`, dan `i18n-data.json`. Gambar diletakkan di `public/images/`.

## Batasan dan Catatan Penting

- **Frontend only.** Tidak ada backend atau database. Guestbook hanya berjalan di sisi client: pesan baru tersimpan di state browser dan hilang saat halaman di-reload. Tombol login Google dan GitHub hanya simulasi dan tidak melakukan autentikasi.
- **Form kontak memakai Web3Forms** (`api.web3forms.com`) dengan access key yang tertanam langsung di `app/contact/page.tsx`. Pesan akan masuk ke inbox pemilik key tersebut. Ganti dengan key milik Anda sebelum digunakan.
- **Status pengiriman form kontak tidak akurat:** jika pengiriman gagal, UI tetap menampilkan status "terkirim" karena ada fallback di blok `catch`.
- `next.config.mjs` menonaktifkan optimasi gambar Next.js (`images.unoptimized: true`).

## Deployment

Karena hanya frontend, project ini tidak membutuhkan environment variable atau konfigurasi backend. Build production dihasilkan dengan `pnpm build` dan dijalankan dengan `pnpm start`. Target hosting belum didokumentasikan.

## Lisensi

Kode dalam repository ini dilisensikan di bawah [MIT License](LICENSE).

Konten pribadi tidak termasuk dalam lisensi MIT dan tetap menjadi milik pemilik asli. Ini mencakup nama, foto, teks, proyek, dan artikel, serta aset di `public/` dan data di `lib/*.json`. Jangan menggunakannya sebagai identitas atau konten Anda sendiri tanpa izin.

Font di `public/fonts/` mengikuti lisensi masing-masing font.
