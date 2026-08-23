import { supabase } from "./supabase";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

async function getAuthHeaders() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error("Unable to get authentication session.");
  }

  if (!session?.access_token) {
    throw new Error("You are not signed in.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.access_token}`,
  };
}

async function request(endpoint, options = {}) {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`
    );
  }

  return data;
}

export async function getTransactions() {
  return request("/api/transactions");
}

export async function createTransaction(transaction) {
  return request("/api/transactions", {
    method: "POST",
    body: JSON.stringify(transaction),
  });
}

export async function updateTransaction(id, transaction) {
  return request(`/api/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(transaction),
  });
}

export async function deleteTransaction(id) {
  return request(`/api/transactions/${id}`, {
    method: "DELETE",
  });
}
