import { Cursor } from "./cursor/Cursor.js";
import { DataBlock } from "./DataBlock.js";
import { Record, RecordType } from "./Record.js";
import { getIntelHexRecordMatches, splitBuffer } from "./Tools.js";

export interface BlockDataStructure{
  address:number,
  binary:Buffer
}


const getDataBlocks = (records:Record[]):DataBlock[] => {
  const dataBlocks: DataBlock[] = [ new DataBlock() ];
  const currentDataBlock = ():DataBlock => dataBlocks[dataBlocks.length - 1];

  for (const record of records){
    if (currentDataBlock().addRecord(record)) { continue; }
    dataBlocks.push(new DataBlock(record))
  }

  return dataBlocks;
}



/** ## Intel Hex 386
 * class representing the intel hex document as javascript
 * classes/objects.
 * 
 * During instantiation only the intel hex records are extracted
 * from the supplied intel hex document.
 * 
 * If no string is provided, an empty IntelHex386 is 
 * returned with no cursor
 */
export class IntelHex386{
  private dataBlocks: DataBlock[];
  cursor:Cursor;

  constructor(intelHexDocument:string);
  constructor(intelHexDocument?:undefined)
  constructor(intelHexDocument?:string){
    if (!intelHexDocument) { return; }
    const recordMatches = getIntelHexRecordMatches(intelHexDocument);
    const records = recordMatches.map(rm => new Record(rm));
    this.dataBlocks = getDataBlocks(records);
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


  /** ### Create From
   * Method to create a new intel hex 386 instantiation using buffers with starting addresses.
   */
  static from(blockDataStructure:BlockDataStructure[]):IntelHex386;
  static from(blockDataStructure:BlockDataStructure[],chunkSize:number):IntelHex386;
  static from(blockDataStructure:BlockDataStructure[],chunkSize:number = 32):IntelHex386{
    const intelHex = new IntelHex386();

    const records:Record[] = [];

    for (const bds of blockDataStructure){

      const extendedLinearAddress = (bds.address >>> 0) & 0xFFFF0000;
      const startingAddress = (bds.address >>> 0) & 0x0000FFFF;
      const length = bds.binary.length;

      const getCurrentAddress = (index:number):number =>{
        return (extendedLinearAddress + startingAddress + index) >>> 0;
      }
      const getCurrentExtraLinearAddress = (currentAddress:number):Buffer => {
        const buffer = Buffer.alloc(2);
        buffer[0] = (currentAddress >> 24) & 0xFF;
        buffer[1] = (currentAddress >> 16) & 0xFF;
        return buffer;
      }

      const buffers = splitBuffer(bds.binary,chunkSize);

      
      let byteIndex = 0 >>> 0;
      for (let i = 0; i < buffers.length; i++){
        const cB = buffers[i];
        const cA = getCurrentAddress(byteIndex);
        byteIndex += cB.length;

        // Is an extended linear address needed?
        if (i === 0 || (cA & 0xFFFF) === 0){
          //add extra linear address
          records.push(new Record(null,{
            address: 0,
            type: RecordType.ExtendedLinearAddress,            
            data: getCurrentExtraLinearAddress(cA),
          }))
        }

        
        // Add this buffers data as a record
        records.push(new Record(null,{
          address: cA,
          type: RecordType.Data,
          data: cB
        }));
      }

    }

    records.push(Record.EoF);

    intelHex.dataBlocks = getDataBlocks(records);
    intelHex.cursor = new Cursor(intelHex.dataBlocks);


    return intelHex;
  }
}
