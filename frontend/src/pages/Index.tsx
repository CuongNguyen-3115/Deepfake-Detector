import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Lock, Eye } from 'lucide-react';
import Header from '@/components/Header';
import TabSwitcher from '@/components/TabSwitcher';
import UploadZone from '@/components/UploadZone';
import BatchAnalysis from '@/components/BatchAnalysis';

const Index = () => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  const features = [
    { icon: Zap, label: 'Phân tích nhanh', desc: 'Dưới 2 giây' },
    { icon: Lock, label: 'Bảo mật cao', desc: 'Ảnh không lưu trữ' },
    { icon: Eye, label: 'Độ chính xác', desc: '96%' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 md:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6"
          >
            <Shield className="w-4 h-4" />
            <span>Công nghệ AI tiên tiến</span>
          </motion.div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Phát hiện{' '}
            <span className="text-gradient">Deepfake</span>
            {' '}tức thì
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Bảo vệ bạn khỏi hình ảnh giả mạo AI với công nghệ phân tích khuôn mặt tiên tiến nhất
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl shadow-sm"
              >
                <feature.icon className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{feature.label}</p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: activeTab === 'single' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'single' ? <UploadZone /> : <BatchAnalysis />}
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          🔒 Ảnh của bạn được xử lý an toàn và không được lưu trữ trên máy chủ
        </motion.p>
      </main>
    </div>
  );
};

export default Index;
