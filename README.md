# 🌐 AI Translator – Chrome Extension (Google Gemini)

**AI Translator** là tiện ích mở rộng (Chrome Extension) giúp bạn dịch nhanh đoạn văn bản được chọn ngay trên trang web bằng **Google Gemini API**.

---

## ⚡ Tính năng nổi bật

-   Dịch tức thời đoạn văn hoặc cụm từ chỉ bằng **1 click** hoặc **phím tắt Alt+Shift+T**
-   **Popup gọn nhẹ** hiển thị ngay dưới vùng chọn, không chiếm toàn màn hình
-   **Popup có thể kéo thả** di chuyển đến vị trí bất kỳ trên trang và **tự động nhớ** vị trí cho lần sau
-   **Phân biệt thông minh**:

    -   Nếu bạn chọn **một từ** → tra kiểu **từ điển** (nghĩa, từ loại, ví dụ)
    -   Nếu bạn chọn **một cụm / câu** → dịch tự nhiên như văn bản

-   **Tự ẩn popup** khi click ra ngoài hoặc nhấn `Esc`
-   Hỗ trợ **nhiều API key** xoay vòng khi key hết quota

---

## 🧩 1. Cài đặt

### 🔹 Cách thủ công

1. Clone hoặc tải repo này về máy:

    ```bash
    git clone https://github.com/nguyendangkin/iTrans.git
    ```

    Hoặc tải file ZIP và giải nén.

2. Mở Chrome và truy cập:

    ```
    chrome://extensions/
    ```

3. Bật **Developer mode (Chế độ nhà phát triển)** ở góc trên phải.

4. Nhấn **Load unpacked (Tải tiện ích chưa đóng gói)** → chọn thư mục dự án bạn vừa giải nén.

5. Extension sẽ xuất hiện trong danh sách và có thể ghim lên thanh công cụ.

---

## ⚙️ 2. Cấu hình API Key

1. Nhấn vào biểu tượng 🌐 **AI Translator** → mở cửa sổ **Cài đặt**.
2. Dán các **Google Gemini API Key** vào ô:

    - Mỗi key 1 dòng
    - Có thể thêm nhiều key (sẽ tự động xoay vòng nếu hết quota)

3. Chọn **ngôn ngữ đích** muốn dịch sang (Tiếng Việt, English, 中文, 日本語, v.v.)
4. Nhấn **💾 Lưu cài đặt**

> 🔑 Lấy API key miễn phí tại:
> [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

---

## 💡 3. Cách sử dụng

### 🖱 Dịch bằng chuột

1. Bôi đen đoạn văn bản bạn muốn dịch
2. Nút 🌐 nhỏ sẽ xuất hiện ngay dưới vùng chọn
3. Bấm nút → popup hiển thị bản dịch

### ⌨️ Dịch bằng phím tắt

-   **Alt + Shift + T** → dịch nhanh đoạn được chọn

### 🧭 Di chuyển & đóng popup

-   **Di chuyển popup:**

    -   Kéo thả phần header của popup (thanh tiêu đề gradient)
    -   Vị trí sẽ được lưu cho lần sau
    -   Không lo popup bị kéo ra khỏi màn hình

-   **Đóng popup:**
    -   Click ra ngoài vùng popup, hoặc
    -   Nhấn phím **Esc**

---

## 🧠 4. Cơ chế thông minh

| Loại đầu vào  | Cách xử lý                                   | Ví dụ                            |
| ------------- | -------------------------------------------- | -------------------------------- |
| **Từ đơn**    | Trả về kiểu _từ điển_: nghĩa, từ loại, ví dụ | `"run"` → _verb_: chạy, vận hành |
| **Cụm / câu** | Dịch tự nhiên sang ngôn ngữ đích             | `"run fast"` → "chạy nhanh"      |

---

## 🧑‍💻 5. Cấu trúc dự án

```
ai-translator-extension/
│
├── manifest.json         # Cấu hình extension
├── background.js         # Gửi yêu cầu dịch đến Google Gemini API
├── content.js            # Xử lý popup và sự kiện trên trang
├── content.css           # Giao diện popup & nút dịch
├── popup.html            # Giao diện trang cài đặt
├── popup.js              # Logic lưu & đọc API key, ngôn ngữ
```

---

## 🧰 6. Công nghệ sử dụng

-   **Google Gemini API** (`gemini-flash-latest`)
-   **Chrome Extension Manifest v3**
-   **HTML / CSS / JS thuần** (no framework)

---

## 🚀 7. Phím tắt mặc định

| Hành động            | Phím         |
| -------------------- | ------------ |
| Dịch nhanh đoạn chọn | `Ctrl+Alt+T` |

---

## 🛠 8. Gỡ lỗi / Developer Tips

-   Mở **DevTools** (`Ctrl + Shift + I`) → tab **Console** để xem log
-   Khi thay đổi mã nguồn → vào `chrome://extensions/` → **Reload (⟳)** lại extension
-   Nếu popup không hiện: kiểm tra xem `content.js` đã được inject chưa (tab Console)

---

## 🤝 9. Đóng góp

Nếu bạn có ý tưởng cải tiến (ví dụ: dịch song ngữ, lưu lịch sử, giọng đọc TTS, v.v.)
hãy tạo **issue** hoặc **pull request** tại repo này 💬

---

## 🧾 Giấy phép

**MIT License © 2025**
Tự do sử dụng, chỉnh sửa, phân phối, miễn là ghi nguồn gốc.
