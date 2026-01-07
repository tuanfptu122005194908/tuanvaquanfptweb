import { ShoppingCart, User, Menu, X, LogOut, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { User as UserType } from "@/types";
import logoAvatar from "@/assets/logo-avatar.png";
import { ThemeToggle } from "@/components/ThemeToggle";

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
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container-tight">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <img 
              src={logoAvatar} 
              alt="Logo" 
              className="h-10 w-10 rounded-full"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold font-display text-foreground">Tuấn & Quân</h1>
              <p className="text-xs text-muted-foreground">Dịch vụ học tập FPT</p>
            </div>
          </a>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Button>

            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onOrdersClick}>
                  <Package className="h-4 w-4 mr-2" />
                  Đơn hàng
                </Button>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={onLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground" onClick={onLoginClick}>
                <User className="h-4 w-4 mr-2" />
                Đăng nhập
              </Button>
            )}

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
          <div className="md:hidden py-4 space-y-1 border-t border-border">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="pt-4 border-t border-border mt-4">
              {user ? (
                <div className="space-y-2">
                  <button onClick={() => { onOrdersClick(); setMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Đơn hàng
                  </button>
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={onLogout} className="text-destructive">Đăng xuất</Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => { onLoginClick(); setMobileMenuOpen(false); }} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
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