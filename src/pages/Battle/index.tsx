import React, { useState } from 'react';
import SchoolSelect from './SchoolSelect';
import BattleArena from './BattleArena';
import BattleResult from './BattleResult';
import { saveRecord, seedDemoData } from '../../utils/battleStorage';
import type { Lang } from '../../data/texts';
import './Battle.css';

type Step = 'select' | 'arena' | 'result';

interface BattleState {
  schoolId: string;
  username: string;
  lang: Lang;
  score: number;
  accuracy: number;
}

seedDemoData();

const Battle: React.FC = () => {
  const [step, setStep] = useState<Step>('select');
  const [state, setState] = useState<BattleState>({
    schoolId: '',
    username: '',
    lang: 'ko',
    score: 0,
    accuracy: 0,
  });

  const handleConfirmSelect = (schoolId: string, username: string, lang: Lang) => {
    setState((s) => ({ ...s, schoolId, username, lang }));
    setStep('arena');
  };

  const handleFinish = (score: number, accuracy: number) => {
    const record = {
      schoolId: state.schoolId,
      username: state.username,
      score,
      accuracy,
      lang: state.lang,
      timestamp: Date.now(),
    };
    saveRecord(record);
    setState((s) => ({ ...s, score, accuracy }));
    setStep('result');
  };

  const handleRetry = () => {
    setStep('arena');
  };

  const handleChangeSchool = () => {
    setStep('select');
  };

  return (
    <div className="battle-page">
      {step === 'select' && (
        <SchoolSelect onConfirm={handleConfirmSelect} />
      )}
      {step === 'arena' && (
        <BattleArena
          key={`${state.lang}-${Date.now()}`}
          lang={state.lang}
          onFinish={handleFinish}
        />
      )}
      {step === 'result' && (
        <BattleResult
          schoolId={state.schoolId}
          username={state.username}
          score={state.score}
          accuracy={state.accuracy}
          lang={state.lang}
          onRetry={handleRetry}
          onChangeSchool={handleChangeSchool}
        />
      )}
    </div>
  );
};

export default Battle;
