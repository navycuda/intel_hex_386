import { Record, NewRecord, RecordType } from "../Record.js";

export const data2C = [
  //  20, 21, 22, 23
       0,  0,  0,  0,
  //  24, 25, 26, 27,
       0,  0,  0,  0,
  //  28, 29, 2A, 2B
       0,  0,  0,  0,
  //  2C, 2D, 2E, 2F,
      17,  0,  0,  0,
  //  30, 31, 33, 33
       0,  0,  0,  0,
  //  34, 35, 36, 37,
       0,  0,  0,  0,
  //  38, 39, 3A, 3B
       0,  0,  0,  0,
  //  3C, 3D, 3E, 3F,
       0,  0,  0,  0,
];
export const newRecord = ():NewRecord => {
  return {
  address: 0x80020020,
  type: RecordType.Data,
  data: Buffer.from([...data2C])
}};


export const getSimpleRecords = () => {
  return [
    new Record(null,{
      address: 0,
      type: RecordType.ExtendedLinearAddress,
      data: Buffer.from([0x80, 0x02])
    }),
    new Record(null,{
      address: 0x80020000,
      type: RecordType.Data,
      data: Buffer.alloc(32,0)
    }),
    new Record(null, newRecord()),
    Record.EoF
  ]
};