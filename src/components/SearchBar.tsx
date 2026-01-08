import { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, FileText, Globe, Award, Sparkles, X, ShoppingCart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProducts, Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import type { CartItem } from '@/hooks/useOrders';

interface SearchBarProps {
  onAddToCart: (item: CartItem) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  course: <BookOpen className="h-5 w-5" />,
  document: <FileText className="h-5 w-5" />,
  english: <Globe className="h-5 w-5" />,
  coursera: <Award className="h-5 w-5" />,
};

const typeLabels: Record<string, string> = {
  course: 'Khóa học',
  document: 'Tài liệu',
  english: 'Tiếng Anh',
  coursera: 'Coursera',
};

const typeColors: Record<string, { bg: string; text: string; icon: string }> = {
  course: { bg: 'bg-primary/10', text: 'text-primary', icon: 'text-primary' },
  document: { bg: 'bg-secondary/10', text: 'text-secondary', icon: 'text-secondary' },
  english: { bg: 'bg-accent/10', text: 'text-accent', icon: 'text-accent' },
  coursera: { bg: 'bg-success/10', text: 'text-success', icon: 'text-success' },
};

export function SearchBar({ onAddToCart }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const { products } = useProducts();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      const searchTerm = query.toLowerCase().trim();
      const results = products.filter(
        (p) =>
          p.code.toLowerCase().includes(searchTerm) ||
          p.name.toLowerCase().includes(searchTerm)
      );
      setFilteredProducts(results.slice(0, 8));
      setIsOpen(true);
    } else {
      setFilteredProducts([]);
      setIsOpen(false);
    }
  }, [query, products]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (product: Product) => {
    onAddToCart({
      id: product.id,
      code: product.code,
      name: product.name,
      price: product.price,
      type: product.type as CartItem['type'],
    });
    toast.success(`Đã thêm ${product.code || product.name} vào giỏ hàng!`);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Highlight Label */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
        <span className="text-sm font-semibold text-primary uppercase tracking-wide">
          Tìm kiếm nhanh
        </span>
        <Sparkles className="h-5 w-5 text-primary animate-pulse" />
      </div>

      {/* Main Search Container */}
      <div className={cn(
        "relative transition-all duration-300",
        isFocused && "scale-[1.02]"
      )}>
        {/* Animated glow effect - always visible */}
        <div className={cn(
          "absolute -inset-2 rounded-3xl transition-all duration-500",
          "bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_3s_ease-in-out_infinite]",
          isFocused ? "opacity-60 blur-xl" : "opacity-30 blur-lg"
        )} />
        
        {/* Pulsing ring */}
        <div className="absolute -inset-1 rounded-2xl border-2 border-primary/40 animate-pulse" />
        
        {/* Search Box */}
        <div className={cn(
          "relative bg-background rounded-2xl border-2 transition-all duration-300",
          isFocused 
            ? "border-primary shadow-[0_0_30px_rgba(139,92,246,0.3)]" 
            : "border-primary/50 hover:border-primary shadow-[0_0_20px_rgba(139,92,246,0.15)]"
        )}>
          <div className="flex items-center px-3">
            {/* Search Icon */}
            <div className="flex items-center justify-center w-12 h-16">
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isFocused ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
              )}>
                <Search className="h-5 w-5" />
              </div>
            </div>
            
            {/* Input */}
            <Input
              ref={inputRef}
              type="text"
              placeholder="🔍 Nhập mã môn: PRO192, MAE101, CSD201..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="flex-1 h-16 text-lg font-medium border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            />
            
            {/* Clear button */}
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="mr-2 p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            {/* Search button */}
            {!query && (
              <div className="mr-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
                Tìm
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Helper tags with better visibility */}
      <div className="flex items-center justify-center gap-3 mt-5 flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">Danh mục:</span>
        {Object.entries(typeLabels).map(([type, label]) => (
          <div 
            key={type} 
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all hover:scale-105 cursor-default",
              typeColors[type]?.bg, typeColors[type]?.text
            )}
          >
            <span className={typeColors[type]?.icon}>{typeIcons[type]}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Results Dropdown */}
      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 glass rounded-2xl shadow-elegant z-50 overflow-hidden animate-scale-in">
          {/* Results header */}
          <div className="px-4 py-3 border-b border-border/50 bg-muted/30">
            <p className="text-sm font-medium text-muted-foreground">
              Tìm thấy <span className="text-primary font-bold">{filteredProducts.length}</span> kết quả
            </p>
          </div>
          
          {/* Results list */}
          <div className="max-h-[350px] overflow-y-auto">
            {filteredProducts.map((product, index) => {
              const colors = typeColors[product.type] || typeColors.course;
              
              return (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 text-left transition-all duration-200 group",
                    "hover:bg-muted/50",
                    index !== filteredProducts.length - 1 && "border-b border-border/30"
                  )}
                >
                  {/* Icon */}
                  <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110",
                    colors.bg
                  )}>
                    <span className={colors.icon}>
                      {typeIcons[product.type]}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {product.code}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full font-medium",
                        colors.bg, colors.text
                      )}>
                        {typeLabels[product.type]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {product.name}
                    </p>
                  </div>
                  
                  {/* Price & Action */}
                  <div className="flex-shrink-0 flex items-center gap-3">
                    <span className="text-lg font-bold gradient-text">
                      {product.price.toLocaleString()}đ
                    </span>
                    <div className="p-2 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ShoppingCart className="h-4 w-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {isOpen && query.trim().length > 0 && filteredProducts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 glass rounded-2xl shadow-elegant z-50 p-8 text-center animate-scale-in">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Search className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="font-medium text-foreground mb-1">
            Không tìm thấy kết quả
          </p>
          <p className="text-sm text-muted-foreground">
            Thử tìm với mã môn hoặc tên môn khác
          </p>
        </div>
      )}
    </div>
  );
}