const BASE_ID = process.env.AIRTABLE_BASE_ID;
const API_KEY = process.env.AIRTABLE_API_KEY;

function assertAirtableConfig() {
  if (!BASE_ID || !API_KEY) {
    throw new Error("Missing Airtable environment variables.");
  }
}

export async function createAirtableRecord(tableName, fields) {
  assertAirtableConfig();

  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ fields }] }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

export async function findAirtableRecordByEmail(tableName, email) {
  assertAirtableConfig();

  const formula = encodeURIComponent(`{Email} = '${String(email).replace(/'/g, "\\'")}'`);
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}?filterByFormula=${formula}&maxRecords=1`,
    {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.records?.[0] || null;
}

export async function updateAirtableRecord(tableName, recordId, fields) {
  assertAirtableConfig();

  const res = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ records: [{ id: recordId, fields }] }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

export async function upsertUserByEmail(fields) {
  const existing = await findAirtableRecordByEmail("Users", fields.Email);

  if (existing) {
    return updateAirtableRecord("Users", existing.id, fields);
  }

  return createAirtableRecord("Users", fields);
}
