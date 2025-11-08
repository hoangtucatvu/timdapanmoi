
import { Question } from './types';

// FIX: Replaced all instances of 'correctAnswerIndex' with 'correctAnswer' and updated values to strings to match the 'Question' type interface.
export const QUESTION_BANK: Question[] = [
  {
    id: 1,
    question: "Hành tinh nào trong Hệ Mặt Trời được biết đến với tên gọi 'Hành tinh Đỏ'?",
    options: ["Sao Kim", "Sao Hỏa", "Sao Mộc", "Sao Thổ"],
    correctAnswer: "Sao Hỏa",
    explanation: "Sao Hỏa được gọi là 'Hành tinh Đỏ' vì bề mặt của nó có màu đỏ cam do sự hiện diện của oxit sắt (gỉ sét)."
  },
  {
    id: 2,
    question: "Đại dương nào lớn nhất trên Trái Đất?",
    options: ["Đại Tây Dương", "Ấn Độ Dương", "Bắc Băng Dương", "Thái Bình Dương"],
    correctAnswer: "Thái Bình Dương",
    explanation: "Thái Bình Dương là đại dương lớn nhất và sâu nhất trên Trái Đất, chiếm khoảng một phần ba diện tích bề mặt hành tinh."
  },
  {
    id: 3,
    question: "Ngôn ngữ lập trình nào được tạo ra bởi James Gosling tại Sun Microsystems?",
    options: ["Python", "C++", "Java", "JavaScript"],
    correctAnswer: "Java",
    explanation: "Java là một ngôn ngữ lập trình hướng đối tượng, dựa trên lớp được thiết kế bởi James Gosling và được Sun Microsystems phát hành vào năm 1995."
  },
  {
    id: 4,
    question: "Thủ đô của nước Úc là gì?",
    options: ["Sydney", "Melbourne", "Canberra", "Perth"],
    correctAnswer: "Canberra",
    explanation: "Mặc dù Sydney và Melbourne là những thành phố lớn và nổi tiếng hơn, Canberra mới là thủ đô chính thức của Úc."
  },
    {
    id: 5,
    question: "Ai là tác giả của tác phẩm 'Truyện Kiều'?",
    options: ["Hồ Xuân Hương", "Nguyễn Du", "Nguyễn Trãi", "Bà Huyện Thanh Quan"],
    correctAnswer: "Nguyễn Du",
    explanation: "Nguyễn Du là một đại thi hào của dân tộc Việt Nam, và 'Truyện Kiều' là tác phẩm nổi tiếng nhất của ông."
  }
];
