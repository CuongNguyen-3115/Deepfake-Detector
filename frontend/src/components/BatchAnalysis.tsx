import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderUp, Play, Download, AlertTriangle, FileImage, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageFile {
  id: string;
  file: File; // <--- Thêm trường này để giữ file gốc
  name: string;
  preview: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  result?: {
    isFake: boolean;
    confidence: number;
    note?: string;
  };
}

interface BatchResult {
  total: number;
  real: number;
  fake: number;
  fakeImages: ImageFile[];
  csvBlob?: Blob; // Lưu file báo cáo trả về từ server
}

const BatchAnalysis = () => {
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [result, setResult] = useState<BatchResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fileList: FileList) => {
    const imageFiles = Array.from(fileList).filter(file => 
      file.type.startsWith('image/')
    );

    const newFiles: ImageFile[] = imageFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file: file, // Giữ file gốc
      name: file.name,
      preview: URL.createObjectURL(file),
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setResult(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const items = e.dataTransfer.items;
    if (items) {
      const fileList: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) fileList.push(file);
        }
      }
      if (fileList.length > 0) {
        const dt = new DataTransfer();
        fileList.forEach(f => dt.items.add(f));
        handleFiles(dt.files);
      }
    }
  }, [handleFiles]);

  const clearFiles = () => {
    files.forEach(file => URL.revokeObjectURL(file.preview));
    setFiles([]);
    setResult(null);
    setLogs([]);
    setProgress(0);
  };

  const startAnalysis = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    setLogs([]);
    setResult(null);

    const formData = new FormData();
    files.forEach(f => {
      formData.append("files", f.file);
    });

    try {
      setLogs(prev => [...prev, "Đang gửi dữ liệu lên Server..."]);
      
      // Gọi API Batch Audit
      // Lưu ý: API này trả về file CSV (StreamingResponse)
      // Nhưng để update UI realtime từng ảnh, ta nên gọi từng ảnh một hoặc sửa API.
      // Tuy nhiên, để đơn giản và đúng logic "Batch" doanh nghiệp, ta gửi 1 lần và chờ kết quả.
      
      // GỌI API
      const response = await fetch("http://localhost:8000/audit-batch", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Lỗi Server");

      // Nhận file CSV trả về
      const blob = await response.blob();
      const text = await blob.text(); // Đọc nội dung CSV để parse ra kết quả hiển thị
      
      // Parse CSV đơn giản để hiển thị lên UI
      // CSV format: Filename,Result,Confidence,Note
      const rows = text.split('\n').slice(1); // Bỏ header
      let fakeCount = 0;
      const updatedFiles = [...files];

      rows.forEach(row => {
        if (!row.trim()) return;
        const [filename, resLabel, confStr] = row.split(',');
        const targetFile = updatedFiles.find(f => f.name === filename);
        
        if (targetFile) {
            const isFake = resLabel === "FAKE";
            const confidence = parseFloat(confStr?.replace('%', '') || "0");
            
            targetFile.status = 'done';
            targetFile.result = { isFake, confidence };
            
            if (isFake) fakeCount++;
            
            setLogs(prev => [...prev, `${isFake ? '🚨' : '✅'} ${filename}: ${resLabel} (${confidence}%)`]);
        }
      });
      
      setFiles(updatedFiles);
      setResult({
        total: files.length,
        real: files.length - fakeCount,
        fake: fakeCount,
        fakeImages: updatedFiles.filter(f => f.result?.isFake),
        csvBlob: blob // Lưu blob để tải xuống sau
      });
      
      setProgress(100);
      setLogs(prev => [...prev, "🏁 Hoàn tất quá trình quét!"]);

    } catch (error) {
      console.error(error);
      setLogs(prev => [...prev, "❌ Lỗi: Không thể kết nối tới Backend."]);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportReport = () => {
    if (!result?.csvBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(result.csvBlob);
    link.download = `faceguard_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // ... (Phần return JSX GIỮ NGUYÊN như file cũ của bạn, vì logic hiển thị không đổi)
  // Chỉ lưu ý: Đảm bảo biến result.csvBlob được dùng trong exportReport
  return (
      // Copy phần return JSX từ file cũ của bạn vào đây
      // ...
      <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-4xl mx-auto space-y-6"
    >
      {/* Upload Zone */}
      {files.length === 0 && (
        <div
          className="upload-zone cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center py-8">
            <motion.div
              className="p-4 bg-primary/10 rounded-2xl mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <FolderUp className="w-12 h-12 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Tải lên nhiều ảnh
            </h3>
            <p className="text-muted-foreground text-sm mb-2">
              Kéo thả thư mục hoặc chọn nhiều file cùng lúc
            </p>
            <p className="text-xs text-muted-foreground/70">
              Hỗ trợ: JPG, PNG, WEBP
            </p>
          </div>
        </div>
      )}

      {/* Files Selected */}
      {files.length > 0 && !isProcessing && !result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <FileImage className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Đã chọn {files.length} ảnh
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sẵn sàng để phân tích
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={clearFiles} className="text-muted-foreground">
              Xóa tất cả
            </Button>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-6 md:grid-cols-10 gap-2 mb-6 max-h-32 overflow-y-auto">
            {files.slice(0, 20).map((file) => (
              <div key={file.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={file.preview} alt={file.name} className="w-full h-full object-cover" />
              </div>
            ))}
            {files.length > 20 && (
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">+{files.length - 20}</span>
              </div>
            )}
          </div>

          <Button onClick={startAnalysis} className="w-full btn-primary h-12 text-base font-semibold rounded-xl">
            <Play className="w-5 h-5 mr-2" />
            Bắt đầu Quét
          </Button>
        </motion.div>
      )}

      {/* Processing State */}
      {isProcessing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <h3 className="font-semibold text-foreground">Đang phân tích...</h3>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{currentFile}</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Logs */}
          <div className="bg-muted/50 rounded-xl p-4 max-h-40 overflow-y-auto font-mono text-xs space-y-1">
            {logs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-muted-foreground"
              >
                {log}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="glass-card rounded-2xl p-5 text-center"
              >
                <p className="text-3xl font-bold text-foreground">{result.total}</p>
                <p className="text-sm text-muted-foreground mt-1">Tổng số ảnh</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-2xl p-5 text-center border-2 border-success/30"
              >
                <p className="text-3xl font-bold text-success">{result.real}</p>
                <p className="text-sm text-muted-foreground mt-1">Ảnh REAL</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-2xl p-5 text-center border-2 border-fake/30"
              >
                <p className="text-3xl font-bold text-fake">{result.fake}</p>
                <p className="text-sm text-muted-foreground mt-1">Ảnh FAKE</p>
              </motion.div>
            </div>

            {/* Fake Images Table */}
            {result.fakeImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-fake" />
                  <h3 className="font-semibold text-foreground">
                    Ảnh Deepfake phát hiện ({result.fakeImages.length})
                  </h3>
                </div>
                <div className="divide-y divide-border">
                  {result.fakeImages.map((file, index) => (
                    <motion.div
                      key={file.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Độ tin cậy: {file.result?.confidence}%
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-fake/10 text-fake rounded-full text-sm font-medium">
                        FAKE
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Export Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex gap-4"
            >
              <Button
                onClick={exportReport}
                className="flex-1 btn-primary h-12 text-base font-semibold rounded-xl"
              >
                <Download className="w-5 h-5 mr-2" />
                Tải báo cáo chi tiết (.CSV)
              </Button>
              <Button
                onClick={clearFiles}
                variant="outline"
                className="h-12 px-6 rounded-xl"
              >
                Quét lại
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BatchAnalysis;