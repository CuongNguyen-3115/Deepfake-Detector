import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CloudUpload, X, ScanFace, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalysisResult {
  isFake: boolean;
  confidence: number;
}

const UploadZone = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setFileName(file.name);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setFileName('');
    setResult(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

// Trong src/components/UploadZone.tsx

// ... (Giữ nguyên các import và state)

// HÀM MỚI: Gọi API thay vì random
  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setResult(null);

    try {
      // 1. Chuyển base64 image thành File object để gửi đi
      const fetchResponse = await fetch(selectedImage);
      const blob = await fetchResponse.blob();
      const file = new File([blob], fileName, { type: blob.type });

      // 2. Tạo FormData
      const formData = new FormData();
      formData.append("file", file);

      // 3. Gọi API Python
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          isFake: data.label === "FAKE",
          confidence: data.confidence
        });
      } else {
        alert("Lỗi: " + data.error); // Ví dụ: Không tìm thấy mặt
      }
    } catch (error) {
      console.error("Lỗi kết nối Server:", error);
      alert("Không thể kết nối tới Backend Python (Kiểm tra xem đã chạy main.py chưa?)");
    } finally {
      setIsAnalyzing(false);
    }
  };

// ... (Phần return JSX giữ nguyên)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <AnimatePresence mode="wait">
        {!selectedImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`upload-zone ${isDragging ? 'upload-zone-active' : ''} cursor-pointer`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center py-8">
              <motion.div
                animate={{ y: isDragging ? -10 : 0 }}
                className="p-4 bg-primary/10 rounded-2xl mb-4"
              >
                <CloudUpload className="w-12 h-12 text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Kéo thả ảnh vào đây
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                hoặc nhấp để chọn file
              </p>
              <p className="text-xs text-muted-foreground/70">
                Hỗ trợ: JPG, PNG, WEBP (Tối đa 10MB)
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Image Preview */}
            <div className="relative">
              <button
                onClick={clearImage}
                className="absolute top-4 right-4 z-10 p-2 bg-foreground/80 hover:bg-foreground text-background rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="relative overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-64 md:h-80 object-cover"
                />
                
                {/* Scanning Animation */}
                {isAnalyzing && (
                  <div className="absolute inset-0 overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 w-full scan-animation"
                      initial={{ x: '-100%' }}
                      animate={{ x: '100%' }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    />
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="p-4 bg-primary/20 rounded-full backdrop-blur-sm"
                      >
                        <ScanFace className="w-10 h-10 text-primary" />
                      </motion.div>
                    </div>
                  </div>
                )}
              </div>
              
              <p className="px-4 py-3 text-sm text-muted-foreground border-t border-border bg-muted/30 truncate">
                📁 {fileName}
              </p>
            </div>

            {/* Analysis Button & Result */}
            <div className="p-6">
              {!result && !isAnalyzing && (
                <Button
                  onClick={analyzeImage}
                  className="w-full btn-primary h-12 text-base font-semibold rounded-xl"
                >
                  <ScanFace className="w-5 h-5 mr-2" />
                  Phân tích ngay
                </Button>
              )}

              {isAnalyzing && (
                <div className="text-center">
                  <p className="text-muted-foreground animate-pulse">
                    Đang phân tích khuôn mặt...
                  </p>
                </div>
              )}

              {/* Result Display */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Result Badge */}
                    <div className={`p-4 rounded-xl border-2 ${
                      result.isFake ? 'result-fake' : 'result-real'
                    }`}>
                      <div className="flex items-center gap-3">
                        {result.isFake ? (
                          <AlertTriangle className="w-8 h-8" />
                        ) : (
                          <CheckCircle className="w-8 h-8" />
                        )}
                        <div>
                          <h4 className="font-bold text-lg">
                            {result.isFake ? 'CẢNH BÁO DEEPFAKE' : 'XÁC THỰC AN TOÀN'}
                          </h4>
                          <p className="text-sm opacity-80">
                            {result.isFake 
                              ? 'Ảnh này có dấu hiệu bị chỉnh sửa bằng AI'
                              : 'Không phát hiện dấu hiệu giả mạo'
                            }
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Độ tin cậy</span>
                        <span className="font-semibold">
                          {result.confidence}%
                        </span>
                      </div>
                      <div className="h-3 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                          className={`h-full rounded-full ${
                            result.isFake ? 'bg-fake' : 'bg-success'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Try Again */}
                    <Button
                      onClick={clearImage}
                      variant="outline"
                      className="w-full h-11 rounded-xl"
                    >
                      Kiểm tra ảnh khác
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UploadZone;
