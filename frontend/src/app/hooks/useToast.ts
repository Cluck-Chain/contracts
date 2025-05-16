type ToastType = 'success' | 'error' | 'info' | 'warning';

export function useToast() {
  const showToast = (message: string, type: ToastType = 'info') => {
    // 目前使用alert，后续可以替换为更好的toast组件
    if (type === 'error') {
      alert(`错误: ${message}`);
    } else if (type === 'success') {
      alert(`成功: ${message}`);
    } else {
      alert(message);
    }
  };

  return {
    showToast,
    showSuccess: (message: string) => showToast(message, 'success'),
    showError: (message: string) => showToast(message, 'error'),
    showInfo: (message: string) => showToast(message, 'info'),
    showWarning: (message: string) => showToast(message, 'warning')
  };
} 