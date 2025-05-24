import { useState, useEffect } from 'react';

export const useResponsiveSize = () => {
  const [cellSize, setCellSize] = useState(80);
  const [edgeThickness, setEdgeThickness] = useState(10);

  useEffect(() => {
    const updateSizes = () => {
      // 直接在 JS 中计算尺寸
      const indicatorHeight = window.innerHeight <= 600 ? 40 : 
                             window.innerWidth <= 768 ? 50 : 60;
      const padding = window.innerHeight <= 600 ? 16 :
                     window.innerWidth <= 768 ? 20 : 32;
      
      const availableHeight = window.innerHeight - indicatorHeight - padding;
      let newCellSize = Math.floor(availableHeight / 8);
      
      // 确保最小尺寸
      if (window.innerHeight <= 500) {
        newCellSize = Math.max(newCellSize, 60);
      }
      
      const newEdgeThickness = Math.max(Math.floor(newCellSize / 8), 8);
      
      setCellSize(newCellSize);
      setEdgeThickness(newEdgeThickness);
    };

    // 初始化
    updateSizes();

    // 监听窗口大小变化
    window.addEventListener('resize', updateSizes);
    
    return () => {
      window.removeEventListener('resize', updateSizes);
    };
  }, []);

  return { cellSize, edgeThickness };
};