"use client";

import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Home() {
  const { data: session, status } = useSession();
  const [step, setStep] = useState("payment");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function createUser() {
      if (session?.user?.email) {
        await fetch("/api/users/create", { method: "POST" });
      }
    }

    createUser();
  }, [session]);

  if (status === "loading") {
    return (
      <main className="page">
        <section className="card">
          <p>Loading...</p>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="page">
        <section className="card">
          <h1>Event Membership</h1>
          <p>Create an account with Google to continue.</p>
          <button className="primaryButton" onClick={() => signIn("google")}>
            Sign in with Google
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="card">
        <div className="topRow">
          <div>
            <p className="eyebrow">Signed in as</p>
            <h2>{session.user.name || session.user.email}</h2>
          </div>
          <button className="secondaryButton" onClick={() => signOut()}>
            Sign Out
          </button>
        </div>

        {message && <p className="message">{message}</p>}

        {step === "payment" && (
          <PaymentStep setStep={setStep} setMessage={setMessage} />
        )}

        {step === "demographics" && (
          <DemographicsStep setStep={setStep} setMessage={setMessage} />
        )}

        {step === "events" && (
          <EventPreferenceStep setStep={setStep} setMessage={setMessage} />
        )}

        {step === "complete" && (
          <div>
            <h1>All Set!</h1>
            <p>Your membership setup is complete.</p>
          </div>
        )}
      </section>
    </main>
  );
}

function PaymentStep({ setStep, setMessage }) {
  return (
    <div>
      <h1>Membership Payment</h1>
      <p>Pay securely with PayPal. Venmo will appear when PayPal determines the user/device is eligible.</p>

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
              throw new Error(order.error || "Unable to create PayPal order.");
            }

            return order.id;
          }}
          onApprove={async (data) => {
            setMessage("Confirming payment...");

            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: data.orderID,
              }),
            });

            const details = await res.json();

            if (details.status === "COMPLETED") {
              setMessage("Payment complete.");
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
    </div>
  );
}

function DemographicsStep({ setStep, setMessage }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    age: "",
    gender: "",
    city: "",
    state: "",
    zipCode: "",
    phoneNumber: "",
  });

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(e) {
    e.preventDefault();
    setMessage("");

    const res = await fetch("/api/demographics", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not save demographics.");
      return;
    }

    setStep("events");
  }

  return (
    <form onSubmit={submit} className="form">
      <h1>Demographic Information</h1>

      <input placeholder="First Name" value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
      <input placeholder="Last Name" value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
      <label>
        Date of Birth
        <input type="date" value={form.dateOfBirth} onChange={(e) => updateField("dateOfBirth", e.target.value)} />
      </label>
      <input placeholder="Age" type="number" value={form.age} onChange={(e) => updateField("age", e.target.value)} />
      <select value={form.gender} onChange={(e) => updateField("gender", e.target.value)}>
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
        <option>Non-Binary</option>
        <option>Prefer Not To Say</option>
        <option>Other</option>
      </select>
      <input placeholder="City" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
      <input placeholder="State" value={form.state} onChange={(e) => updateField("state", e.target.value)} />
      <input placeholder="Zip Code" value={form.zipCode} onChange={(e) => updateField("zipCode", e.target.value)} />
      <input placeholder="Phone Number" value={form.phoneNumber} onChange={(e) => updateField("phoneNumber", e.target.value)} />

      <button className="primaryButton" type="submit">
        Continue
      </button>
    </form>
  );
}

function EventPreferenceStep({ setStep, setMessage }) {
  const [preference, setPreference] = useState("");

  async function submit() {
    setMessage("");

    const res = await fetch("/api/event-preference", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ preference }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Could not save preference.");
      return;
    }

    setStep("complete");
  }

  return (
    <div>
      <h1>How would you like to pick events?</h1>

      <div className="optionGrid">
        {["Date", "Event Type", "Both"].map((option) => (
          <button
            key={option}
            className={preference === option ? "option selected" : "option"}
            onClick={() => setPreference(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <button className="primaryButton" disabled={!preference} onClick={submit}>
        Finish
      </button>
    </div>
  );
}
