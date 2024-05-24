[<- Overview](../README.md)
# Intel Hex 386 - Cursor

# IN DEVELOPMENT - NEEDS TESTING - DO NOT USE IN PRODUCTION CODE

## Introduction

The cursor is how the byte data of the intel hex file is read or written to.



## Instantiation

When the intel hex 386 document is instantiated, it populates the datablocks. Then 
the cursor is instantiated using the datablocks from the intel hex file.

## Setting the Byte Order

Specifically addressing the Endianess of the stored data is core to the function of
this package.  As such, before the cursor can be used the byte order must be specified.

Since the byte order is not stored in the intel hex 386 records, this must be provided 
from an external source.

For typescript, an enum has been provided:
```typescript
export enum ByteOrder{
  BigEndian = 'BigEndian',
  LittleEndian = 'LittleEndian'
}
```

For javascript, the string values have been optionally provided for autocorrect:
```javascript
export type ByteOrderAsString = "BigEndian"|"LittleEndian";
```

Set the byte order.  If the byte order has not been set before any read or write attempts
the package will throw an error.
```typescript
const intelHex386 = new IntelHex386(intelHexFile);
const { cursor } = intelHex386;
cursor.setByteOrder(ByteOrder.LittleEndian);
```
___
## Reading the Bytes

These methods are used for reading the different primative datatypes from the intel hex binary.

### cursor.read(from)
- 'from' (string|number): Accepts hexidecimal values (with or without 0x), or unsigned integer. This would be the address in memory space as defined in the intel hex file where the read should start.

Read is a closure and thus must be called prior to extracting bytes from the intel hex.
```typescript
let read = cursor.read('0x12345678');
```

#### returns:
* [byte](#readfrombytebytelength)
* [integer](#readfromintegersignedbytelengthelementlength)
* [fixedPoint](#readfromfixedpointsignedbytelengthscalarelementlength)
* [floatingPoint](#readfromfloatingpointelementlength)
* [string](#readfromstringcharacterlength)

### read(from).byte(byteLength?)
- 'byteLength' (number|undefined): If no byteLength is specified, a single byte is returned.  If provided, a buffer with that length of bytes is returned.

Read a single byte, or a series of bytes sequentially ignoring endianness.

#### returns (number|buffer)

### read(from).integer(signed,byteLength,elementLength?)
- 'signed' (boolean): Is this a signed integer?
- 'byteLength' (1|2|3|4): What is the byteLength of this integer?
- 'elementLength?' (number|undefined): If an element length is provided the return is a number array of this size.

Read an integer or integers.  Has support for 3 byte (24 bit) integer, but this is an unverified feature at this time.

#### returns (number|number[])

### read(from).fixedPoint(signed,byteLength,scalar?,elementLength?)
- 'signed' (boolean): Does this fixed point come from a signed or unsigned integer?
- 'byteLength' (1|2|3|4): What is the byteLength of this integer?
- 'scalar?' ({multiplier?:number,offset?:number}): Technically, can't have a fixedPoint without the scalar value, however it's made optional here for versatility.
- 'elementLength?' (number|undefined): If an element length is provided the return is a number array of this size

Although the scalar is offered optionally, there cannot be a fixedPoint value without a scalar multiplier, otherwise it's just an integer.  Scalar offset is used in the situations where a value is represented by a single byte, but the human readable value is in a different range, ie: -100 to 100.

#### returns (number|number[])

### read(from).floatingPoint(elementLength?)
- 'elementLength?' (number|undefined): If an element length is provided the return is a number array of this size

Read a float or floats.  Single precision floating point value.

#### returns (number|number[])

### read(from).string(characterLength)
- 'characterLength' (number): How many characters does this string contain.

Read a string of characters.

#### returns (string)



___
## Writing the Bytes

### cursor.write(to)
- 'to' (string|number): Accepts hexidecimal values (with or without 0x), or unsigned integer. This would be the address in memory space as defined in the intel hex file where the read should start.

Write is a closure and thus must be called prior to extracting bytes from the intel hex.
```typescript
let write = cursor.write('0x12345678');
```

#### returns:
* [byte]()
* [integer]()
* [fixedPoint]()
* [floatingPoint]()
* [string]()

### write(to).byte(value)
- 'value' (number|number[]) & 0xFF: The value or values to be written as bytes.  All values will be truncated to a byte.

Write a byte or bytes sequentially, ignoring endianness.

#### returns void

### write(to).integer(value,signed,byteLength)
- 'value' (number|number[]): The value or values to be written as integers.
- 'signed' (boolean): Is this a signed integer?
- 'byteLength' (1|2|3|4): How many bytes for this integer?

Writes an integer or integers to the binary.  As with read, 24 bit values are supported, however the implementation is uncertain.

#### returns void

### write(to).fixedPoint(value,signed,byteLength,scalar?)
- 'value' (number|number[]): The value or values to be written as fixed point values.
- 'signed' (boolean): Is this a signed fixed point?
- 'byteLength' (1|2|3|4): How many bytes for this fixed point value?

As with integers, has 24 bit support but the implementation is unknown.  Otherwise, reverses the effects
of the scalar and writes that value to the binary.

#### returns void

### write(to).floatingPoint(value)
- 'value' (number|number[]): The value or values to be written as floats.

Write floating point values.

#### returns void

### write(to).string(str)
- 'stg' (string): The string to write to the binary.  Encoding is UTF8.

Write a string to the binary.  Truncating or padding the string needs to be handled externally.

#### returns void