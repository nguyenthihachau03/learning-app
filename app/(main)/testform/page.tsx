"use client";

import { useState, useEffect } from "react";

interface VocabularySet {
  id: number;
  title: string;
}

interface Quiz {
  id: number;
  question: string;
  type: "SELECT" | "TRUE_FALSE" | "FILL_IN_BLANK";
  options: { option: string }[];
  correctAnswer: string;
}

export default function QuizPage() {
  const [vocabularySets, setVocabularySets] = useState<VocabularySet[]>([]);
  const [selectedVocabulary, setSelectedVocabulary] = useState<number | null>(null);
  const [quizzes, setQuizzes] = useState<{ [key: number]: Quiz[] }>({});
  const [userAnswers, setUserAnswers] = useState<{ [vocabId: number]: { [quizId: number]: string } }>({});
  const [quizStatus, setQuizStatus] = useState<{ [vocabId: number]: { score: number; completed: boolean; showResults: boolean } }>({});

  const [loadingVocabulary, setLoadingVocabulary] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

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
  const saveScore = (vocabId: number, score: number) => {
    localStorage.setItem(`quiz_score_${vocabId}`, JSON.stringify(score));
  };

  const loadScore = (vocabId: number) => {
    const storedScore = localStorage.getItem(`quiz_score_${vocabId}`);
    return storedScore ? JSON.parse(storedScore) : 0;
  };
  useEffect(() => {
    if (selectedVocabulary) {
      const savedScore = loadScore(selectedVocabulary);
      setQuizStatus((prev) => ({
        ...prev,
        [selectedVocabulary]: { score: savedScore, completed: false, showResults: false },
      }));
    }
  }, [selectedVocabulary]);

  useEffect(() => {
    if (selectedVocabulary && !quizzes[selectedVocabulary]) {
      setLoadingQuiz(true);
      fetch(`/api/quiz?vocabularyId=${selectedVocabulary}`)
        .then((res) => res.json())
        .then((data) => {
          setQuizzes((prev) => ({ ...prev, [selectedVocabulary]: data }));
          loadUserAnswers(selectedVocabulary);
          setLoadingQuiz(false);
        })
        .catch((error) => {
          console.error("Lỗi khi tải quiz:", error);
          setLoadingQuiz(false);
        });
    }
  }, [selectedVocabulary]);

  const saveUserAnswers = (vocabId: number, answers: { [key: number]: string }) => {
    localStorage.setItem(`quiz_answers_${vocabId}`, JSON.stringify(answers));
  };

  const loadUserAnswers = (vocabId: number) => {
    const storedAnswers = localStorage.getItem(`quiz_answers_${vocabId}`);
    if (storedAnswers) {
      setUserAnswers((prev) => ({ ...prev, [vocabId]: JSON.parse(storedAnswers) }));
    } else {
      setUserAnswers((prev) => ({ ...prev, [vocabId]: {} }));
    }
  };

  const handleAnswer = (quizId: number, answer: string) => {
    if (!selectedVocabulary) return;
    setUserAnswers((prev) => {
      const updatedAnswers = {
        ...prev,
        [selectedVocabulary]: { ...prev[selectedVocabulary], [quizId]: answer },
      };
      saveUserAnswers(selectedVocabulary, updatedAnswers[selectedVocabulary]);
      return updatedAnswers;
    });
  };
  const handleSubmit = () => {
    if (!selectedVocabulary) return;
    let correctCount = 0;
    quizzes[selectedVocabulary].forEach((quiz) => {
      if (userAnswers[selectedVocabulary]?.[quiz.id]?.toLowerCase() === quiz.correctAnswer.toLowerCase()) {
        correctCount++;
      }
    });

    saveScore(selectedVocabulary, correctCount); // Lưu điểm số

    setQuizStatus((prev) => ({
      ...prev,
      [selectedVocabulary]: { score: correctCount, completed: true, showResults: true },
    }));
  };

  const handleReset = () => {
    if (!selectedVocabulary) return;
    localStorage.removeItem(`quiz_answers_${selectedVocabulary}`);
    saveScore(selectedVocabulary, 0); // Đặt lại điểm số

    setUserAnswers((prev) => ({ ...prev, [selectedVocabulary]: {} }));
    setQuizStatus((prev) => ({
      ...prev,
      [selectedVocabulary]: { score: 0, completed: false, showResults: false },
    }));
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
        <div className="quiz-section">
          {quizzes[selectedVocabulary].map((quiz) => (
            <div key={quiz.id} className="mb-4 p-4 border rounded shadow">
              <h2 className="font-semibold">{quiz.question}</h2>
              <div className="mt-2">
                {quiz.type === "SELECT" && quiz.options.length > 0 ? (
                  quiz.options.map((opt, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(quiz.id, opt.option)}
                      className={`block w-full text-left p-2 my-1 rounded ${
                        userAnswers[selectedVocabulary]?.[quiz.id] === opt.option
                          ? quizStatus[selectedVocabulary]?.showResults
                            ? userAnswers[selectedVocabulary]?.[quiz.id] === quiz.correctAnswer
                              ? "bg-green-300"
                              : "bg-red-300"
                            : "bg-yellow-300"
                          : "bg-gray-200"
                      }`}
                      disabled={!!quizStatus[selectedVocabulary]?.showResults}
                    >
                      {opt.option}
                    </button>
                  ))
                ) : quiz.type === "TRUE_FALSE" ? (
                  ["True", "False"].map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(quiz.id, option)}
                      className={`block w-full text-left p-2 my-1 rounded ${
                        userAnswers[selectedVocabulary]?.[quiz.id] === option
                          ? quizStatus[selectedVocabulary]?.showResults
                            ? userAnswers[selectedVocabulary]?.[quiz.id].toLowerCase() === quiz.correctAnswer.toLowerCase()
                              ? "bg-green-300"
                              : "bg-red-300"
                            : "bg-yellow-300"
                          : "bg-gray-200"
                      }`}
                      disabled={!!quizStatus[selectedVocabulary]?.showResults}
                    >
                      {option}
                    </button>
                  ))
                ) : quiz.type === "FILL_IN_BLANK" ? (
                  <input
                    type="text"
                    value={userAnswers[selectedVocabulary]?.[quiz.id] || ""}
                    onChange={(e) => handleAnswer(quiz.id, e.target.value)}
                    className={`w-full p-2 border rounded ${
                      quizStatus[selectedVocabulary]?.showResults
                        ? userAnswers[selectedVocabulary]?.[quiz.id] === quiz.correctAnswer
                          ? "bg-green-300"
                          : "bg-red-300"
                        : ""
                    }`}
                    disabled={quizStatus[selectedVocabulary]?.showResults}
                  />
                ) : (
                  <p className="text-gray-500">Invalid question type</p>
                )}
              </div>
            </div>
          ))}
            {quizStatus[selectedVocabulary]?.completed && (
            <div className="mt-4 p-4 border rounded bg-gray-100 text-center">
                <h3 className="text-lg font-semibold">Result:</h3>
                <p className="text-xl font-bold text-blue-600">
                {quizStatus[selectedVocabulary]?.score} / {quizzes[selectedVocabulary].length}
                </p>
            </div>
            )}
          {!quizStatus[selectedVocabulary]?.completed && (
            <button onClick={handleSubmit} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded">
              Submit
            </button>
          )}

          {quizStatus[selectedVocabulary]?.completed && (
            <button onClick={handleReset} className="mt-4 px-6 py-2 bg-red-500 text-white rounded">
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}