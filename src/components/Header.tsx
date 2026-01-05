import { ShoppingCart, User, Menu, X, LogOut, Package, Sparkles } from "lucide-react";
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
    { label: "Dịch vụ", href: "#english" },
    { label: "Tài liệu", href: "#documents" },
    { label: "Coursera", href: "#coursera" },
    { label: "Liên hệ", href: "#contact" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-strong">
      <div className="container-tight">
        <div className="flex h-18 py-4 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-primary rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
              <img 
                src={logoAvatar} 
                alt="Logo" 
                className="relative h-11 w-11 rounded-full ring-2 ring-primary/30 group-hover:ring-primary/60 transition-all"
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold font-display text-foreground flex items-center gap-2">
                Tuấn & Quân
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </h1>
              <p className="text-xs text-muted-foreground">Dịch vụ học tập chất lượng</p>
            </div>
          </a>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all duration-200"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              className="relative text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-accent text-primary-foreground text-xs font-bold flex items-center justify-center shadow-glow animate-pulse">
                  {cartCount}
                </span>
              )}
            </Button>

            {/* User Actions */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onOrdersClick} 
                  className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  <Package className="h-4 w-4 mr-2" />
                  Đơn hàng
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
                  <div className="h-7 w-7 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-foreground">{user.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onLogout} 
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button 
                className="hidden md:flex bg-gradient-primary hover:opacity-90 text-primary-foreground shadow-elegant"
                onClick={onLoginClick}
              >
                <User className="h-4 w-4 mr-2" />
                Đăng nhập
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground hover:text-foreground hover:bg-muted/50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-1 border-t border-border animate-slide-up">
            {menuItems.map((item, idx) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 border-t border-border mt-4">
              {user ? (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onOrdersClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Đơn hàng
                  </button>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-foreground">{user.name}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={onLogout} 
                      className="text-destructive hover:bg-destructive/10"
                    >
                      Đăng xuất
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    onLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground"
                >
                  <User className="h-4 w-4 mr-2" />
                  Đăng nhập
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;