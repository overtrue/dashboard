export class DashboardError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.name = "DashboardError"
    this.statusCode = statusCode
  }
}
