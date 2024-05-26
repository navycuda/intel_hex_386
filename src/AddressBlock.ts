import { Record, RecordType } from "./Record.js";



/** ### Extended Linear Address Block
 * Block of all the records following the extended linear
 * address record, up to but not including the next extended
 * linear address record.
 * 
 * ```
 *   :02000004800278  
 *   :20000000FC4D058064842C80C04D0580FFFFFFFF0346375200000000FFFFFFFFFFFFFFFF26
 *   :20002000FFFFFFFFFFFFFFFF00000000FC1D000001000000010000000300000001000000A9
 *   ...
 * ```
 */
export class AddressBlock{
  private startingAddress: number|undefined;
  /** Bytes of Data, not records */
  private length: number = 0;
  private records: Record[];
  private currentRecord: Record;
  private get endingAddress() { return (this.startingAddress + this.length) >>> 0; }
  hasAbsoluteAddress(absoluteAddress:number):boolean{
    const result = (absoluteAddress >= this.startingAddress && absoluteAddress < this.endingAddress);
    return result;
  }

  constructor();
  constructor(record:Record);
  constructor(record?:Record){
    this.records = [];
    if (record) { this.addRecord(record); }
  }


  /** #### Add a Record to the Address Block
   * @returns true if the record was accepted into the AddressBlock
   */
  addRecord(record:Record):boolean{
    const { length, address, type } = record;

    switch (type){
      case RecordType.ExtendedLinearAddress:{
        if(this.startingAddress === undefined) {
          this.startingAddress = record.ela;
          this.records.push(record);
          return true;
        }
        return false;
      }
      case RecordType.Data:{
        if (!this.length){ this.startingAddress += address; }

        this.length += length;
        this.records.push(record);
        return true;
      }
      case RecordType.EndOfFile:{
        this.records.push(record);
        return true;
      }
      default:{
        throw new Error('Unsupported record added');
      }
    }
  }



  serialize():string{
    return this.records.reduce((a,c)=>a + c.serialize(),'');
  }



  read(from:number):number{
    const address = from & 0xFFFF;

    for (const record of this.records){
      if(record.hasAddress(address)){
        this.currentRecord = record;
        break;
      }
    }
    
    const byte = this.currentRecord.read(address);
    return byte;
  }

  write(value:number,to:number){
    for (const record of this.records){
      if(record.hasAddress(to)){
        this.currentRecord = record;
        break;
      }
    }

    this.currentRecord.write(value,to);
  }
}