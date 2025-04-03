"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Pagination, Navigation } from "swiper/modules";

interface VocabularySet {
  id: number;
  title: string;
  courseId: number;
}

interface Quiz {
  id: number;
  word: string;
  meaning: string;
}

interface UserProgress {
  activeCourseId: number;
}

export default function QuizPage() {
  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([]);
  const [selectedVocabulary, setSelectedVocabulary] = useState<number | null>(null);
  const [quizzes, setQuizzes] = useState<{ [key: number]: Quiz[] }>({});
  const [loadingVocabulary, setLoadingVocabulary] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [flippedStates, setFlippedStates] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/user-progress")
      .then((res) => res.json())
      .then((data: UserProgress) => {
        setActiveCourseId(data.activeCourseId);
      })
      .catch((error) => console.error("Error fetching user progress:", error));
  }, []);

  useEffect(() => {
    if (activeCourseId) {
      setLoadingVocabulary(true);
      fetch("/api/vocabularys/vocabularyQuiz")
        .then((res) => res.json())
        .then((data: VocabularySet[]) => {
          const filtered = data.filter((v) => v.courseId === activeCourseId);
          setVocabularySets(filtered);
          setLoadingVocabulary(false);
        })
        .catch((error) => {
          console.error("Lỗi khi tải từ vựng:", error);
          setLoadingVocabulary(false);
        });
    }
  }, [activeCourseId]);

  useEffect(() => {
    if (selectedVocabulary && !quizzes[selectedVocabulary]) {
      setLoadingQuiz(true);
      fetch(`/api/vocabularyItems?vocabularyItemId=${selectedVocabulary}`)
        .then((res) => res.json())
        .then((data) => {
          setQuizzes((prev) => ({ ...prev, [selectedVocabulary]: data }));
          setLoadingQuiz(false);
        })
        .catch((error) => {
          console.error("Lỗi khi tải quiz:", error);
          setLoadingQuiz(false);
        });
    }
  }, [selectedVocabulary]);

  const toggleFlip = (index: number) => {
    setFlippedStates((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-center font-sans bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">
        <span role="img" aria-label="note">📝</span> Chọn bộ từ vựng để bắt đầu
      </h1>

      {loadingVocabulary ? (
        <p className="text-gray-500">Đang tải danh sách từ vựng...</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {vocabularySets.map((set) => (
            <button
              key={set.id}
              onClick={() => setSelectedVocabulary(set.id)}
              className={`px-4 py-2 rounded-lg shadow transition-all duration-200 text-sm font-medium
                ${selectedVocabulary === set.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-300"
                }`}
            >
              {set.title}
            </button>
          ))}
        </div>
      )}

      {loadingQuiz && <p className="text-gray-500">Đang tải câu hỏi...</p>}

      {selectedVocabulary && quizzes[selectedVocabulary] && !loadingQuiz && (
        <div className="relative w-full flex flex-col items-center justify-center">
          <Swiper
            key={selectedVocabulary}
            spaceBetween={50}
            centeredSlides={true}
            pagination={{
              type: "fraction",
              el: ".custom-swiper-pagination",
            }}
            navigation={true}
            modules={[Pagination, Navigation]}
            className="mySwiper w-full max-w-2xl"
            onSlideChange={(swiper) => setCurrentPage(swiper.activeIndex + 1)}
          >
            {quizzes[selectedVocabulary].map((quiz, index) => (
              <SwiperSlide key={index} className="relative px-6">
                <div
                  className="flip-card h-[400px] w-full cursor-pointer"
                  onClick={() => toggleFlip(index)}
                >
                  <div
                    className={`flip-card-inner border-2 rounded-xl shadow-lg ${flippedStates[index] ? "flipped" : ""
                      }`}
                  >
                    <div className="flip-card-front bg-blue-300">
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {quiz.word}
                      </div>
                    </div>
                    <div className="flip-card-back bg-green-300">
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {quiz.meaning}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="custom-swiper-pagination text-center mt-4 text-gray-700 font-medium text-lg" />
        </div>
      )}

      <style jsx>{`
        .flip-card {
          perspective: 1000px;
        }
        .flip-card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          transition: transform 0.6s;
          transform-style: preserve-3d;
        }
        .flipped {
          transform: rotateY(180deg);
        }
        .flip-card-front,
        .flip-card-back {
          width: 100%;
          height: 100%;
          position: absolute;
          backface-visibility: hidden;
          border-radius: 1rem;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <style global jsx>{`
        .swiper-button-next,
        .swiper-button-prev {
          top: 45%;
          width: 36px;
          height: 36px;
          color: #2563eb;
          background-color: rgba(255, 255, 255, 0.9);
          border-radius: 9999px;
          box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          transform: scale(1.1);
        }

        .swiper-button-next {
          right: -40px !important;
        }
        .swiper-button-prev {
          left: -40px !important;
        }

        .custom-swiper-pagination {
          position: relative;
          bottom: 0;
        }
      `}</style>
    </div>
  );
}
