const errorHandler = (statusCode, message) => {
  const error = new Error();
  error.statusCode = statusCode;
  error.status = statusCode;
  error.message = message;

  return error;
};

export default errorHandler;
