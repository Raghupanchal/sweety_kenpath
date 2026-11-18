// Global error handling middleware

function errorHandler(err, req, res, next) {
  console.error('Unhandled Application Error:', err);

  // PostgreSQL specific error handling
  if (err.code === '23505') {
    return res.status(400).json({
      error: 'A unique constraint was violated. Duplicate record exists.',
      detail: err.detail,
    });
  }

  if (err.code === '23514') {
    return res.status(400).json({
      error: 'Data validation check failed against database constraint.',
      detail: err.detail,
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

function notFoundHandler(req, res) {
  return res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
