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
}

interface Quiz {
  id: number;
  word: string;
  meaning: string;
}

export default function QuizPage() {
  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([]);
  const [selectedVocabulary, setSelectedVocabulary] = useState<number | null>(null);
  const [quizzes, setQuizzes] = useState<{ [key: number]: Quiz[] }>({});
  const [loadingVocabulary, setLoadingVocabulary] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [flippedStates, setFlippedStates] = useState<{ [key: number]: boolean }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoadingVocabulary(true);
    fetch("/api/vocabularys")
      .then((res) => res.json())
      .then((data) => {
        setVocabularySets(data);
        setLoadingVocabulary(false);
      })
      .catch((error) => {
        console.error("Lỗi khi tải từ vựng:", error);
        setLoadingVocabulary(false);
      });
  }, []);

  useEffect(() => {
    if (selectedVocabulary && !quizzes[selectedVocabulary]) {
      setLoadingQuiz(true);
      fetch(`/api/vocabularyItems?vocabularyItemId=${selectedVocabulary}`)
        .then((res) => res.json())
        .then((data) => {
          setQuizzes((prev) => ({ ...prev, [selectedVocabulary]: data }));
          setTotalPages(data.length);
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Choose a vocabulary set to start the test</h1>

      {loadingVocabulary ? (
        <p className="text-gray-500">Loading vocabulary sets...</p>
      ) : (
        <div className="mb-6">
          {vocabularySets.map((set) => (
            <button
              key={set.id}
              onClick={() => setSelectedVocabulary(set.id)}
              className={`mr-2 mb-2 px-4 py-2 rounded ${
                selectedVocabulary === set.id ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              {set.title}
            </button>
          ))}
        </div>
      )}

      {loadingQuiz && <p className="text-gray-500">Loading quiz questions...</p>}

      {selectedVocabulary && quizzes[selectedVocabulary] && !loadingQuiz && (
        <div className="relative w-full flex flex-col items-center justify-center">
          <Swiper
            spaceBetween={30}
            centeredSlides={true}
            pagination={{
              type: "fraction",
            }}
            navigation={true}
            modules={[Pagination, Navigation]}
            className="mySwiper w-full"
            onSlideChange={(swiper) => setCurrentPage(swiper.activeIndex + 1)}
          >
            {quizzes[selectedVocabulary].map((quiz, index) => (
              <SwiperSlide key={index} className="relative p-4">
                <div
                  className="flip-card  h-[400px] cursor-pointer"
                  onClick={() => toggleFlip(index)}
                >
                  <div className={`flip-card-inner ${flippedStates[index] ? "flipped" : ""}`}>
                    <div className="flip-card-front">
                      <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-2xl font-bold rounded-lg shadow-lg">
                        {quiz.word}
                      </div>
                    </div>
                    <div className="flip-card-back">
                      <div className="w-full h-full flex items-center justify-center bg-green-500 text-white text-2xl font-bold rounded-lg shadow-lg">
                        {quiz.meaning}
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
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
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .flip-card-back {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
