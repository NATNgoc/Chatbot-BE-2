import { Injectable } from '@nestjs/common';
import { Document, Metadata } from 'llamaindex';
import { NON_VALUABLE_LABELS_IN_METADATA } from './constant';
@Injectable()
export class EnhanceDocumentService {
  private readonly llmTransformer: any;

  async enhanceDocuments(
    documents: Document<Metadata>[],
  ): Promise<Document<Metadata>[]> {
    const cleanedDocuments = await this.removeNonValuableMetadata(documents);
    return cleanedDocuments;
  }

  async addTextSplittersAndExtractors() {}

  async removeNonValuableMetadata(
    documents: Document<Metadata>[],
  ): Promise<Document<Metadata>[]> {
    return documents.map((doc) => {
      if (!doc.metadata) {
        return doc;
      }

      const filteredMetadata = Object.fromEntries(
        Object.entries(doc.metadata).filter(
          ([key]) => !NON_VALUABLE_LABELS_IN_METADATA.includes(key),
        ),
      );

      return new Document({
        ...doc,
        metadata: filteredMetadata as Metadata,
      });
    });
  }
}
