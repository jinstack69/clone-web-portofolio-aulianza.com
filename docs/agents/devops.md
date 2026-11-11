# DevOps Report - Perbaikan Clone, Langkah 1 (Opsi B)

## Tujuan
Mengubah pengecualian git agar tiga file JSON runtime ikut ter-track, sementara folder workspace `replean/` tetap di-ignore. Tujuan akhir: repo yang di-clone dapat menjalankan `pnpm install && pnpm build` tanpa error `Module not found` untuk impor berikut:
- `lib/data.ts` mengimpor `@/replean/design/target-chips.json`
- `components/sections/physics-chips.tsx` mengimpor `@/replean/design/chips-exact-data.json` dan `@/replean/design/chips-exact-data-390.json`

## Kondisi Awal
- `.gitignore` baris 3: `/replean` (seluruh folder `replean/` di-ignore).
- Git status awal: clean pada branch `main`.
- Tidak ada file `replean/` yang ter-track sebelum perubahan (`git ls-files replean` kosong).
- `replean/.gitignore` berisi `screens/` (9 byte). Aturan ini tidak memengaruhi tiga file JSON target.
- `docs/agents/` belum ada sebelum tugas ini.
- Ketiga file JSON target ada di disk: `replean/design/target-chips.json` (6429 byte), `replean/design/chips-exact-data.json` (19781 byte), `replean/design/chips-exact-data-390.json` (19661 byte).

## Perubahan
- File: `/home/jin/Latihan/aulianza/.gitignore`
- Resource: tidak ada resource lain. Tidak ada perubahan pada kode aplikasi, isi `replean/`, atau berkas lain.
- Perubahan: baris `/replean` diganti dengan blok berikut (persis sesuai instruksi):

```
/replean/*
!/replean/design/
/replean/design/*
!/replean/design/chips-exact-data.json
!/replean/design/chips-exact-data-390.json
!/replean/design/target-chips.json
```

- Alasan: pola lama `/replean` meng-ignore seluruh folder sehingga tiga file impor tidak ikut ter-clone. Pola baru meng-ignore isi `replean/` dan `replean/design/` secara bertahap, lalu melakukan negasi (`!`) khusus untuk tiga file runtime. Git tidak dapat me-re-include file jika direktori induknya sudah di-exclude, sehingga setiap level direktori harus dinyatakan secara eksplisit.
- Baris lain (`/clone-1440.json`, `/clone-390.json`, `/node_modules`, `/.next`, `.env*`) tidak diubah.
- Diff `.gitignore` hanya berisi perubahan pada blok `/replean`. File tetap tanpa newline di akhir, sama seperti kondisi awal.

## Validasi

| Kriteria | Perintah | Hasil |
|---|---|---|
| AC1: tiga JSON runtime tidak di-ignore | `git check-ignore <3 path>` (tanpa `-v`) | PASS, output kosong (0 baris) |
| AC2: empat path tetap di-ignore | `git check-ignore <4 path>` (tanpa `-v`) | PASS, 4 dari 4 path di-ignore |
| AC3: dry-run hanya tiga JSON | `git add --dry-run replean` | PASS, tepat 3 baris (lihat di bawah) |
| AC4: diff `.gitignore` terbatas | `git diff -- .gitignore` | PASS, hanya blok `/replean` yang berubah |

Catatan teknis: `git check-ignore -v` juga menampilkan pola negasi (`!`) yang cocok. Karena itu AC1 diverifikasi dengan `check-ignore` tanpa `-v`, yang hanya mencetak path yang benar-benar di-ignore. Keluaran `-v` untuk AC1 menampilkan baris `.gitignore:6/7/8` dengan pola `!`, yang berarti negasi berhasil cocok dan path tidak di-ignore.

Output `git check-ignore -v` (ringkas):
- `replean/design/target-next-data.json` -> `.gitignore:5 /replean/design/*`
- `replean/design/target-dom-analysis.json` -> `.gitignore:5 /replean/design/*`
- `replean/screens/ref-1440-full.png` -> `replean/.gitignore:1 screens/`
- `replean/STATE.md` -> `.gitignore:3 /replean/*`

