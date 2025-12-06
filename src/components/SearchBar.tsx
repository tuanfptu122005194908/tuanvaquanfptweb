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
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm theo mã môn (VD: PRO192, MAE101...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-background/80 backdrop-blur-sm border-primary/20 focus:border-primary"
        />
      </div>

      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/50 transition-colors text-left border-b border-border/50 last:border-b-0"
            >
              <div className="flex-shrink-0">
                {typeIcons[product.type] || <BookOpen className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">{product.code}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {typeLabels[product.type] || product.type}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{product.name}</p>
              </div>
              <div className="flex-shrink-0 text-primary font-medium">
                {product.price.toLocaleString()}đ
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim().length > 0 && filteredProducts.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-50 p-4 text-center text-muted-foreground">
          Không tìm thấy kết quả cho "{query}"
        </div>
      )}
    </div>
  );
}
