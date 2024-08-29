/**
 * Serializes an object into a Uint8Array.
 * @param object - The object to serialize.
 * @returns A Uint8Array representation of the serialized object.
 */
export function serialize<T>(object: T): Uint8Array {
    return Buffer.from(JSON.stringify(object));
}

/**
 * Deserializes a Uint8Array into an object of type T.
 * @param buffer - The Uint8Array to deserialize.
 * @returns The deserialized object of type T.
 */
export function deserialize<T>(buffer: Uint8Array): T {
    return JSON.parse(buffer.toString()) as T;
}