Output `git add --dry-run replean` (lengkap, 3 baris):
```
add 'replean/design/chips-exact-data-390.json'
add 'replean/design/chips-exact-data.json'
add 'replean/design/target-chips.json'
```

Ringkasan ukuran tiga file runtime:
- `chips-exact-data.json`: 19781 byte
- `chips-exact-data-390.json`: 19661 byte
- `target-chips.json`: 6429 byte
- Total: 3 file, 45871 byte (sekitar 44,8 KiB)

Perintah yang TIDAK dijalankan (sesuai batasan tahap ini):
- `pnpm install` dan `pnpm build`: NOT RUN. Validasi build dilakukan di langkah berikutnya atau oleh pengguna.
- `git add`, `commit`, `push`, `reset`, `stash`, `checkout`: tidak dijalankan.

Status repo setelah perubahan (`git status --short`):
```
 M .gitignore
?? replean/
```
`?? replean/` ditampilkan karena direktori tidak sepenuhnya ter-ignore. Ini wajar: tiga file JSON yang belum ter-add memang belum ter-track. Yang penting, dry-run hanya mencantumkan tiga file tersebut.

## Keamanan dan Risiko
- Tidak ada secret yang dibaca atau ditampilkan. Isi file JSON tidak diaudit pada tahap ini (tugas langkah berikutnya: security).
- Risiko: tiga file JSON runtime akan masuk ke Git. Pengguna perlu memastikan isinya tidak memuat data sensitif sebelum commit. Audit isi adalah tanggung jawab langkah security berikutnya.
- Risiko: aturan `/replean/*` juga mengizinkan file baru di `replean/` root jika pola negasi diperluas di masa depan. Saat ini file root (`STATE.md`, `recon.md`, `schema.sql`, dll.) tetap ter-ignore, sudah diverifikasi.
- Risiko: `replean/design/` yang berisi `ref-1440.json` (sekitar 1,5 MB) dan `target-dom-analysis.json` tetap di-ignore. Ini sesuai maksud, tetapi berarti repo yang di-clone tidak memiliki data referensi tersebut.
- Risiko: file yang diimpor oleh kode harus tersedia saat build. Jika file lain di `replean/design/` diimpor di masa depan, pola negasi baru perlu ditambahkan. Ini perlu didokumentasikan agar tidak terlewat.

## Rollback / Recovery
1. Kembalikan `.gitignore` ke kondisi awal dengan mengganti blok 7 baris kembali menjadi `/replean`. Perintah: `git checkout -- .gitignore` (hanya jika belum ada perubahan lain pada file ini, dan dijalankan oleh pengguna).
2. Jika tiga file sudah ter-add tetapi belum di-commit: `git rm --cached` pada tiga path tersebut. Tidak menghapus file dari disk.
3. Jika sudah ter-commit: `git revert <commit>`, bukan force push.
4. File di disk tidak berubah pada seluruh proses ini, sehingga tidak ada risiko kehilangan data lokal.

## Approval yang Dibutuhkan
- Pengguna perlu meninjau dan melakukan commit sendiri (sesuai instruksi: commit dilakukan oleh pengguna).
- Pengguna perlu mengonfirmasi bahwa tiga file JSON boleh masuk repo. Audit isi dilakukan pada langkah security.
- Tidak ada approval untuk production, DNS, firewall, atau infrastruktur lain karena tidak ada perubahan di luar `.gitignore`.

## Handoff
- Owner berikutnya: Security (audit isi tiga file JSON sebelum commit) dan pengguna (commit).
- Tindakan lanjutan:
  1. Security audit isi `chips-exact-data.json`, `chips-exact-data-390.json`, dan `target-chips.json` (cari secret, data pribadi, atau data yang tidak boleh publik).
  2. Setelah pengguna commit, jalankan `pnpm install && pnpm build` di clone bersih untuk memverifikasi tidak ada error `Module not found` (NOT RUN pada tahap ini).
  3. Jika kelak ada impor baru dari `replean/`, tambahkan pola negasi yang sesuai dan perbarui dokumen ini.
