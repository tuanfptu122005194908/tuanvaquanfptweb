import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import type { CartItem } from "@/hooks/useOrders";
import { toast } from "sonner";

import courseMathImg from "@/assets/course-math.png";
import courseCodeImg from "@/assets/course-code.png";
import courseWebImg from "@/assets/course-web.png";
import courseDatabaseImg from "@/assets/course-database.png";

interface CourseSectionProps {
  onAddToCart: (item: CartItem) => void;
}

const courses = [
  {
    id: 1,
    code: "MAE101",
    name: "Mathematics for Engineers",
    description: "Môn Toán ứng dụng cho kỹ sư, cung cấp kiến thức toán học nền tảng để giải quyết các bài toán kỹ thuật",
    price: 150000,
    image: courseMathImg,
  },
  {
    id: 2,
    code: "MAS291",
    name: "Mathematical Statistics",
    description: "Môn Xác suất – Thống kê, giúp sinh viên phân tích và xử lý dữ liệu, áp dụng trong CNTT và phần mềm",
    price: 150000,
    image: courseMathImg,
  },
  {
    id: 3,
    code: "MAD101",
    name: "Discrete Mathematics",
    description: "Môn Toán rời rạc, trang bị tư duy logic, tập hợp, quan hệ, đồ thị, ứng dụng trong cấu trúc dữ liệu và thuật toán",
    price: 150000,
    image: courseMathImg,
  },
  {
    id: 4,
    code: "PRO192",
    name: "Object-Oriented Programming with Java",
    description: "Môn Lập trình hướng đối tượng, làm quen với Java, class, object, kế thừa, đa hình",
    price: 250000,
    image: courseCodeImg,
  },
  {
    id: 5,
    code: "LAB211",
    name: "Advanced Programming Lab",
    description: "Môn Thực hành lập trình nâng cao, rèn luyện kỹ năng code Java thông qua bài tập và dự án nhỏ",
    price: 250000,
    image: courseCodeImg,
  },
  {
    id: 6,
    code: "WED201",
    name: "Web Design & Development",
    description: "Môn Phát triển Web, học HTML, CSS, JavaScript và xây dựng website cơ bản đến nâng cao",
    price: 250000,
    image: courseWebImg,
  },
  {
    id: 7,
    code: "DBI202",
    name: "Database Systems",
    description: "Môn Cơ sở dữ liệu, học SQL, thiết kế và quản lý hệ thống cơ sở dữ liệu quan hệ",
    price: 250000,
    image: courseDatabaseImg,
  },
  {
    id: 8,
    code: "CSD201",
    name: "Data Structures & Algorithms",
    description: "Môn Cấu trúc dữ liệu và giải thuật, học về mảng, danh sách, ngăn xếp, cây, đồ thị và thuật toán tìm kiếm/sắp xếp",
    price: 250000,
    image: courseCodeImg,
  },
];

const CourseSection = ({ onAddToCart }: CourseSectionProps) => {
  const handleAddToCart = (course: typeof courses[0]) => {
    onAddToCart({
      id: course.id,
      code: course.code,
      name: course.name,
      price: course.price,
      type: 'course',
    });
    toast.success(`Đã thêm ${course.code} vào giỏ hàng!`);
  };

  return (
    <section id="courses" className="py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-gradient-primary bg-clip-text text-transparent">
          Khóa học
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Khóa học chất lượng cao, phù hợp với sinh viên FPT University
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="h-[28rem] flex flex-col overflow-hidden hover:shadow-2xl hover:-translate-y-3 hover:scale-105 transition-all duration-300"
            >
              {/* Image - 50% height */}
              <div className="h-1/2 overflow-hidden">
                <img 
                  src={course.image} 
                  alt={course.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content - 50% height */}
              <div className="h-1/2 p-4 flex flex-col">
                <h3 className="font-bold text-primary text-lg mb-1">{course.code}</h3>
                <h4 className="font-semibold text-sm mb-2 line-clamp-2">{course.name}</h4>
                <p className="text-xs text-muted-foreground mb-4 flex-grow line-clamp-3">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold text-primary">
                    {course.price.toLocaleString('vi-VN')}đ
                  </span>
                  <Button 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => handleAddToCart(course)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseSection;
