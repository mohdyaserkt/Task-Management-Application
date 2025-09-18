const exclude = (user, keys) => {
  const result = {};
  Object.keys(user).forEach(key => {
    if (!keys.includes(key)) {
      result[key] = user[key];
    }
  });
  return result;
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export {
  exclude,
  asyncHandler
};