import { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, FileText, Globe, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProducts, Product } from '@/hooks/useProducts';

import type { CartItem } from '@/hooks/useOrders';

interface SearchBarProps {
  onAddToCart: (item: CartItem) => void;
}

const typeIcons: Record<string, React.ReactNode> = {
  course: <BookOpen className="h-4 w-4 text-primary" />,
  document: <FileText className="h-4 w-4 text-green-500" />,
  english: <Globe className="h-4 w-4 text-blue-500" />,
  coursera: <Award className="h-4 w-4 text-orange-500" />,
};

const typeLabels: Record<string, string> = {
  course: 'Khóa học',
  document: 'Tài liệu',
  english: 'Tiếng Anh',
  coursera: 'Coursera',
};

export function SearchBar({ onAddToCart }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const { products } = useProducts();
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        {/* Glow effect background */}
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
        
        {/* Search container */}
        <div className="relative bg-background rounded-xl p-1">
          <div className="relative flex items-center bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 dark:from-pink-950/30 dark:via-purple-950/30 dark:to-blue-950/30 rounded-lg">
            <div className="flex items-center justify-center w-14 h-14">
              <Search className="h-6 w-6 text-primary animate-bounce" />
            </div>
            <Input
              type="text"
              placeholder="🔍 Tìm kiếm mã môn: PRO192, MAE101, MAD101..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 h-14 text-lg border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/70"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="mr-3 p-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <span className="text-muted-foreground">✕</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-center text-sm text-muted-foreground mt-3">
        Nhập mã môn hoặc tên môn để tìm khóa học, tài liệu, tiếng Anh, Coursera...
      </p>

      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-card border-2 border-primary/20 rounded-xl shadow-2xl z-50 overflow-hidden backdrop-blur-sm">
          <div className="p-2 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10 border-b border-border">
            <p className="text-xs text-muted-foreground text-center">
              Tìm thấy {filteredProducts.length} kết quả - Click để thêm vào giỏ hàng
            </p>
          </div>
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gradient-to-r hover:from-pink-500/10 hover:via-purple-500/10 hover:to-blue-500/10 transition-all duration-200 text-left border-b border-border/50 last:border-b-0 group"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                {typeIcons[product.type] || <BookOpen className="h-5 w-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-foreground">{product.code}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 text-primary font-medium">
                    {typeLabels[product.type] || product.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{product.name}</p>
              </div>
              <div className="flex-shrink-0 text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                {product.price.toLocaleString()}đ
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim().length > 0 && filteredProducts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-card border-2 border-border rounded-xl shadow-2xl z-50 p-6 text-center">
          <div className="text-4xl mb-2">😢</div>
          <p className="text-muted-foreground">Không tìm thấy kết quả cho "<span className="text-foreground font-medium">{query}</span>"</p>
          <p className="text-sm text-muted-foreground mt-1">Hãy thử tìm với mã môn khác</p>
        </div>
      )}
    </div>
  );
}
