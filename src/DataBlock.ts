import { AddressBlock } from "./AddressBlock.js";
import { Record, RecordType } from "./Record.js";


/** ### Data Block
 * #### aka Block Data Structure
 * A block of consecutive bytes arranged into the appropriate
 * extended linear address blocks.
 */
export class DataBlock{
  startingAddress: number|undefined;
  length: number = 0;
  addressBlocks: AddressBlock[] = [ new AddressBlock() ];


  constructor();
  constructor(record:Record);
  constructor(record?:Record){
    if (record) { this.addRecord(record); }
  }



  /**
   * @param record if eof, will return true to allow records array to empty
   * @returns true if the record was accepted into the DataBlock
   */
  addRecord(record:Record):boolean{
    const { length, address, type } = record;
    const currentAddress = () => this.startingAddress + this.length;
    const currentAddressBlock = () => this.addressBlocks[this.addressBlocks.length - 1];


    if (type === RecordType.ExtendedLinearAddress){
      if (this.startingAddress === undefined){
        this.startingAddress = record.ela >>> 0;
      }
      if (currentAddress() !== record.ela){
        return false; 
      }
    }

    if (type === RecordType.Data){
      if (!this.length){
        this.startingAddress += address;
      }
      this.length += length;
    }

    if (!currentAddressBlock().addRecord(record)) {
      this.addressBlocks.push(new AddressBlock(record));
    }

    return true;
  }


  serialize():string{
    return this.addressBlocks.reduce((a,c)=>a+c.serialize(),'');
  }
}