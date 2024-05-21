# Intel Hex 386

## Introduction

Intel Hex 386 is a typescript library for parsing intel hex files commonly used
for flashing microcontrollers.

## Limitations

This utility currently only works with extended linear address intel hex files.
It is also designed only to deal with intel hex files that already exist, it 
currently does not have the capacity to generate an intel hex file from nothing.


## Dependancies

#### npm
  - ncc_common

## Installation

```bash
>npm install @navycuda/intel_hex_386
```



## Basics

### Import ES Module
#### Vanilla Javascript ES
```javascript
import { IntelHex386 } from "@navycuda/intel_hex_386";
```
#### TypeScript
```typescript
import { IntelHex386, ByteOrder } from "@navycuda/intel_hex_386";
```


### Instantiate 
```typescript
const intelHexFile:string = fs.readFileSync(filepath,'utf8');
const intelHex386 = new IntelHex386(intelHexFile);
```

### Serialize
```typescript
const intelHexSerialized:string = intelHex386.serialize();
```



## The Cursor
Reading & Writing to the intel hex.

### Recommended
#### Destructure the cursor
```typescript
const { cursor } = intelHex386;
```

### Set Byte Order

If the byte order is not set before the first read or write an error will be thrown.

#### Typescript
```typescript
cursor.setByteOrder(ByteOrder.LittleEndian);
```
#### Javascript
```javascript
cursor.setByteOrder("LitteEndian");
```

### Using the cursor for dynamic sequential reads
```typescript
let read = cursor.read(0x12345678);
```
Setting the cursor to a variable allows for sequential reads to be made, from the initial starting address.

This can be useful when a yet unknown number of sequential operations need to take place

```typescript
const getUint32:number = () => read.integer(false,4);
const packedValues = getUint32();
const idObjects = [];

for (let p = 0; p < packedValues; p++){
  const id = getUInt32();
  const sequentialIds = getUInt32();

  for (let s = 0; s < sequentialIds;s++){
    idObjects.push({ id: id + s });
  }
}
```

### Using the cursor to read specific types
```typescript
const unsigned32BitInteger:number = (
  cursor
    .read(0x12345678)
    .integer(false,4)
) // returns a single 32 bit integer

const unsigned32BitInteger:number[] = (
  cursor
    .read(0x12345678)
    .integer(false,4,10)
) // returns an array of 10, 32 bit integers 
```


- Designed to work with the memory addresses of the records.