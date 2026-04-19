import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Github, Linkedin, Brain, ChevronRight, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

const GITHUB_URL = "https://github.com/Barrsum/Organic-Maths-Quiz.git";
const LINKEDIN_URL = "https://www.linkedin.com/in/ram-bapat-barrsum-diamos";
const Q_DURATION_MS = 2500;
const FEEDBACK_DURATION_MS = 1800;

type GameStage = 'start' | 'question' | 'options' | 'feedback' | 'results';
type MathOp = '+' | '×';

interface Question {
  id: number;
  n1: number;
  n2: number;
  op: MathOp;
  correctAnswer: number;
  options: number[];
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateOptions = (correct: number, op: MathOp, n1: number, n2: number): number[] => {
  const opts = new Set<number>();
  opts.add(correct);
  
  while (opts.size < 4) {
    const isAdd = op === '+';
    const strategy = Math.random();
    let distractor = correct;
    
    if (isAdd) {
      if (strategy < 0.3) distractor = correct + 10;
      else if (strategy < 0.6) distractor = correct - 10;
      else if (strategy < 0.8) distractor = correct + rand(1, 4);
      else distractor = correct - rand(1, 4);
    } else {
      if (strategy < 0.3) distractor = correct + n1;
      else if (strategy < 0.6) distractor = correct - n2;
      else if (strategy < 0.8) distractor = correct + 10;
      else distractor = correct - rand(1, 5);
    }
    
    if (distractor !== correct && distractor > 0) {
      opts.add(distractor);
    }
  }
  
  return Array.from(opts).sort(() => Math.random() - 0.5);
};

const createQ = (id: number, n1: number, n2: number, op: MathOp): Question => {
  const correct = op === '+' ? n1 + n2 : n1 * n2;
  return { id, n1, n2, op, correctAnswer: correct, options: generateOptions(correct, op, n1, n2) };
};

const generateGame = (): Question[] => {
  const qs: Question[] = [];
  qs.push(createQ(1, rand(15, 35), rand(15, 35), '+'));
  qs.push(createQ(2, rand(6, 9), rand(6, 9), '×'));
  qs.push(createQ(3, rand(45, 85), rand(35, 75), '+'));
  qs.push(createQ(4, rand(11, 15), rand(4, 8), '×'));
  qs.push(createQ(5, rand(14, 19), rand(4, 7), '×'));
  return qs;
};

export default function App() {
  const [stage, setStage] = useState<GameStage>('start');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const startGame = () => {
    setQuestions(generateGame());
    setCurrentIndex(0);
    setUserAnswers([]);
    setStage('question');
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (stage === 'question') {
      timer = setTimeout(() => {
        setStage('options');
      }, Q_DURATION_MS);
    } else if (stage === 'feedback') {
      timer = setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(prev => prev + 1);
          setStage('question');
        } else {
          setStage('results');
        }
      }, FEEDBACK_DURATION_MS);
    }
    return () => clearTimeout(timer);
  }, [stage, currentIndex, questions.length]);

  const handleOptionSelect = (ans: number) => {
    setUserAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentIndex] = ans;
      return newAnswers;
    });
    setStage('feedback');
  };

  const getScoreInfo = () => {
    let score = 0;
    userAnswers.forEach((ans, idx) => {
      if (ans === questions[idx].correctAnswer) score++;
    });
    
    let rank = 'Stone';
    let TrophyIcon = <div className="w-16 h-16 rounded-full bg-[#E5E0D8]" />;
    
    if (score === 5) {
      rank = 'Gold';
      TrophyIcon = <Trophy size={64} className="text-[#D4AF37] drop-shadow-xl" />;
    } else if (score === 4) {
      rank = 'Silver';
      TrophyIcon = <Trophy size={64} className="text-[#A8A9AD] drop-shadow-xl" />;
    } else if (score === 3) {
      rank = 'Bronze';
      TrophyIcon = <Trophy size={64} className="text-[#CD7F32] drop-shadow-xl" />;
    } else {
      TrophyIcon = <Brain size={64} className="text-[#8B9D83] drop-shadow-xl opacity-80" />;
    }

    return { score, rank, TrophyIcon };
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#8B9D83] selection:text-[#F4F1EB]">
      {/* HUD Header */}
      <header className="w-full px-6 py-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#2C302E] flex items-center justify-center text-[#F4F1EB] shadow-lg shadow-[#2C302E]/20">
            <Brain size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight uppercase text-[#2C302E] leading-none mb-1">Organic Maths Quiz</h1>
            <span className="text-[10px] font-semibold text-[#8B9D83] tracking-widest uppercase">Premium Ed.</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-2xl mx-auto">
        
        {/* Game Progress Indicator (Visible only during gameplay) */}
        {stage !== 'start' && stage !== 'results' && questions.length > 0 && (
          <div className="w-full max-w-sm mx-auto mb-8 flex justify-between gap-3 px-2">
            {questions.map((q, i) => {
              let bg = "bg-[#EBE8E0]"; // Unanswered
              if (i < currentIndex || (i === currentIndex && stage === 'feedback')) {
                bg = userAnswers[i] === q.correctAnswer ? "bg-[#8B9D83]" : "bg-[#D97777]";
              } else if (i === currentIndex) {
                bg = "bg-[#2C302E] animate-pulse"; // Active
              }
              return (
                <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 delay-100 ${bg}`} />
              );
            })}
          </div>
        )}

        <div className="w-full relative">
          <AnimatePresence mode="wait">
            
            {/* START SCREEN */}
            {stage === 'start' && (
              <motion.div 
                key="start"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full bg-white rounded-[2.5rem] p-10 md:p-14 premium-shadow border border-[#EBE8E0]/60 flex flex-col items-center text-center backdrop-blur-3xl"
              >
                {/* Creator Badge */}
                <div className="border border-[#EBE8E0] px-4 py-1.5 rounded-full mb-8 flex items-center gap-3 bg-[#FAF8F5] shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#8B9D83] shadow-[0_0_8px_rgba(139,157,131,0.6)]"></span>
                  <span className="text-[10px] font-bold tracking-widest text-[#646A66] uppercase mt-[1px]">Created by Ram Bapat</span>
                </div>

                <h2 className="text-5xl md:text-6xl font-serif text-[#2C302E] mb-3 tracking-tight">Organic Maths Quiz</h2>
                <p className="text-xl md:text-2xl font-serif italic text-[#8B9D83] mb-8">Ephemeral Mental Agility</p>
                
                <p className="text-[#646A66] text-lg max-w-md leading-relaxed mb-12 font-light">
                  A test of immediate memory and mental computation. Equations appear for a fleeting moment. Hold the numbers in your mind, calculate, and trust your intuition.
                </p>
                
                <button 
                  onClick={startGame}
                  className="group flex items-center gap-4 px-10 py-5 bg-[#2C302E] text-[#F4F1EB] rounded-2xl font-medium text-lg hover:bg-[#1A1D1C] transition-all shadow-xl hover:-translate-y-1 active:translate-y-0"
                >
                  Begin The Trial
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform text-[#8B9D83]" />
                </button>
              </motion.div>
            )}

            {/* QUESTION SCREEN */}
            {stage === 'question' && (
              <motion.div 
                key="question"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, filter: "blur(12px)", scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="w-full aspect-square max-h-[460px] bg-white rounded-[2.5rem] premium-shadow border border-[#EBE8E0] flex flex-col items-center justify-center relative overflow-hidden"
              >
                <div className="absolute top-10 text-sm font-semibold tracking-widest text-[#8B9D83] uppercase">
                  Sequence {currentIndex + 1}
                </div>
                
                <h3 className="text-7xl md:text-[7.5rem] font-serif text-[#2C302E] tracking-tighter">
                  {questions[currentIndex].n1} {questions[currentIndex].op} {questions[currentIndex].n2}
                </h3>
                
                {/* Immersive Progress bar mapping to the 2.5s duration */}
                <div className="absolute bottom-0 left-0 w-full h-2.5 bg-[#F4F1EB]">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: Q_DURATION_MS / 1000, ease: "linear" }}
                    className="h-full bg-[#8B9D83]"
                  />
                </div>
              </motion.div>
            )}

            {/* OPTIONS SCREEN */}
            {stage === 'options' && (
              <motion.div 
                key="options"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full flex flex-col"
              >
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-serif text-[#2C302E]">Select the correct solution</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {questions[currentIndex].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleOptionSelect(opt)}
                      className="h-28 bg-white rounded-3xl shadow-[0_4px_20px_rgba(44,48,46,0.03)] border border-[#EBE8E0] hover:border-[#8B9D83] transition-all flex items-center justify-center text-4xl font-serif text-[#2C302E] hover:bg-[#F9F8F6] hover:-translate-y-1 active:translate-y-0"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* FEEDBACK SCREEN */}
            {stage === 'feedback' && (
              <motion.div 
                key="feedback"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="w-full aspect-square max-h-[460px] bg-white rounded-[2.5rem] premium-shadow border border-[#EBE8E0] flex flex-col items-center justify-center text-center p-8"
              >
                {userAnswers[currentIndex] === questions[currentIndex].correctAnswer ? (
                   <>
                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }}>
                       <CheckCircle2 size={80} className="text-[#8B9D83] mb-8 drop-shadow-sm" />
                     </motion.div>
                     <h3 className="text-4xl md:text-5xl font-serif text-[#2C302E] mb-3">Precise</h3>
                     <p className="text-[#8B9D83] font-semibold tracking-widest uppercase text-sm">Excellent computation</p>
                   </>
                ) : (
                   <>
                     <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.6 }}>
                       <XCircle size={80} className="text-[#D97777] mb-8 drop-shadow-sm" />
                     </motion.div>
                     <h3 className="text-4xl md:text-5xl font-serif text-[#2C302E] mb-4">Incorrect</h3>
                     <p className="text-[#646A66] text-lg font-serif">The correct solution was <span className="font-bold text-[#2C302E] text-xl ml-1">{questions[currentIndex].correctAnswer}</span></p>
                   </>
                )}
              </motion.div>
            )}

            {/* RESULTS SCREEN */}
            {stage === 'results' && (() => {
              const { score, rank, TrophyIcon } = getScoreInfo();
              return (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full bg-white rounded-[2.5rem] p-8 md:p-14 premium-shadow border border-[#EBE8E0] flex flex-col items-center"
                >
                  <div className="mb-8">
                    {TrophyIcon}
                  </div>
                  
                  <h2 className="text-4xl font-serif text-[#2C302E] mb-3">Assessment Complete</h2>
                  <p className="text-[#8B9D83] font-bold tracking-widest uppercase text-sm mb-10">
                    {rank !== 'Stone' ? `${rank} Class Achieved` : 'Keep Practicing'}
                  </p>
                  
                  <div className="text-6xl font-serif text-[#2C302E] mb-12 flex items-baseline gap-3">
                    {score} <span className="text-3xl text-[#A8A9AD] font-sans font-light">/ 5</span>
                  </div>

                  <div className="w-full max-w-md bg-[#FAF8F5] border border-[#EBE8E0] rounded-3xl p-6 md:p-8 mb-10 flex flex-col gap-5">
                    {questions.map((q, i) => {
                      const userAns = userAnswers[i];
                      const isCorrect = userAns === q.correctAnswer;
                      return (
                        <div key={i} className="flex items-center justify-between pb-4 border-b border-[#EBE8E0] last:border-0 last:pb-0">
                          <div className="flex items-center gap-4">
                            {isCorrect ? (
                              <CheckCircle2 className="text-[#8B9D83]" size={20} />
                            ) : (
                              <XCircle className="text-[#D97777]" size={20} />
                            )}
                            <span className="font-serif text-xl tracking-tight text-[#2C302E]">{q.n1} {q.op} {q.n2}</span>
                          </div>
                          <div className="flex items-center gap-4 font-serif text-lg">
                            {!isCorrect && (
                              <span className="text-[#D97777] line-through decoration-[#D97777]/50">{userAns}</span>
                            )}
                            <span className={isCorrect ? "text-[#8B9D83] font-semibold" : "text-[#2C302E] font-medium"}>
                              {q.correctAnswer}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button 
                    onClick={startGame}
                    className="flex items-center gap-3 px-10 py-5 bg-[#2C302E] text-[#F4F1EB] rounded-2xl font-medium text-lg hover:bg-[#1A1D1C] transition-all shadow-xl active:scale-95"
                  >
                    <RotateCcw size={20} />
                    Retake Trial
                  </button>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-8 flex flex-col sm:flex-row justify-between items-center z-50 text-[#8B9D83]">
        <div className="flex items-center gap-3 mb-4 sm:mb-0">
          <span className="font-mono text-[11px] sm:text-xs font-bold tracking-widest uppercase text-[#2C302E]">
            Ram Bapat
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#8B9D83]"></div>
          <span className="font-mono text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-[#8B9D83]">
            Day 19 • Organic Mathematics
          </span>
        </div>
        
        <div className="flex items-center gap-5">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white text-[#646A66] hover:text-[#2C302E] transition-all shadow-sm">
            <Github size={20} />
          </a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full hover:bg-white text-[#646A66] hover:text-[#0A66C2] transition-all shadow-sm">
            <Linkedin size={20} />
          </a>
        </div>
      </footer>
    </div>
  );
}
