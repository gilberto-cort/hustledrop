import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { trackEvent } from '@/lib/analytics';
import { QUIZ_QUESTIONS, isAnswerValid, buildHustleProfile } from '@/lib/quizQuestions';
import {
  loadSession,
  newSession,
  saveSession,
  updateAnswer,
  syncResponseToServer,
  fetchServerResponses,
  saveHustleProfile,
} from '@/lib/quizStore';
import QuizOption from './QuizOption';
import AnalysisTransition from './AnalysisTransition';

export default function QuizFlow() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState('loading');
  const [direction, setDirection] = useState(1);

  // Initialize / resume progress
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let s = loadSession();
      const hadLocalProgress = !!s && Object.keys(s.answers || {}).length > 0;
      if (!s) s = newSession();

      // Signed-in user with no local progress: restore from server (cross-device resume)
      if (!hadLocalProgress && isAuthenticated) {
        try {
          const server = await fetchServerResponses();
          if (server && !cancelled && Object.keys(server.answers).length > 0) {
            s = { ...s, session_id: server.session_id, answers: server.answers, record_ids: server.record_ids };
            saveSession(s);
          }
        } catch (e) {
          // fall back to a fresh local session
        }
      }
      if (cancelled) return;

      setSession(s);
      const firstUnanswered = QUIZ_QUESTIONS.findIndex((q) => !isAnswerValid(q, s.answers[q.key]));
      setStep(firstUnanswered === -1 ? QUIZ_QUESTIONS.length - 1 : firstUnanswered);
      if (Object.keys(s.answers).length === 0) {
        trackEvent('quiz_started');
      }
      setPhase('quiz');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = (question, value) => {
    let nextValue = value;
    if (question.type === 'multi') {
      const current = session.answers[question.key] || [];
      if (question.exclusiveOption && value === question.exclusiveOption) {
        nextValue = current.includes(value) ? [] : [value];
      } else if (current.includes(value)) {
        nextValue = current.filter((v) => v !== value);
      } else {
        if (question.maxSelections && current.length >= question.maxSelections) return;
        nextValue = [...current.filter((v) => v !== question.exclusiveOption), value];
      }
    }
    setSession(updateAnswer(session, question.key, nextValue));
  };

  const handleContinue = () => {
    const question = QUIZ_QUESTIONS[step];
    const answer = session.answers[question.key];
    if (!isAnswerValid(question, answer)) return;

    trackEvent('quiz_question_completed', { question_key: question.key });

    if (isAuthenticated) {
      syncResponseToServer(session, question.key, answer, user?.id)
        .then((recordId) => {
          setSession((prev) => {
            const next = {
              ...prev,
              record_ids: { ...(prev.record_ids || {}), [question.key]: recordId },
            };
            saveSession(next);
            return next;
          });
        })
        .catch(() => {});
    }

    if (step < QUIZ_QUESTIONS.length - 1) {
      setDirection(1);
      setStep(step + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    // Validate the full questionnaire before completing
    const missing = QUIZ_QUESTIONS.findIndex((q) => !isAnswerValid(q, session.answers[q.key]));
    if (missing !== -1) {
      setDirection(missing < step ? -1 : 1);
      setStep(missing);
      return;
    }
    const completed = { ...session, completed: true, completed_at: new Date().toISOString() };
    saveSession(completed);
    setSession(completed);
    trackEvent('quiz_completed');
    setPhase('analyzing');

    if (isAuthenticated) {
      saveHustleProfile(buildHustleProfile(completed.answers, user?.id)).catch(() => {});
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep(step - 1);
  };

  if (phase === 'loading') {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-primary" />
      </div>
    );
  }

  if (phase === 'analyzing') {
    return <AnalysisTransition onContinue={() => navigate('/results')} />;
  }

  const question = QUIZ_QUESTIONS[step];
  const answer = session.answers[question.key];
  const isLast = step === QUIZ_QUESTIONS.length - 1;
  const canContinue = isAnswerValid(question, answer);
  const selectedCount = question.type === 'multi' ? (answer || []).length : 0;
  const atMax = question.type === 'multi' && question.maxSelections && selectedCount >= question.maxSelections;

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Header + progress */}
      <div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-[0.25em] text-muted-foreground">HUSTLEMATCH</span>
          <span className="text-xs font-medium text-muted-foreground">
            Question {step + 1} of {QUIZ_QUESTIONS.length}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-brand-gradient transition-all duration-500"
            style={{ width: `${((step + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={question.key}
          initial={{ opacity: 0, x: direction * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -24 }}
          transition={{ duration: 0.22 }}
          className="mt-8"
        >
          <h1 className="text-pretty text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
            {question.title}
          </h1>
          {question.helper && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{question.helper}</p>
          )}

          <div
            className={
              question.type === 'multi'
                ? 'mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3'
                : 'mt-6 space-y-2.5'
            }
          >
            {question.options.map((opt) => {
              const selected =
                question.type === 'multi'
                  ? (answer || []).includes(opt.value)
                  : answer === opt.value;
              const dimmed =
                question.type === 'multi' &&
                atMax &&
                !selected &&
                opt.value !== question.exclusiveOption;
              return (
                <QuizOption
                  key={opt.value}
                  option={opt}
                  selected={selected}
                  dimmed={dimmed}
                  onClick={() => handleSelect(question, opt.value)}
                />
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="inline-flex items-center gap-1 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium text-muted-foreground transition enabled:hover:text-foreground disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          BACK
        </button>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={
            isLast
              ? 'inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-2.5 text-sm font-semibold text-white transition enabled:hover:scale-[1.02] disabled:opacity-40'
              : 'inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-foreground transition enabled:hover:border-white/30 disabled:opacity-40'
          }
        >
          {isLast ? 'FIND MY HUSTLE' : 'CONTINUE'}
          {!isLast && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}