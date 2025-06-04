// Wrapper для асинхронних функцій, щоб уникнути try-catch в кожному контролері
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;