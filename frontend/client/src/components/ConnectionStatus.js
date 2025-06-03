import React from 'react';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
`;

const StatusContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  background-color: ${props => props.isConnected ? '#c6f6d5' : '#fed7d7'};
  color: ${props => props.isConnected ? '#276749' : '#c53030'};
  padding: 10px 20px;
  border-radius: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
    padding: 8px 15px;
    font-size: 0.9rem;
  }
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.isConnected ? '#48bb78' : '#e53e3e'};
  margin-right: 10px;
  animation: ${pulse} 2s infinite;
`;

const StatusText = styled.span`
  font-weight: 500;
`;

function ConnectionStatus({ isConnected }) {
  return (
    <StatusContainer isConnected={isConnected}>
      <StatusDot isConnected={isConnected} />
      <StatusText>
        {isConnected ? 'Підключено' : 'Відключено'}
      </StatusText>
    </StatusContainer>
  );
}

export default ConnectionStatus;