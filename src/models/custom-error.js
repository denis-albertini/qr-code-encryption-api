export default class CustomError extends Error {
  constructor(message, status, ...errors) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}
