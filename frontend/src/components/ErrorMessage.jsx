import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="error-alert">
      <AlertCircle className="error-icon" size={24} />
      <div className="error-content">
        <h4>Something went wrong</h4>
        <p>{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="btn-retry">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
