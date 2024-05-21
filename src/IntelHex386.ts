import { Cursor } from "./cursor/Cursor.js";
import { DataBlock } from "./DataBlock.js";
import { Record } from "./Record.js";
import { getIntelHexRecordMatches } from "./Tools.js";


/** ## Intel Hex 386
 * class representing the intel hex document as javascript
 * classes/objects.
 * 
 * During instantiation only the intel hex records are extracted
 * from the supplied intel hex document.
 */
export class IntelHex386{
  private dataBlocks: DataBlock[] = [ new DataBlock() ];
  cursor:Cursor;

  constructor(intelHexDocument:string){
    const recordMatches = getIntelHexRecordMatches(intelHexDocument);
    const records = recordMatches.map(rm => new Record(rm));

    const currentDataBlock = ():DataBlock => this.dataBlocks[this.dataBlocks.length - 1];
    for (const record of records){
      if (currentDataBlock().addRecord(record)) { continue; }
      this.dataBlocks.push(new DataBlock(record))
    }

    this.cursor = new Cursor(this.dataBlocks);
  }

  /** ### Serialize
   * To a UTF8 formatted Intel Hex 386 Document
   * 
   * @returns serialized intel hex records.
   */
  serialize():string{
    return this.dataBlocks.reduce((a,c)=>a+c.serialize(),'');
  }
}