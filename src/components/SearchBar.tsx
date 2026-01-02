import { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, FileText, Globe, Award, Sparkles, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProducts, Product } from '@/hooks/useProducts';
import { cn } from '@/lib/utils';

import type { CartItem } from '@/hooks/useOrders';

interface SearchBarProps {
  onAddToCart: (item: CartItem) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  course: <BookOpen className="h-5 w-5 text-violet-500" />,
  document: <FileText className="h-5 w-5 text-emerald-500" />,
  english: <Globe className="h-5 w-5 text-blue-500" />,
  coursera: <Award className="h-5 w-5 text-orange-500" />,
};

const typeLabels: Record<string, string> = {
  course: 'Khóa học',
  document: 'Tài liệu',
  english: 'Tiếng Anh',
  coursera: 'Coursera',
};

const typeColors: Record<string, string> = {
  course: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  document: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  english: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  coursera: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
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
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-3xl mx-auto">
      {/* Main Search Container */}
      <div className={cn(
        "relative transition-all duration-500 ease-out",
        isFocused && "scale-[1.02]"
      )}>
        {/* Animated glow background */}
        <div className={cn(
          "absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-0 blur-xl transition-all duration-500",
          isFocused && "opacity-60 animate-pulse"
        )} />
        
        {/* Subtle static glow */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-pink-500/20 blur-md" />
        
        {/* Search Box */}
        <div className={cn(
          "relative bg-card rounded-2xl border-2 transition-all duration-300 shadow-xl",
          isFocused 
            ? "border-primary/50 shadow-primary/20 shadow-2xl" 
            : "border-border/50 hover:border-primary/30"
        )}>
          <div className="flex items-center px-2">
            {/* Search Icon with animation */}
            <div className={cn(
              "flex items-center justify-center w-14 h-16 transition-all duration-300",
              isFocused && "scale-110"
            )}>
              <div className="relative">
                <Search className={cn(
                  "h-6 w-6 transition-colors duration-300",
                  isFocused ? "text-primary" : "text-muted-foreground"
                )} />
                {isFocused && (
                  <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 animate-pulse" />
                )}
              </div>
            </div>
            
            {/* Input */}
            <Input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm mã môn: PRO192, MAE101, MAD101..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              className="flex-1 h-16 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            />
            
            {/* Clear button */}
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="mr-3 p-2.5 rounded-xl bg-muted/80 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 hover:scale-105"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper text */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <span>Khóa học</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Tài liệu</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Tiếng Anh</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Coursera</span>
        </div>
      </div>

      {/* Results Dropdown */}
      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          {/* Results header */}
          <div className="px-5 py-3 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border-b border-border/50">
            <p className="text-sm font-medium text-foreground">
              Tìm thấy <span className="text-primary font-bold">{filteredProducts.length}</span> kết quả
            </p>
          </div>
          
          {/* Results list */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredProducts.map((product, index) => (
              <button
                key={product.id}
                onClick={() => handleSelect(product)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200 group",
                  "hover:bg-gradient-to-r hover:from-violet-500/5 hover:via-purple-500/5 hover:to-pink-500/5",
                  index !== filteredProducts.length - 1 && "border-b border-border/30"
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon */}
                <div className={cn(
                  "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                  typeColors[product.type]?.split(' ')[0] || 'bg-muted'
                )}>
                  {typeIcons[product.type] || <BookOpen className="h-5 w-5" />}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {product.code}
                    </span>
                    <span className={cn(
                      "text-xs px-2.5 py-1 rounded-full font-medium",
                      typeColors[product.type] || 'bg-muted text-muted-foreground'
                    )}>
                      {typeLabels[product.type] || product.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate group-hover:text-foreground/80 transition-colors">
                    {product.name}
                  </p>
                </div>
                
                {/* Price */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    {product.price.toLocaleString()}₫
                  </p>
                  <p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    Click để thêm
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {isOpen && query.trim().length > 0 && filteredProducts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-card border border-border/50 rounded-2xl shadow-2xl z-50 p-8 text-center animate-fade-in">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <p className="text-lg font-medium text-foreground mb-1">
            Không tìm thấy kết quả
          </p>
          <p className="text-sm text-muted-foreground">
            Không có kết quả cho "<span className="text-foreground font-medium">{query}</span>"
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Thử tìm với mã môn hoặc tên môn khác
          </p>
        </div>
      )}
    </div>
  );
}
