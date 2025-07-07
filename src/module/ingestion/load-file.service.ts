// import { Injectable } from '@nestjs/common';

// @Injectable()
// export class LoadFileService {
//   async isExistingFolder(): Promise<boolean> {
//     return !fs.existsSync(this.fullPath);
//   }

//   private async cleanupTempDirectory(): Promise<void> {
//     if (await this.isExistingFolder()) {
//       this.logger.warn(`Directory does not exist: ${this.fullPath}`);
//       return;
//     }

//     const files = fs.readdirSync(this.fullPath);
//     for (const file of files) {
//       this.insertEachFile(file);
//     }
//   }

//   private insertEachFile(file: string) {
//     const filePath = path.join(this.fullPath, file);

//     try {
//       const stat = fs.statSync(filePath);
//       if (stat.isDirectory()) {
//         fs.rmSync(filePath, { recursive: true, force: true });
//       } else {
//         fs.unlinkSync(filePath);
//       }

//       this.logger.log(`Deleted: ${path.relative(process.cwd(), filePath)}`);
//     } catch (statError) {
//       this.logger.error(`Error processing ${filePath}:`, statError);
//     }
//   }
// }
