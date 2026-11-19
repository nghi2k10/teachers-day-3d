# Teachers Day 3D · Một lá thư gửi người lái đò

Thiệp Ngày Nhà giáo Việt Nam 20/11/2026 bằng HTML, CSS, JavaScript thuần. Giữ phong thư 3D, màu sắc, bố cục và nhạc nền hiện có; không cần backend, cài package hay build.

## Chạy trên máy

Mở `index.html` trực tiếp hoặc dùng VS Code Live Server. Có thể chạy:

```powershell
cd D:\LinhTinh\2011\teachers-day-3d
python -m http.server 8080
```

Sau đó mở http://localhost:8080/ .

## Cá nhân hóa và chia sẻ

1. Nhấn **Tạo thiệp của bạn** ngay trên đầu trang để tới trang nhập tên `?edit=1`. Mục **Cá nhân hóa thiệp** bên dưới phong thư vẫn sử dụng được.
2. Nhập tên Thầy/Cô (ví dụ `Cô Lan`) và người gửi (ví dụ `Minh Anh` hoặc `Lớp 12A1`). Tên cập nhật ngay, không cần nút lưu.
3. Nhấn **Sao chép link thiệp** trong mục cá nhân hóa hoặc cuối thư. Khi người nhận mở link, thiệp tự điền lại tên.

Trang tạo thiệp có nút **Xem thiệp đã cá nhân hóa** để mở URL chứa `to` và `from`. Link gửi cho người nhận không chứa `edit=1`, nên luôn mở phong thư thay vì trang nhập tên. Có thể gửi link `https://nghi2k10.github.io/teachers-day-3d/?edit=1` cho người muốn tự tạo thiệp.

Ví dụ:

```text
https://nghi2k10.github.io/teachers-day-3d/?to=C%C3%B4%20Lan&from=Minh%20Anh
```

`to` và `from` là tùy chọn. Để trống sẽ dùng lời chúc chung. Tên giới hạn 64 ký tự, chuẩn hóa Unicode và bỏ ký tự điều khiển. Nội dung URL chỉ được chèn bằng `textContent`, không dùng `innerHTML`. Khi trình duyệt không cấp quyền clipboard, website hiện ô link đã chọn sẵn để sao chép thủ công. Khi chạy từ máy hoặc mở file, link chia sẻ trỏ về GitHub Pages; trên hosting thật dùng địa chỉ hiện tại.

## Viết thư, hoa và âm thanh

- Lời chúc được viết lần lượt theo ký tự tiếng Việt, giữ đủ chỗ cho nội dung để tránh nhảy bố cục. Nút **Bỏ qua hiệu ứng · Đọc toàn bộ** hiện ngay khi bắt đầu viết.
- `prefers-reduced-motion` hiển thị ngay toàn bộ lời chúc. Bật tùy chọn này trong lúc viết cũng kết thúc hiệu ứng ngay.
- Kết thư, hoa nở lần lượt và đung đưa; chạm, rê chuột hoặc nhấn Enter/Space trên bó hoa để tỏa sáng. Hạt hoa và ánh vàng được giới hạn số lượng cho mobile và dọn khi xem lại.
- Xem lại giữ tên cá nhân hóa, dọn hiệu ứng cũ và cho phép mở lại. Nhạc dùng duy nhất một phần tử audio, không phát tự động, không phát chồng khi bấm nhanh; tạm dừng khi ẩn tab.
- Nhạc hiện dùng `assets/audio/background.wav`. Muốn dùng MP3, thêm file MP3 có quyền sử dụng rồi thay `src` của `#audio` trong `index.html`. Có thể tạo lại WAV gốc bằng `python make_audio.py`.

## Lưu PNG

Ảnh rộng **1800px**, cao tối thiểu **2400px**, tự tăng chiều cao theo nội dung và tên người gửi. Ảnh gồm tên người nhận, cả sáu đoạn lời chúc, hoa và tên người gửi; không có nút điều khiển.

Canvas đọc nội dung gốc đầy đủ, độc lập với hiệu ứng viết. Chờ font cục bộ và SVG hoa sẵn sàng, có giới hạn thời gian chờ. Font không tải được sẽ dùng Times New Roman và thông báo. Nếu không tải được hoa, website báo lỗi, bật lại nút lưu để thử lại; không tải xuống ảnh thiếu hoa.

