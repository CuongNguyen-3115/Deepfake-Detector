import { motion } from 'framer-motion';
import { Image, Layers } from 'lucide-react';

interface TabSwitcherProps {
  activeTab: 'single' | 'batch';
  onTabChange: (tab: 'single' | 'batch') => void;
}

const TabSwitcher = ({ activeTab, onTabChange }: TabSwitcherProps) => {
  const tabs = [
    { id: 'single' as const, label: 'Kiểm tra ảnh', icon: Image },
    { id: 'batch' as const, label: 'Kiểm tra hàng loạt', icon: Layers },
  ];

  return (
    <div className="flex justify-center mb-8">
      <div className="inline-flex bg-muted p-1.5 rounded-2xl gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
              activeTab === tab.id ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-xl shadow-lg"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <tab.icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabSwitcher;
