import { LoggerService } from "@nestjs/common";
import * as chalk from "chalk";

export class Logger implements LoggerService {
  private context: string;

  constructor(context: string = "System") {
    this.context = context;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: string, message: any): string {
    const timestamp = this.getTimestamp();
    return `[${timestamp}] [${this.context}] ${level}: ${message}`;
  }

  log(message: any) {
    console.log(chalk.blue(this.formatMessage("INFO", message)));
  }

  success(message: any) {
    console.log(chalk.green(this.formatMessage("SUCCESS", message)));
  }

  error(message: any, trace?: string) {
    console.error(chalk.red(this.formatMessage("ERROR", message)));
    if (trace) {
      console.error(chalk.red(trace));
    }
  }

  warn(message: any) {
    console.warn(chalk.yellow(this.formatMessage("WARN", message)));
  }

  debug(message: any) {
    console.debug(chalk.magenta(this.formatMessage("DEBUG", message)));
  }

  verbose(message: any) {
    console.log(chalk.cyan(this.formatMessage("VERBOSE", message)));
  }
}
