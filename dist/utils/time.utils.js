"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeStringToDateTime = timeStringToDateTime;
exports.dateTimeToTimeString = dateTimeToTimeString;
exports.isValidTimeString = isValidTimeString;
exports.normalizeTimeToString = normalizeTimeToString;
function timeStringToDateTime(timeString) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
    const match = timeString.match(timeRegex);
    if (!match) {
        throw new Error(`Invalid time format: "${timeString}". Expected HH:MM or HH:MM:SS`);
    }
    const [, hours, minutes, seconds = '00'] = match;
    const date = new Date(Date.UTC(1970, 0, 1, parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10)));
    return date;
}
function dateTimeToTimeString(dateTime) {
    const hours = dateTime.getUTCHours().toString().padStart(2, '0');
    const minutes = dateTime.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}
function isValidTimeString(timeString) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9]))?$/;
    return timeRegex.test(timeString);
}
function normalizeTimeToString(time) {
    if (typeof time === 'string') {
        return time;
    }
    return dateTimeToTimeString(time);
}
//# sourceMappingURL=time.utils.js.map