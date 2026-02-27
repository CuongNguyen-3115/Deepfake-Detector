# backend/main.py
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import tensorflow as tf
import numpy as np
import cv2
from PIL import Image
import io
import pandas as pd
import os

app = FastAPI()

# Cấu hình CORS (Cho phép Frontend gọi API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Đường dẫn tới file model
MODEL_PATH = "model_v9_efficientnet.keras"
model = None

@app.on_event("startup")
async def load_model():
    global model
    print(f"⏳ Đang tải mô hình từ: {MODEL_PATH}")
    if os.path.exists(MODEL_PATH):
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print("✅ Đã tải mô hình V9 EfficientNet thành công!")
        except Exception as e:
            print(f"❌ Lỗi tải model: {e}")
    else:
        print(f"❌ Không tìm thấy file {MODEL_PATH}. Hãy copy file vào thư mục backend/")

def preprocess_image(image_bytes):
    try:
        # 1. Đọc ảnh
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image = np.array(image)
        
        # 2. Phát hiện khuôn mặt
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return None, "Không tìm thấy khuôn mặt"
        
        # 3. Lấy mặt lớn nhất
        x, y, w, h = max(faces, key=lambda item: item[2] * item[3])
        face_crop = image[y:y+h, x:x+w]
        
        # 4. Resize về 256x256 (Chuẩn V9)
        face_resized = cv2.resize(face_crop, (256, 256))
        
        # 5. EfficientNet Preprocess
        img_array = tf.keras.applications.efficientnet.preprocess_input(face_resized)
        img_array = np.expand_dims(img_array, axis=0) # (1, 256, 256, 3)
        
        return img_array, (int(x), int(y), int(w), int(h))
    except Exception as e:
        return None, str(e)

@app.get("/")
def home():
    return {"status": "Backend is running", "model_loaded": model is not None}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None: return {"success": False, "error": "Model chưa được tải"}
    
    content = await file.read()
    processed_tensor, info = preprocess_image(content)
    
    if processed_tensor is None:
        return {"success": False, "error": info}
    
    prediction = model.predict(processed_tensor)
    score = float(prediction[0][0])
    
    # --- SỬA LOGIC DỰ ĐOÁN (Score > 0.5 là REAL) ---
    label = "REAL" if score > 0.5 else "FAKE"
    confidence = score if label == "REAL" else 1 - score
    # -----------------------------------------------
    
    return {
        "success": True,
        "label": label,
        "confidence": round(confidence * 100, 2),
        "bbox": info
    }

@app.post("/audit-batch")
async def audit_batch(files: list[UploadFile] = File(...)):
    if model is None: return {"success": False, "error": "Model chưa được tải"}
    
    results = []
    
    for file in files:
        content = await file.read()
        processed_tensor, info = preprocess_image(content)
        
        if processed_tensor is None:
            results.append({
                "Filename": file.filename,
                "Result": "Lỗi",
                "Confidence": "0%",
                "Note": info
            })
            continue
            
        prediction = model.predict(processed_tensor)
        score = float(prediction[0][0])
        
        # --- SỬA LOGIC DỰ ĐOÁN BATCH (Score > 0.5 là REAL) ---
        label = "REAL" if score > 0.5 else "FAKE"
        confidence = round((score if label == "REAL" else 1 - score) * 100, 2)
        # -----------------------------------------------------
        
        results.append({
            "Filename": file.filename,
            "Result": label,
            "Confidence": f"{confidence}%",
            "Note": "Cảnh báo" if label == "FAKE" else "An toàn"
        })
        
    df = pd.DataFrame(results)
    stream = io.BytesIO()
    df.to_csv(stream, index=False, encoding='utf-8-sig')
    stream.seek(0)
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=faceguard_report.csv"
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)