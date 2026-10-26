/**
 * Safe SQL Date and Datetime formatting helpers for MySQL / MariaDB
 */

function toSqlDatetime(val) {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val.toISOString().slice(0, 19).replace('T', ' ');
  }
  const str = String(val).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) {
    return str;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return `${str} 00:00:00`;
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

function toSqlDate(val) {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return val.toISOString().slice(0, 10);
  }
  const str = String(val).trim();
  if (!str) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

module.exports = {
  toSqlDatetime,
  toSqlDate
};
