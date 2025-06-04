import React from 'react';
import styled, { keyframes } from 'styled-components';

const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ErrorContainer = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 15px 20px;
  border-radius: 10px;
  margin: 20px auto;
  max-width: 600px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: ${slideIn} 0.3s ease-out;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const ErrorText = styled.p`
  margin: 0;
  font-weight: 500;
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #c53030;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  margin-left: 15px;
  line-height: 1;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.2);
  }
`;

function ErrorMessage({ message, onClose }) {
  return (
    <ErrorContainer>
      <ErrorText>{message}</ErrorText>
      <CloseButton onClick={onClose} aria-label="Закрити повідомлення">
        ×
      </CloseButton>
    </ErrorContainer>
  );
}

export default ErrorMessage;