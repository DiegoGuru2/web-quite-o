import React, { useState, useEffect } from 'react';
import { type QuizQuestionResponse, checkQuizAnswer } from '../services/api';
import { Brain, CheckCircle2, XCircle, RotateCcw, Award, ArrowRight, Trophy, Target, Zap } from 'lucide-react';

interface Props {
  questions: QuizQuestionResponse[];
}

export default function TestQuiteno({ questions }: Props) {
  // Only use questions that have answers
  const validQuestions = questions.filter(q => q.answers && q.answers.length >= 2);
  
  // Shuffle and pick 10 questions max for a nice quiz experience
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionResponse[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [started, setStarted] = useState(false);
  const [shuffledAnswers, setShuffledAnswers] = useState<any[]>([]);

  const QUIZ_SIZE = Math.min(10, validQuestions.length);

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startQuiz = () => {
    const picked = shuffleArray(validQuestions).slice(0, QUIZ_SIZE);
    setQuizQuestions(picked);
    setCurrentIdx(0);
    setScore(0);
    setShowResult(false);
    setSelectedId(null);
    setIsCorrect(null);
    setAnswered(false);
    setStarted(true);
    // Shuffle answers for first question
    setShuffledAnswers(shuffleArray(picked[0]?.answers || []));
  };

  useEffect(() => {
    if (started && quizQuestions[currentIdx]) {
      setShuffledAnswers(shuffleArray(quizQuestions[currentIdx].answers));
    }
  }, [currentIdx, started]);

  const handleAnswer = async (answerId: number, answerIsCorrect: boolean) => {
    if (answered) return;
    setSelectedId(answerId);
    setAnswered(true);

    if (answerIsCorrect) {
      setScore(s => s + 1);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 < quizQuestions.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedId(null);
      setIsCorrect(null);
      setAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  // Fun quiteño feedback
  const getFeedback = () => {
    const percent = (score / quizQuestions.length) * 100;
    if (percent === 100) return { 
      title: "¡Elegante, veci!", 
      msg: "Eres un Chulla Quiteño de cepa pura. ¡Felicidades, te mereces un canelazo!", 
      emoji: "🏆", color: "#22c55e" 
    };
    if (percent >= 80) return { 
      title: "¡Casi un doctor del verbo!", 
      msg: "Te defiendes como gato panza arriba. Un par más y dominas la cosa.", 
      emoji: "🔥", color: "var(--gold)" 
    };
    if (percent >= 60) return { 
      title: "¡Nada mal, mijo!", 
      msg: "Sabes lo básico pero te falta calle. Sal más a las huecas del centro.", 
      emoji: "💪", color: "#f59e0b" 
    };
    if (percent >= 40) return { 
      title: "¡Te falta verbo, veci!", 
      msg: "Estás medio quedado. Te falta más mote con chicharrón y menos Netflix.", 
      emoji: "😬", color: "#fb923c" 
    };
    return { 
      title: "¡Puro batracio, mijo!", 
      msg: "¿Seguro que eres de Quito? No sabes ni dónde queda el Panecillo. ¡A estudiar el diccionario!", 
      emoji: "💀", color: "#ef4444" 
    };
  };

  if (validQuestions.length === 0) return null;

  // Start screen
  if (!started) {
    return (
      <section id="test" className="section">
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="section-bar"></div>
          <h2 className="section-title">Test <span className="text-gradient">Quiteño</span></h2>
          <p className="section-sub">¿Tienes el verbo quiteño activo o eres puro batracio?</p>

          <div className="card animate-fadeUp" style={{ padding: 60, textAlign: 'center' }}>
            <Brain size={64} style={{ color: 'var(--gold)', margin: '0 auto 24px' }} />
            <h3 style={{ fontSize: 28, fontWeight: 900, marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
              Demuestra tu nivel
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: 16, lineHeight: 1.7 }}>
              {QUIZ_SIZE} preguntas aleatorias sobre el dialecto quiteño.
              Cada pregunta tiene <strong>4 opciones</strong> y solo una es la correcta.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '32px 0 40px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <Target size={24} style={{ color: '#60a5fa', marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{QUIZ_SIZE} preguntas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Zap size={24} style={{ color: 'var(--gold)', marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>4 opciones c/u</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Trophy size={24} style={{ color: '#22c55e', marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Resultado final</div>
              </div>
            </div>

            <button onClick={startQuiz} className="btn-gold" style={{ padding: '18px 48px', fontSize: 16 }}>
              <Brain size={20} /> ¡Empezar el Test!
            </button>
          </div>
        </div>
      </section>
    );
  }

  // Result screen
  if (showResult) {
    const feedback = getFeedback();
    return (
      <section id="test" className="section">
        <div className="container" style={{ maxWidth: 600 }}>
          <div className="card animate-fadeUp" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 80, marginBottom: 24 }}>{feedback.emoji}</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16, fontFamily: 'var(--font-heading)' }}>
              {feedback.title}
            </h2>
            <div style={{ 
              fontSize: 64, fontWeight: 900, color: feedback.color, 
              marginBottom: 16, fontFamily: 'var(--font-heading)' 
            }}>
              {score} / {quizQuestions.length}
            </div>
            <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.7 }}>
              {feedback.msg}
            </p>

            {/* Progress bar */}
            <div style={{ 
              width: '100%', height: 12, borderRadius: 6, 
              background: 'var(--bg-glass)', marginBottom: 40, overflow: 'hidden' 
            }}>
              <div style={{ 
                width: `${(score / quizQuestions.length) * 100}%`, height: '100%', 
                borderRadius: 6, background: feedback.color, 
                transition: 'width 1s ease-out' 
              }} />
            </div>

            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={startQuiz} className="btn-gold" style={{ padding: '16px 32px' }}>
                <RotateCcw size={18} /> Intentar de nuevo
              </button>
              <a href="#diccionario" className="btn-outline" style={{ padding: '16px 32px' }}>
                📖 Estudiar más
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Quiz screen
  const q = quizQuestions[currentIdx];
  const progress = ((currentIdx + 1) / quizQuestions.length) * 100;

  return (
    <section id="test" className="section">
      <div className="container" style={{ maxWidth: 700 }}>
        <div className="section-bar"></div>
        <h2 className="section-title">Test <span className="text-gradient">Quiteño</span></h2>

        <div className="card animate-fadeUp" style={{ padding: 48 }}>
          {/* Progress bar */}
          <div style={{ 
            width: '100%', height: 6, borderRadius: 3, 
            background: 'var(--bg-glass)', marginBottom: 32, overflow: 'hidden' 
          }}>
            <div style={{ 
              width: `${progress}%`, height: '100%', borderRadius: 3,
              background: 'linear-gradient(90deg, var(--gold), #e6a800)',
              transition: 'width 0.4s ease' 
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
            <span style={{ 
              fontSize: 12, fontWeight: 800, color: 'var(--gold)', 
              textTransform: 'uppercase', letterSpacing: '0.1em' 
            }}>
              Pregunta {currentIdx + 1} de {quizQuestions.length}
            </span>
            <span style={{ 
              fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' 
            }}>
              Puntaje: {score}/{currentIdx + (answered ? 1 : 0)}
            </span>
          </div>

          <h3 style={{ 
            fontSize: 24, fontWeight: 800, marginBottom: 40, lineHeight: 1.4,
            fontFamily: 'var(--font-heading)' 
          }}>
            {q.question}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {shuffledAnswers.map((a: any, idx: number) => {
              const isSelected = selectedId === a.id;
              const showCorrect = answered && a.is_correct;
              const showWrong = answered && isSelected && !a.is_correct;
              const letters = ['A', 'B', 'C', 'D'];

              return (
                <button
                  key={a.id}
                  onClick={() => handleAnswer(a.id, a.is_correct)}
                  disabled={answered}
                  style={{
                    padding: '20px 20px', borderRadius: 16,
                    background: showCorrect 
                      ? 'rgba(34,197,94,0.08)' 
                      : showWrong 
                        ? 'rgba(239,68,68,0.08)' 
                        : isSelected 
                          ? 'rgba(212,160,23,0.08)' 
                          : 'var(--bg-glass)',
                    border: `2px solid ${
                      showCorrect ? '#22c55e' 
                      : showWrong ? '#ef4444' 
                      : isSelected ? 'var(--gold)' 
                      : 'var(--border)'
                    }`,
                    color: 'var(--text-primary)', textAlign: 'left', fontSize: 14,
                    fontWeight: 600, display: 'flex', alignItems: 'center', gap: 14,
                    transition: 'all 0.2s',
                    cursor: answered ? 'default' : 'pointer',
                    opacity: answered && !isSelected && !a.is_correct ? 0.5 : 1,
                  }}
                >
                  <span style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: showCorrect ? '#22c55e' : showWrong ? '#ef4444' : 'var(--bg-card)',
                    border: `1px solid ${showCorrect ? '#22c55e' : showWrong ? '#ef4444' : 'var(--border)'}`,
                    color: (showCorrect || showWrong) ? '#fff' : 'var(--text-muted)',
                    fontSize: 13, fontWeight: 800,
                  }}>
                    {showCorrect ? <CheckCircle2 size={16} /> : showWrong ? <XCircle size={16} /> : letters[idx]}
                  </span>
                  <span style={{ lineHeight: 1.4 }}>{a.answer_text}</span>
                </button>
              );
            })}
          </div>

          {/* Feedback after answer */}
          {answered && (
            <div className="animate-fadeUp" style={{ marginTop: 32 }}>
              <div style={{
                padding: '16px 20px', borderRadius: 12, marginBottom: 20,
                background: isCorrect ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                fontSize: 15, fontWeight: 700,
                color: isCorrect ? '#22c55e' : '#ef4444',
              }}>
                {isCorrect ? '¡De ley, veci! Esa era la correcta. 🎯' : '¡Nel, mijo! Esa no era. Toca estudiar más. 📖'}
              </div>
              
              <button onClick={nextQuestion} className="btn-gold" style={{ width: '100%', justifyContent: 'center', padding: '16px' }}>
                {currentIdx + 1 === quizQuestions.length ? '🏆 Ver resultados' : 'Siguiente pregunta →'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
