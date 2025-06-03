import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ChallengeCard = styled.div`
  background-color: white;
  border-radius: 20px;
  padding: 30px;
  margin: 20px auto;
  max-width: 600px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.5s ease-out;
`;

const ChallengeText = styled.h2`
  font-size: 1.8rem;
  color: #2d3748;
  text-align: center;
  margin-bottom: 20px;
  line-height: 1.4;

  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const ChallengeInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #e2e8f0;
`;

const CategoryBadge = styled.span`
  background-color: #667eea;
  color: white;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const DifficultyBadge = styled.span`
  background-color: ${props => {
    switch (props.difficulty) {
      case 'easy': return '#48bb78';
      case 'medium': return '#ed8936';
      case 'hard': return '#e53e3e';
      default: return '#718096';
    }
  }};
  color: white;
  padding: 5px 15px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const CompleteButton = styled(ActionButton)`
  background-color: #48bb78;
  color: white;

  &:hover {
    background-color: #38a169;
  }
`;

const SkipButton = styled(ActionButton)`
  background-color: #e2e8f0;
  color: #4a5568;

  &:hover {
    background-color: #cbd5e0;
  }
`;

const CompletionMessage = styled.p`
  text-align: center;
  color: #48bb78;
  font-weight: 600;
  margin-top: 15px;
`;

function ChallengeDisplay({ challenge }) {
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsCompleted(false);
  }, [challenge]);

  const handleComplete = () => {
    setIsCompleted(true);
    // Тут можна додати логіку для збереження прогресу
  };

  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'Легко';
      case 'medium': return 'Середньо';
      case 'hard': return 'Складно';
      default: return difficulty;
    }
  };

  return (
    <ChallengeCard>
      <ChallengeText>{challenge.text}</ChallengeText>
      
      <ChallengeInfo>
        <CategoryBadge>{challenge.category}</CategoryBadge>
        <DifficultyBadge difficulty={challenge.difficulty}>
          {getDifficultyText(challenge.difficulty)}
        </DifficultyBadge>
      </ChallengeInfo>

      {!isCompleted ? (
        <ActionButtons>
          <CompleteButton onClick={handleComplete}>
            Виконано!
          </CompleteButton>
          <SkipButton onClick={() => window.location.reload()}>
            Пропустити
          </SkipButton>
        </ActionButtons>
      ) : (
        <CompletionMessage>
          Вітаємо! Ви виконали челендж! 🎉
        </CompletionMessage>
      )}
    </ChallengeCard>
  );
}

export default ChallengeDisplay;