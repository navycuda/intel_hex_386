export interface IntelHexMatch{
  length:string;
  address:string;
  type:string;
  data:string;
  checksum:string;
}



const intelHexRecordAllPattern = /^:([a-f0-9]{2})([a-f0-9]{4})([a-f0-9]{2})([a-f0-9]*)([a-f0-9]{2})$/gmi;
const intelHexRecordOnePattern = /^:(?<length>[a-f0-9]{2})(?<address>[a-f0-9]{4})(?<type>[a-f0-9]{2})(?<data>[a-f0-9]*)(?<checksum>[a-f0-9]{2})$/si;


/**
 * Used to extract only the intel hex records and parse them down
 * to individual record objects for further processing
 * @param intelHexDocument The Intel Hex 386 document, UTF8
 * @see {@link https://en.wikipedia.org/wiki/Intel_HEX}
 * @returns { IntelHexMatch[] }
 */
export const getIntelHexRecordMatches = (intelHexDocument:string):IntelHexMatch[] => {
  const recordStringMatches:string[] = intelHexDocument.match(intelHexRecordAllPattern);

  const intelHexMatches:IntelHexMatch[] = [];

  for (const recordString of recordStringMatches){
    const recordMatch = recordString.match(intelHexRecordOnePattern).groups as unknown as IntelHexMatch;
    intelHexMatches.push(recordMatch);
  }

  return intelHexMatches;
}

export const splitBuffer = (buffer:Buffer, chunkSize:number):Buffer[] => {
  if (!Buffer.isBuffer(buffer)){
    throw new TypeError('Input must be a buffer');
  }
  if (typeof chunkSize !== 'number' || chunkSize <= 0){
    throw new TypeError('Chunk size must be a positive number');
  }

  const result:Buffer[] = [];

  let start = 0;

  while (start < buffer.length) {
    const end = Math.min(start + chunkSize, buffer.length);
    const chunk = buffer.subarray(start,end);
    result.push(chunk);
    start = end;
  }

  return result;
}