import React, { useState } from 'react';
import SchoolSelect from './SchoolSelect';
import BattleArena from './BattleArena';
import BattleResult from './BattleResult';
import { saveRecord, seedDemoData } from '../../utils/battleStorage';
import './Battle.css';

type Step = 'select' | 'arena' | 'result';

interface BattleState {
  schoolId: string;
  username: string;
  score: number;
  accuracy: number;
}

seedDemoData();

const Battle: React.FC = () => {
  const [step, setStep] = useState<Step>('select');
  const [state, setState] = useState<BattleState>({
    schoolId: '',
    username: '',
    score: 0,
    accuracy: 0,
  });

  const handleConfirmSelect = (schoolId: string, username: string) => {
    setState((s) => ({ ...s, schoolId, username }));
    setStep('arena');
  };

  const handleFinish = (score: number, accuracy: number) => {
    saveRecord({
      schoolId: state.schoolId,
      username: state.username,
      score,
      accuracy,
      timestamp: Date.now(),
    });
    setState((s) => ({ ...s, score, accuracy }));
    setStep('result');
  };

  return (
    <div className="battle-page">
      {step === 'select' && (
        <SchoolSelect onConfirm={handleConfirmSelect} />
      )}
      {step === 'arena' && (
        <BattleArena
          key={Date.now()}
          lang="mixed"
          onFinish={handleFinish}
        />
      )}
      {step === 'result' && (
        <BattleResult
          schoolId={state.schoolId}
          username={state.username}
          score={state.score}
          accuracy={state.accuracy}
          onRetry={() => setStep('arena')}
          onChangeSchool={() => setStep('select')}
        />
      )}
    </div>
  );
};

export default Battle;
