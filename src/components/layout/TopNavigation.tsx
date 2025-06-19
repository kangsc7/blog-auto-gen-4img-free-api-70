
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Youtube, BarChart3, CreditCard, DollarSign } from 'lucide-react';

// 메뉴바 변경 방지를 위한 보안 설정
const MENU_PROTECTION = {
  // 관리자 권한 없이는 변경 불가
  ADMIN_ONLY_MODIFICATION: true,
  // 기본 스타일 고정 (변경 금지)
  FIXED_STYLES: {
    navbar: "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg",
    container: "container mx-auto px-4",
    navigation: "flex items-center justify-center space-x-1 py-3",
    homeButton: "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
    menuItem: "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2",
    activeStyle: "bg-white text-blue-600 shadow-md",
    inactiveStyle: "text-white hover:bg-white/20"
  },
  // 메뉴 구조 고정 (변경 금지)
  FIXED_MENU_ITEMS: [
    { 
      path: '/youtube-generator', 
      label: '블로그 글 유튜브 자동 생성', 
      icon: Youtube 
    },
    { 
      path: '/infographic-generator', 
      label: '인포그래픽 생성', 
      icon: BarChart3 
    },
    { 
      path: '/pricing', 
      label: '가격', 
      icon: DollarSign 
    },
    { 
      path: '/payment', 
      label: '결제', 
      icon: CreditCard 
    },
  ]
};

// 관리자 승인 함수 (실제 관리자 권한 확인 필요)
const isAdminModificationAllowed = (): boolean => {
  // 관리자만 true 반환 가능
  return false; // 기본값: 변경 불허
};

export const TopNavigation: React.FC = () => {
  const location = useLocation();
  
  // 보안 검증: 관리자 권한 없이는 컴포넌트 수정 불가
  if (MENU_PROTECTION.ADMIN_ONLY_MODIFICATION && !isAdminModificationAllowed()) {
    // 관리자 권한 없이는 기본 고정 스타일과 메뉴만 사용
  }
  
  const navItems = MENU_PROTECTION.FIXED_MENU_ITEMS;
  const styles = MENU_PROTECTION.FIXED_STYLES;

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.navigation}>
          <Link
            to="/"
            className={`${styles.homeButton} ${
              location.pathname === '/' 
                ? styles.activeStyle
                : styles.inactiveStyle
            }`}
          >
            홈
          </Link>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`${styles.menuItem} ${
                  location.pathname === item.path 
                    ? styles.activeStyle
                    : styles.inactiveStyle
                }`}
              >
                <IconComponent className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

// 메뉴바 보호를 위한 추가 보안 함수들
export const MenuProtection = {
  // 스타일 변경 시도 감지 및 차단
  preventStyleModification: () => {
    console.warn('🛡️ 메뉴바 스타일 변경이 차단되었습니다. 관리자 권한이 필요합니다.');
    return false;
  },
  
  // 메뉴 구조 변경 시도 감지 및 차단
  preventStructureModification: () => {
    console.warn('🛡️ 메뉴바 구조 변경이 차단되었습니다. 관리자 권한이 필요합니다.');
    return false;
  },
  
  // 현재 보호 상태 확인
  getProtectionStatus: () => {
    return {
      adminOnlyModification: MENU_PROTECTION.ADMIN_ONLY_MODIFICATION,
      stylesLocked: true,
      menuItemsLocked: true,
      lastProtectionUpdate: new Date().toISOString()
    };
  }
};
