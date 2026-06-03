const BASE_ID = process.env.AIRTABLE_BASE_ID;
const API_KEY = process.env.AIRTABLE_API_KEY;

function ensureAirtableEnv() {
  if (!BASE_ID || !API_KEY) {
    throw new Error("Missing AIRTABLE_BASE_ID or AIRTABLE_API_KEY.");
  }
}

function airtableUrl(tableName) {
  ensureAirtableEnv();
  return `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(tableName)}`;
}

function escapeFormulaString(value) {
  return String(value || "").replace(/"/g, '\\"');
}

async function airtableRequest(tableName, options = {}) {
  const res = await fetch(airtableUrl(tableName), {
    ...options,
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data;
}

export async function findUserByEmail(email) {
  const formula = encodeURIComponent(`{Email} = "${escapeFormulaString(email)}"`);
  const res = await fetch(`${airtableUrl("Users")}?filterByFormula=${formula}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  return data.records?.[0] || null;
}

export async function createUserIfMissing({ email, name, googleId }) {
  const existingUser = await findUserByEmail(email);
  if (existingUser) return existingUser;

  const data = await airtableRequest("Users", {
    method: "POST",
    body: JSON.stringify({
      records: [
        {
          fields: {
            Email: email,
            Name: name || "",
            "Google ID": googleId || email,
            "Membership Active": false,
            Role: "User",
          },
        },
      ],
    }),
  });

  return data.records[0];
}

export async function updateUserMembership(userRecordId) {
  const lengthDays = Number(process.env.MEMBERSHIP_LENGTH_DAYS || 365);
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + lengthDays);

  return airtableRequest("Users", {
    method: "PATCH",
    body: JSON.stringify({
      records: [
        {
          id: userRecordId,
          fields: {
            "Membership Active": true,
            "Membership Expiration Date": expiration.toISOString().split("T")[0],
          },
        },
      ],
    }),
  });
}

export async function createPaymentRecord({ userRecordId, amount, orderId, status }) {
  return airtableRequest("Payments", {
    method: "POST",
    body: JSON.stringify({
      records: [
        {
          fields: {
            User: [userRecordId],
            Amount: Number(amount),
            "PayPal Order ID": orderId,
            Status: status,
          },
        },
      ],
    }),
  });
}

export async function createDemographicsRecord({ userRecordId, form }) {
  return airtableRequest("Demographics", {
    method: "POST",
    body: JSON.stringify({
      records: [
        {
          fields: {
            User: [userRecordId],
            "First Name": form.firstName || "",
            "Last Name": form.lastName || "",
            "Date of Birth": form.dateOfBirth || null,
            Age: form.age ? Number(form.age) : null,
            Gender: form.gender || "",
            City: form.city || "",
            State: form.state || "",
            "Zip Code": form.zipCode || "",
            "Phone Number": form.phoneNumber || "",
          },
        },
      ],
    }),
  });
}

export async function createEventPreferenceRecord({ userRecordId, preference }) {
  return airtableRequest("Event Preferences", {
    method: "POST",
    body: JSON.stringify({
      records: [
        {
          fields: {
            User: [userRecordId],
            "Preference Type": preference,
          },
        },
      ],
    }),
  });
}
