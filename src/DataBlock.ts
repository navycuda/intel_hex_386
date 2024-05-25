import { AddressBlock } from "./AddressBlock.js";
import { Record, RecordType } from "./Record.js";

/** ### Data Block
 * #### aka Block Data Structure
 * A block of consecutive bytes arranged into the appropriate
 * extended linear address blocks.
 */
export class DataBlock{
  private startingAddress: number|undefined;
  private length: number = 0;
  private addressBlocks: AddressBlock[] = [ new AddressBlock() ];
  private currentAddressBlock:AddressBlock;
  private get endingAddress(){ return (this.startingAddress + this.length) >>> 0; }

  hasAbsoluteAddress(absoluteAddress:number):boolean{
    return (absoluteAddress >= this.startingAddress && absoluteAddress <= this.endingAddress);
  }


  constructor();
  constructor(record:Record);
  constructor(record?:Record){
    if (record) { this.addRecord(record); }
  }



  /** #### Add Record
   * Used for adding records to the data block
   * @param record if eof, will return true to allow records array to empty
   * @returns true if the record was accepted into the DataBlock
   */
  addRecord(record:Record):boolean{
    const { length, address, type } = record;
    const currentAddress = () => (this.startingAddress + this.length) >>> 0;
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


  read(from:number):number{
    if (from > this.endingAddress) {
      throw new Error('Requested absolute address is not in this DataBlock');
    }

    for (const addressBlock of this.addressBlocks){
      if(addressBlock.hasAbsoluteAddress(from)){
        this.currentAddressBlock = addressBlock;
        break;
      }
    }

    const byte = this.currentAddressBlock.read(from);
    return byte;
  }

  write(value:number,to:number){
    if (to > this.endingAddress){
      throw new Error('Requested Absolute address is not in this DataBlock');
    }

    for (const addressBlock of this.addressBlocks){
      if(addressBlock.hasAbsoluteAddress(to)){
        this.currentAddressBlock = addressBlock;
        break;
      }
    }

    this.currentAddressBlock.write(value,to);
  }
}