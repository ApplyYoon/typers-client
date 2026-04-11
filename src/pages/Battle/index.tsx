import React, { useState } from 'react';
import SchoolSelect from './SchoolSelect';
import BattleArena from './BattleArena';
import BattleResult from './BattleResult';
import { saveRecord } from '../../utils/battleStorage';
import './Battle.css';

type Step = 'select' | 'arena' | 'result';

interface BattleState {
  schoolId: string;
  schoolName: string;
  username: string;
  score: number;
  accuracy: number;
}

const Battle: React.FC = () => {
  const [step, setStep] = useState<Step>('select');
  const [state, setState] = useState<BattleState>({
    schoolId: '',
    schoolName: '',
    username: '',
    score: 0,
    accuracy: 0,
  });

  const handleConfirmSelect = (schoolId: string, username: string, schoolName: string) => {
    setState((s) => ({ ...s, schoolId, schoolName, username }));
    setStep('arena');
  };

  const handleFinish = (score: number, accuracy: number) => {
    saveRecord({
      schoolId:   state.schoolId,
      schoolName: state.schoolName,
      username:   state.username,
      score,
      accuracy,
      timestamp:  Date.now(),
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
          schoolName={state.schoolName}
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
