
export const getColors = (theme: string) => {
    const colorMap: { [key: string]: any } = {
      'blue-gray': { primary: '#1a73e8', secondary: '#f5f5f5', textHighlight: '#e8f4fd', highlight: '#e8f4fd', highlightBorder: '#1a73e8', warnBg: '#ffebee', warnBorder: '#f44336', link: '#1a73e8' },
      'green-orange': { primary: '#059669', secondary: '#f0fdf4', textHighlight: '#dcfce7', highlight: '#f1f8e9', highlightBorder: '#10b981', warnBg: '#fed7aa', warnBorder: '#e11d48', link: '#16a34a' },
      'purple-yellow': { primary: '#7c3aed', secondary: '#fefce8', textHighlight: '#f3e8ff', highlight: '#faf5ff', highlightBorder: '#9333ea', warnBg: '#fff1f2', warnBorder: '#e91e63', link: '#8b5cf6' },
      'teal-light-gray': { primary: '#0d9488', secondary: '#f8fafc', textHighlight: '#ccfbf1', highlight: '#f0fdfa', highlightBorder: '#14b8a6', warnBg: '#fffde7', warnBorder: '#ffeb3b', link: '#0d9488' },
      'terracotta-light-gray': { primary: '#e57373', secondary: '#fafafa', textHighlight: '#ffebee', highlight: '#fff8e1', highlightBorder: '#ffab91', warnBg: '#fce4ec', warnBorder: '#e11d48', link: '#e57373' },
      'classic-blue': { primary: '#1a73e8', secondary: '#f5f5f5', textHighlight: '#fffde7', highlight: '#e8f4fd', highlightBorder: '#1a73e8', warnBg: '#ffebee', warnBorder: '#f44336', link: '#1a73e8' },
      'nature-green': { primary: '#4caf50', secondary: '#f1f8e9', textHighlight: '#e8f5e9', highlight: '#f1f8e9', highlightBorder: '#81c784', warnBg: '#fff3e0', warnBorder: '#ff9800', link: '#4caf50' },
      'royal-purple': { primary: '#673ab7', secondary: '#f3e5f5', textHighlight: '#ede7f6', highlight: '#f3e5f5', highlightBorder: '#9575cd', warnBg: '#fce4ec', warnBorder: '#e91e63', link: '#673ab7' },
      'future-teal': { primary: '#009688', secondary: '#e0f2f1', textHighlight: '#b2dfdb', highlight: '#e0f2f1', highlightBorder: '#4db6ac', warnBg: '#fffde7', warnBorder: '#ffeb3b', link: '#009688' },
      'earth-terracotta': { primary: '#ff7043', secondary: '#fbe9e7', textHighlight: '#ffccbc', highlight: '#fbe9e7', highlightBorder: '#ff8a65', warnBg: '#fff9c4', warnBorder: '#fdd835', link: '#ff7043' }
    };
    return colorMap[theme] || colorMap['classic-blue'];
};

