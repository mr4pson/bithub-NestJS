import { IKeyValue } from "src/model/keyvalue.interface";
import { IMultilangable } from "src/model/multilangable.interface";

export type IWords = IKeyValue<IKeyValue<IMultilangable>>;
