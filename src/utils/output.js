export class ApiResponse {
  status;
  success;
  message;
  constructor(status, success, message, fields) {
    this.status = status;
    this.success = success;
    this.message = message;
    Object.assign(this, ...fields);
  }

  static Output(...fields) {
    return new ApiResponse(200, true, "Success", fields);
  }

  static Error(...fields) {
    return new ApiResponse(500, false, "Fail", fields);
  }
}
