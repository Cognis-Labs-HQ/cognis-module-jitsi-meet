function readDatabaseTimestampValue(value) {
    if (value == null) return null;
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value.toISOString();
    }
    return String(value);
}
export { readDatabaseTimestampValue as readDbTimestampValue };
