import { IKeyValue } from "src/model/keyvalue.interface";

export type IFiles = IKeyValue<IFile>;

export interface IFile {
    filename: string;
    fileurl: string;
    filetype: string;
}
