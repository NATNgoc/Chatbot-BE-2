import { Injectable } from '@nestjs/common';
import { SimpleDirectoryReader } from "@llamaindex/readers/directory";
import { Document } from 'llamaindex';
import { IngestionConstant } from 'src/common/constant';

@Injectable()
export class LoaderService {
    async loadDocuments(): Promise<Document[]>
    {
        const reader = new SimpleDirectoryReader()
        return reader.loadData(IngestionConstant.DATA_RESOURCE_URL);
    }
}
