"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Home() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState("payment");
  const [message, setMessage] = useState("");

  if (status === "loading") {
    return (
      <main style={styles.page}>
        <div style={styles.card}>Loading...</div>
      </main>
    );
  }

  if (!session) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <h1 style={styles.title}>Event Membership</h1>
          <p style={styles.text}>Sign in with Google to create your account.</p>
          <button style={styles.button} onClick={() => signIn("google")}>
            Sign in with Google
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.topBar}>
          <div>
            <strong>{session.user?.name}</strong>
            <div style={styles.smallText}>{session.user?.email}</div>
          </div>
          <button style={styles.secondaryButton} onClick={() => signOut()}>
            Sign out
          </button>
        </div>

        {message && <div style={styles.notice}>{message}</div>}

        {step === "payment" && (
          <PaymentStep setStep={setStep} setMessage={setMessage} />
        )}

        {step === "demographics" && (
          <DemographicsForm setStep={setStep} setMessage={setMessage} />
        )}

        {step === "events" && (
          <EventPreferenceForm setStep={setStep} setMessage={setMessage} />
        )}

        {step === "complete" && (
          <>
            <h1 style={styles.title}>All Set!</h1>
            <p style={styles.text}>Your account setup is complete.</p>
          </>
        )}
      </div>
    </main>
  );
}

function PaymentStep({ setStep, setMessage }) {
  return (
    <>
      <h1 style={styles.title}>Membership Payment</h1>
      <p style={styles.text}>Pay with Venmo or PayPal to continue.</p>

      <PayPalScriptProvider
        options={{
          clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
          currency: "USD",
          enableFunding: "venmo",
        }}
      >
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={async () => {
            setMessage("");
            const res = await fetch("/api/paypal/create-order", {
              method: "POST",
            });

            const order = await res.json();

            if (!res.ok) {
              throw new Error(order.error || "Could not create PayPal order.");
            }

            return order.id;
          }}
          onApprove={async (data) => {
            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderID }),
            });

            const result = await res.json();

            if (result.status === "COMPLETED") {
              setMessage("Payment complete. Please finish your profile.");
              setStep("demographics");
            } else {
              setMessage("Payment was not completed.");
            }
          }}
          onError={(error) => {
            setMessage(`Payment error: ${error.message || error}`);
          }}
        />
      </PayPalScriptProvider>
    </>
  );
}

function DemographicsForm({ setStep, setMessage }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    age: "",
    city: "",
    state: "",
  });
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/demographics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "Could not save demographics.");
      return;
    }

    setStep("events");
  }

  return (
    <form onSubmit={submit} style={styles.form}>
      <h1 style={styles.title}>Demographic Information</h1>

      <input style={styles.input} placeholder="First Name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
      <input style={styles.input} placeholder="Last Name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
      <input style={styles.input} placeholder="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
      <input style={styles.input} placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      <input style={styles.input} placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />

      <button style={styles.button} disabled={saving}>
        {saving ? "Saving..." : "Continue"}
      </button>
    </form>
  );
}

function EventPreferenceForm({ setStep, setMessage }) {
  const [preference, setPreference] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/event-preference", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preference }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setMessage(data.error || "Could not save event preference.");
      return;
    }

    setStep("complete");
  }

  return (
    <>
      <h1 style={styles.title}>How do you want to pick events?</h1>

      <button
        style={preference === "Date" ? styles.selectedOption : styles.option}
        onClick={() => setPreference("Date")}
      >
        By Date
      </button>

      <button
        style={preference === "Event Type" ? styles.selectedOption : styles.option}
        onClick={() => setPreference("Event Type")}
      >
        By Type of Event
      </button>

      <button style={styles.button} disabled={!preference || saving} onClick={submit}>
        {saving ? "Saving..." : "Finish"}
      </button>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    background: "#f5f5f5",
  },
  card: {
    width: "100%",
    maxWidth: 520,
    background: "white",
    padding: 28,
    borderRadius: 16,
    boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  },
  title: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: 28,
  },
  text: {
    lineHeight: 1.5,
    color: "#444",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: "1px solid #eee",
  },
  smallText: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 12,
    border: "1px solid #ccc",
    borderRadius: 8,
  },
  button: {
    width: "100%",
    padding: 14,
    border: "none",
    borderRadius: 8,
    background: "black",
    color: "white",
    marginTop: 12,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    background: "white",
    cursor: "pointer",
  },
  option: {
    display: "block",
    width: "100%",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    border: "1px solid #ccc",
    background: "white",
    cursor: "pointer",
    textAlign: "left",
  },
  selectedOption: {
    display: "block",
    width: "100%",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    border: "2px solid black",
    background: "#f0f0f0",
    cursor: "pointer",
    textAlign: "left",
  },
  notice: {
    padding: 12,
    borderRadius: 8,
    background: "#f0f0f0",
    marginBottom: 16,
    fontSize: 14,
  },
};
