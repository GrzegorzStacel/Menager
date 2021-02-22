module.exports = (validator) => {
    return (req, res, next) => {
      const { error } = validator(req.body);s
      if (error) return error.details[0].message;
      next();
    }
  }
  