# Art direction — opencms.kdigi.vn

Một phong cách duy nhất cho mọi minh hoạ trên website: **3D clay + kính mờ (frosted glass), góc isometric**, khớp với hero hiện có và với `khoi-design-system/design-system/README.md` ("Minh hoạ 3D clay + glass, render sẵn, không 3D realtime"; tạo bằng Codex `image_gen` qua `codex exec`, nền chroma phẳng rồi tách nền bằng script).

## Bảng màu (lấy từ logo KDIGI)

| Vai trò | Màu | Ghi chú |
| --- | --- | --- |
| Xanh thương hiệu | `#4767EC` | Màu fill của `public/brand/kdigi-logo.svg`; khối trung tâm, điểm nhấn |
| Navy | `#0A1020` | Khối tương phản, thùng, tài liệu |
| Đất sét trắng ấm | `#F4F0EA` | Đế (platform), thân vật thể |
| Cyan phát sáng | `#22D3EE` | Dải sáng viền, ribbon nối; chỉ dùng mảnh, không phủ mảng lớn |
| Kính mờ | trắng sữa pha cyan nhạt | Đặc đủ để nền không xuyên qua |

## Motif

- Hình học trừu tượng từ chữ K của logo: tam giác vuông, thanh chéo, khối lăng trụ vát cạnh. **Không bao giờ vẽ chữ K hay logo** trong ảnh (logo thật luôn ở HTML/OG).
- Một **khối xanh trung tâm** (hub cube) = KDIGI CMS; thẻ kính mờ = website / tài liệu / ảnh; ribbon cyan phẳng = kết nối / API / luồng dữ liệu.
- Mỗi trang một "cảnh": đế vuông bo góc, vài vật thể đọc được ở cỡ nhỏ, bố cục tập trung giữa, lề rộng.
- Ảnh scene 3:2, nền trong suốt (đã tách), có bóng tiếp xúc navy nhẹ do script tạo; hero 1600×1067, section 1200×800.

## Nên / Không nên

- Nên: một góc nhìn (3/4 isometric ~35°), một hướng sáng (trên-trái), thẻ kính để trống (thanh mờ thay chữ), vật thể gắn đúng chủ đề trang.
- Không: chữ, số, logo, thương hiệu bên thứ ba, người thật, khuôn mặt, UI giả mạo giao diện sản phẩm, ảnh stock, đổ bóng/sàn do model vẽ, chữ K nguyên vẹn, số liệu, biểu tượng giải thưởng.
- Ảnh chụp sản phẩm thật nằm ở `public/images/shots/` và luôn là chụp màn hình thật từ app.opencms.kdigi.vn, không dùng ảnh AI thay thế.

## Prompt template

Khoá style nằm ở `scripts/art/specs.json` (`style` + `scene` + `notext`). Mỗi ảnh chỉ khác `subject`:

```
<style lock>. Subject: <a rounded-square warm-white clay platform with a smooth flat top; on it ...>. <scene>. Absolutely no text, no letters, no numbers, no logos, no trademarks, no watermark, no people.
```

Chạy: `node scripts/art/generate.mjs [key ...] [--jobs 6] [--force]` (cần `codex` đã đăng nhập, Python + Pillow). Đầu ra: `public/images/art/<page-key>-hero.webp` (hero) và `<page-key>-sec1.webp` (section); provenance (prompt, công cụ + phiên bản, ngày, sha256 raw/output) trong `public/images/art/_manifest.json`.

## Review

Mỗi ảnh được mở và xem trước khi dùng: loại ảnh có chữ méo, chữ K, UI giả, vật thể bị cắt, mép nền xanh chroma còn sót, lệch bảng màu. Ảnh hỏng thì `--force` sinh lại.

## Trạng thái

24 hero (`*-hero.webp`) đã sinh và review. Các key `*-sec1` (ảnh section 1200×800) đã có prompt trong `specs.json` nhưng chưa sinh được vì Codex báo hết credit workspace ("Your workspace is out of credits"); khi nạp lại chạy `node scripts/art/generate.mjs` để sinh phần còn thiếu. Trong lúc đó, trang dùng ảnh chụp thật ở `public/images/shots/` làm hình trong bài.
