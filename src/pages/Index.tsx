import { useState } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import CourseSection from "@/components/CourseSection";
import EnglishSection from "@/components/EnglishSection";
import DocumentSection from "@/components/DocumentSection";
import CourseraSection from "@/components/CourseraSection";
import ContactSection from "@/components/ContactSection";
import CartModal from "@/components/CartModal";
import LoginModal from "@/components/LoginModal";
import RegisterModal from "@/components/RegisterModal";
import OrderHistoryModal from "@/components/OrderHistoryModal";
import { useAuth } from "@/contexts/AuthContext";
import type { CartItem } from "@/hooks/useOrders";

const Index = () => {
  const { user, profile, signOut } = useAuth();
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  const addToCart = (item: CartItem) => {
    const newCart = [...cart, item];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.setItem('cart', JSON.stringify([]));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartCount={cart.length}
        onCartClick={() => setShowCart(true)}
        onLoginClick={() => setShowLogin(true)}
        onLogout={signOut}
        onOrdersClick={() => setShowOrders(true)}
        user={user ? { name: profile?.name || 'User', email: user.email || '' } : null}
      />
      
      <Hero />
      <CourseSection onAddToCart={addToCart} />
      <EnglishSection onAddToCart={addToCart} />
      <DocumentSection onAddToCart={addToCart} />
      <CourseraSection onAddToCart={addToCart} />
      <ContactSection />

      <CartModal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        cart={cart}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
      />

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={() => {
          setShowLogin(false);
          setShowRegister(true);
        }}
      />

      <RegisterModal
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={() => {
          setShowRegister(false);
          setShowLogin(true);
        }}
      />

      <OrderHistoryModal
        isOpen={showOrders}
        onClose={() => setShowOrders(false)}
      />
    </div>
  );
};

export default Index;
