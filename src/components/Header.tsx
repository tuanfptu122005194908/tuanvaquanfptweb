import { ShoppingCart, User, Menu, X, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { User as UserType } from "@/types";
import logoAvatar from "@/assets/logo-avatar.png";

interface HeaderProps {
  cartCount: number;
  onCartClick: () => void;
  onLoginClick: () => void;
  onLogout: () => void;
  onOrdersClick: () => void;
  user: UserType | null;
}

const Header = ({ cartCount, onCartClick, onLoginClick, onLogout, onOrdersClick, user }: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { label: "Khóa học", href: "#courses" },
    { label: "Tiếng Anh", href: "#english" },
    { label: "Tài liệu", href: "#documents" },
    { label: "Coursera", href: "#coursera" },
    { label: "Liên hệ", href: "#contact" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <img 
              src={logoAvatar} 
              alt="Logo" 
              className="h-10 w-10 rounded-full shadow-glow group-hover:scale-110 transition-transform"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-primary bg-clip-text text-transparent">
                Học cùng Tuấn và Quân
              </h1>
              <p className="text-xs text-muted-foreground">Nền tảng học tập chất lượng</p>
            </div>
          </a>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* User Actions */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onOrdersClick}>
                  <Package className="h-4 w-4 mr-2" />
                  Đơn hàng
                </Button>
                <span className="text-sm font-medium">Xin chào, {user.name}</span>
                <Button variant="ghost" size="icon" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button className="hidden md:flex bg-gradient-primary" onClick={onLoginClick}>
                <User className="h-4 w-4 mr-2" />
                Đăng nhập
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 border-t">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {user ? (
              <>
                <button
                  onClick={() => {
                    onOrdersClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-medium hover:bg-muted rounded-lg transition-colors"
                >
                  Đơn hàng
                </button>
                <div className="px-4 py-2 text-sm">
                  <span className="font-medium">Xin chào, {user.name}</span>
                  <Button variant="ghost" size="sm" onClick={onLogout} className="ml-2">
                    Đăng xuất
                  </Button>
                </div>
              </>
            ) : (
              <button
                onClick={() => {
                  onLoginClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm font-medium bg-gradient-primary text-white rounded-lg"
              >
                Đăng nhập
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