## Các file của bản nâng cấp

| File | Nội dung |
| --- | --- |
| `index.html` | Form cá nhân hóa thu gọn, nút bỏ qua/chia sẻ, chữ ký, khung sao chép thủ công, dùng nhạc thực tế có sẵn. |
| `js/personalization.js` | Đọc và làm sạch `to`/`from`, cập nhật tên/lời chúc, tạo link bằng URL API. |
| `js/greeting.js` | Hiệu ứng viết, bỏ qua/reset, giữ hoa nở, PNG tự tính chiều cao và xử lý lỗi tài nguyên. |
| `js/main.js` | Kết nối nút bỏ qua/chia sẻ, thông báo lưu ảnh, quản lý bật/tắt nhạc khi bấm nhanh. |
| `css/style.css`, `css/animations.css` | Kiểu hiển thị cho điều khiển mới, tên dài và con trỏ viết. |
| `assets/js/gsap.min.js` | Bản GSAP 3.12.5 cục bộ, giữ thông tin giấy phép ở đầu file; không phụ thuộc CDN. |
| `verify_upgrade.py` | Kiểm thử tự động các tính năng mới và hồi quy. |
| `dist/` | Bản sao đồng bộ của HTML/CSS/JS/assets để dùng trên hosting cần thư mục xuất bản. |

Font viết tay Dancing Script được nhúng trong `assets/fonts/`, hỗ trợ tiếng Việt; giấy phép OFL đi kèm. Nguồn: https://github.com/google/fonts/tree/main/ofl/dancingscript . Font nội dung dài vẫn giữ Times New Roman.

Đổi lời chúc tại sáu đoạn `.greeting-line` trong `index.html`. Giữ cụm `Thầy Cô` nếu muốn tự thay bằng tên người nhận. Tốc độ viết nằm trong hàm `write()` của `js/greeting.js`. Không cần sửa thư viện hoặc phong thư.

## Kiểm thử

Cài Python Playwright và trình duyệt kiểm thử nếu máy chưa có:

```powershell
python -m pip install playwright
python -m playwright install chromium
```

Trong khi server 8080 đang chạy, mở terminal khác:

```powershell
python verify_upgrade.py
```

Script kiểm tra Chrome for Testing (Chromium do Playwright cài) và Edge khi có tại đường dẫn Windows tiêu chuẩn. Kiểm tra các độ rộng 375px, 768px, 1920px, mobile có touch mô phỏng, viết tự nhiên/bỏ qua, mở lại ba lần, nhạc và thao tác nhanh, PNG có đủ tên/nội dung, clipboard thành công/thất bại, URL không tin cậy, font lỗi, hoa lỗi và fallback khi không có GSAP. Ảnh kiểm thử `preview-*.png`, `letter-*.png`, `export-*.png` được Git bỏ qua. Kiểm thử mô phỏng không thay thế việc mở thử trên điện thoại thật.

## Deploy lại lên GitHub Pages

Repository hiện dùng nhánh `main`, thư mục `/ (root)`. Vì vậy `index.html`, `css/`, `js/`, `assets/` phải nằm ngay gốc repository; không chỉ upload nội dung vào một thư mục `teachers-day-3d` lồng bên trong.

Chạy trong thư mục source:

```powershell
git status
git add index.html css js assets dist README.md verify_upgrade.py
git commit -m "Add personalized Teachers Day cards, handwriting and sharing"
git push origin main
```

Vào **Actions** trong GitHub, chờ lượt **pages build and deployment** mới có dấu tích xanh, sau đó mở:

https://nghi2k10.github.io/teachers-day-3d/

Nhấn **Ctrl + F5** để bỏ cache cũ. Không cần nhấn lại Save trong Settings → Pages nếu đã chọn `main` và `/ (root)`. Không có bước build npm. Nếu chỉnh source sau này và còn dùng `dist/`, đồng bộ HTML/CSS/JS/assets sang `dist/` trước khi commit; GitHub Pages cấu hình root đọc source ở gốc.

Bản nâng cấp được chuẩn bị tại máy. Các lệnh commit/push ở trên là bước bạn thực hiện để cập nhật website đang chạy.
