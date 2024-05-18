import ncc from "ncc_common";
import { DataBlock } from "./DataBlock.js";




/** ### Byte Cursor
 * Handles all of the reading and writing of the Intel Hex Record Data
 */
export class Cursor{
  private dataBlocks:DataBlock[];
  private absoluteAddress: number = 0 >>> 0;
  private currentDataBlock: DataBlock;

  constructor(dataBlocks:DataBlock[]){ this.dataBlocks= dataBlocks }



  read(from?:number|string):number{
    if(from !== undefined) {
      if (typeof from === 'string'){
        from = ncc.convert.toUIntFrom.hex(from);
      }
      this.absoluteAddress = from >>> 0;

      for (const dataBlock of this.dataBlocks){
        if (dataBlock.hasAbsoluteAddress(this.absoluteAddress)){
          this.currentDataBlock = dataBlock;
          break;
        }
      }

      const byte = this.currentDataBlock.read(this.absoluteAddress);
      this.absoluteAddress ++;
      return byte;
    }



    











  }



}