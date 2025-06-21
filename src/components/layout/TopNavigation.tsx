
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Youtube, BarChart3, CreditCard, DollarSign } from 'lucide-react';

export const TopNavigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { 
      path: '/youtube-generator', 
      label: '블로그 글 유튜브 자동 생성', 
      icon: <Youtube className="h-4 w-4" /> 
    },
    { 
      path: '/infographic-generator', 
      label: '인포그래픽 생성', 
      icon: <BarChart3 className="h-4 w-4" /> 
    },
    { 
      path: '/pricing', 
      label: '가격', 
      icon: <DollarSign className="h-4 w-4" /> 
    },
    { 
      path: '/payment', 
      label: '결제', 
      icon: <CreditCard className="h-4 w-4" /> 
    },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center space-x-1 py-3">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              location.pathname === '/' 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-white hover:bg-white/20'
            }`}
          >
            홈
          </Link>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                location.pathname === item.path 
                  ? 'bg-white text-blue-600 shadow-md' 
                  : 'text-white hover:bg-white/20'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};
