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
      {/* Main Search Container */}
      <div className={cn(
        "relative transition-all duration-300",
        isFocused && "scale-[1.02]"
      )}>
        {/* Glow effect */}
        <div className={cn(
          "absolute -inset-1 rounded-2xl bg-gradient-primary opacity-0 blur-xl transition-all duration-300",
          isFocused && "opacity-40"
        )} />
        
        {/* Search Box */}
        <div className={cn(
          "relative glass rounded-2xl border transition-all duration-300",
          isFocused 
            ? "border-primary/50 shadow-elegant" 
            : "border-border/50 hover:border-primary/30"
        )}>
          <div className="flex items-center px-2">
            {/* Search Icon */}
            <div className="flex items-center justify-center w-12 h-14">
              <Search className={cn(
                "h-5 w-5 transition-colors duration-300",
                isFocused ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            
            {/* Input */}
            <Input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm mã môn: PRO192, MAE101..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="flex-1 h-14 text-base border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            />
            
            {/* Clear button */}
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="mr-2 p-2 rounded-lg bg-muted/50 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper tags */}
      <div className="flex items-center justify-center gap-4 mt-4">
        {Object.entries(typeLabels).map(([type, label]) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <div className={cn("w-2 h-2 rounded-full", typeColors[type]?.bg.replace('/10', ''))} 
                 style={{ background: type === 'course' ? 'hsl(270 95% 65%)' : 
                          type === 'document' ? 'hsl(215 100% 60%)' : 
                          type === 'english' ? 'hsl(330 90% 60%)' : 'hsl(155 70% 50%)' }} />
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