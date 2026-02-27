# FACEGUARD AI: DEEPFAKE IMAGE DETECTION SYSTEM

## PROJECT OVERVIEW
FaceGuard AI là một hệ thống phát hiện hình ảnh giả mạo (Deepfake) dựa trên các mô hình học sâu. Dự án được nghiên cứu và phát triển trong khuôn khổ Đồ án môn học tại Khoa Toán - Tin, Đại học Bách khoa Hà Nội (HUST). Mục tiêu chính của dự án là cung cấp một công cụ phân tích độ tin cậy của hình ảnh khuôn mặt, giúp người dùng nhận biết các nội dung được tạo ra bởi trí tuệ nhân tạo nhằm giảm thiểu các rủi ro về lừa đảo trực tuyến.

## KEY FEATURES
- Single Image Analysis: Hỗ trợ người dùng tải lên và phân tích một hình ảnh duy nhất để xác định tính xác thực (Real hoặc Fake).
- Confidence Scoring: Cung cấp tỷ lệ phần trăm tin cậy cho từng kết quả dự đoán, giúp người dùng có cái nhìn khách quan về độ chính xác của mô hình.
- Batch Processing: Tính năng quét và phân tích đồng thời nhiều khuôn mặt trong cùng một phiên làm việc, tối ưu hóa thời gian xử lý dữ liệu.
- Result Management: Giao diện theo dõi tiến trình trực quan và bảng tổng hợp kết quả chi tiết cho các tác vụ phân tích hàng loạt.

## TECHNICAL SPECIFICATIONS
### Artificial Intelligence & Backend
- Model Architecture: Convolutional Neural Network (CNN) - Kiến trúc EfficientNet (phiên bản v9).
- Framework: TensorFlow.
- Language: Python.
- Performance: Mô hình đạt độ chính xác (Accuracy) 96% trên tập dữ liệu kiểm thử độc lập.

### Frontend Development
- Library: React.js.
- Build Tool: Vite.
- Styling: Tailwind CSS.

## DATASET AND TRAINING
Dự án sử dụng bộ dữ liệu "140k Real and Fake Faces" từ nền tảng Kaggle để huấn luyện và đánh giá.
- Quy mô mẫu trích xuất: 7,000 hình ảnh chất lượng cao.
- Phân tách dữ liệu:
  - Training set: 5,000 ảnh (Dùng để huấn luyện mô hình).
  - Validation set: 1,000 ảnh (Dùng để tối ưu hóa tham số).
  - Test set: 1,000 ảnh (Dùng để đánh giá khách quan hiệu năng).
- Mã nguồn huấn luyện chi tiết và quy trình xử lý dữ liệu được lưu trữ tại thư mục /Model dưới dạng file Notebook (.ipynb).

## SYSTEM INTERFACE
Dưới đây là các hình ảnh minh họa giao diện hoạt động của hệ thống:

- Trang chủ ứng dụng: ![Main Interface](./Assets/image1.png)
- Giao diện tải ảnh đơn: ![Single Upload](./Assets/image2.jfif)
- Kết quả phân tích chi tiết: ![Analysis Result](./Assets/image3.jfif)
- Giao diện quét hàng loạt: ![Batch Scan](./Assets/image4.jfif)
- Tiến trình xử lý dữ liệu: ![Processing Task](./Assets/image5.jfif)
- Danh sách kết quả tổng hợp: ![Result List](./Assets/image6.jfif)
- Tính năng xuất báo cáo: ![Export Report](./Assets/image7.jfif)

## INSTALLATION AND SETUP

### Prerequisites
- Python 3.9 hoặc phiên bản mới hơn.
- Node.js và quản lý gói npm.

### Backend Setup
1. Truy cập vào thư mục backend:
   cd backend
2. Cài đặt các thư viện phụ thuộc:
   pip install -r requirements.txt
3. Khởi chạy máy chủ API:
   python main.py

### Frontend Setup
1. Truy cập vào thư mục frontend:
   cd frontend
2. Cài đặt các gói thư viện cần thiết:
   npm install
3. Khởi chạy ứng dụng trong môi trường phát triển:
   npm run dev

## PROJECT STRUCTURE
- /Model: Chứa bộ dữ liệu mẫu, mã nguồn huấn luyện (.ipynb) và tệp mô hình trọng số đã đóng gói (.keras).
- /backend: Mã nguồn xử lý các điểm cuối API và logic dự báo của mô hình Deep Learning.
- /frontend: Mã nguồn giao diện người dùng, được cấu trúc theo các thành phần (components) của React.
- /assets: Thư mục lưu trữ hình ảnh minh họa cho tài liệu hướng dẫn.

## AUTHOR INFORMATION
- Họ và tên: Nguyễn Tiến Cường.
- Đơn vị: Khoa Toán - Tin, Đại học Bách Khoa Hà Nội (HUST).
- Chuyên ngành: Toán - Tin.
- Lĩnh vực quan tâm: Artificial Intelligence, Machine Learning, Deep Learning, Data Scince.
