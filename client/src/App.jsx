import React, { useEffect, useMemo, useState } from "react";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "./api";
import { supabase } from "./supabase";
import {
  LayoutDashboard,
  ReceiptText,
  WalletCards,
  BarChart3,
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Search,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Utensils,
  ShoppingBag,
  Car,
  Home,
  HeartPulse,
  Plane,
  Wifi,
  Coffee,
  CreditCard,
  Trash2,
  Pencil,
  X,
  Menu,
  Moon,
  Sun,
  ChevronDown,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Target,
  CalendarDays,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  CircleDollarSign,
  LoaderCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const CATS = [
  ["Food & Dining", "expense", "Utensils"],
  ["Groceries", "expense", "ShoppingBag"],
  ["Transportation", "expense", "Car"],
  ["Shopping", "expense", "ShoppingBag"],
  ["Bills & Utilities", "expense", "Wifi"],
  ["Entertainment", "expense", "Coffee"],
  ["Healthcare", "expense", "HeartPulse"],
  ["Travel", "expense", "Plane"],
  ["Rent", "expense", "Home"],
  ["Subscriptions", "expense", "CreditCard"],
  ["Salary", "income", "CircleDollarSign"],
  ["Freelance", "income", "CircleDollarSign"],
  ["Investment", "income", "TrendingUp"],
  ["Other Income", "income", "CircleDollarSign"],
];

const iconMap = {
  Utensils,
  ShoppingBag,
  Car,
  Wifi,
  Coffee,
  HeartPulse,
  Plane,
  Home,
  CreditCard,
  CircleDollarSign,
  TrendingUp,
};

const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const id = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now() + "-" + Math.random();

const demo = [
  [
    "Salary",
    "Monthly Salary",
    65000,
    "income",
    "Salary",
    "Bank Transfer",
    "2026-08-01",
  ],
  [
    "Rent",
    "Apartment rent",
    18000,
    "expense",
    "Rent",
    "Bank Transfer",
    "2026-08-02",
  ],
  [
    "Groceries",
    "Weekly groceries",
    4200,
    "expense",
    "Groceries",
    "UPI",
    "2026-08-04",
  ],
  [
    "Food & Dining",
    "Dinner with friends",
    1450,
    "expense",
    "Food & Dining",
    "UPI",
    "2026-08-06",
  ],
  [
    "Transportation",
    "Cab rides",
    980,
    "expense",
    "Transportation",
    "UPI",
    "2026-08-08",
  ],
  [
    "Subscriptions",
    "Streaming",
    699,
    "expense",
    "Subscriptions",
    "Credit Card",
    "2026-08-09",
  ],
  [
    "Shopping",
    "Clothing",
    3200,
    "expense",
    "Shopping",
    "Credit Card",
    "2026-08-12",
  ],
  [
    "Healthcare",
    "Pharmacy",
    850,
    "expense",
    "Healthcare",
    "UPI",
    "2026-08-15",
  ],
  [
    "Freelance",
    "Landing page project",
    12000,
    "income",
    "Freelance",
    "Bank Transfer",
    "2026-08-17",
  ],
  [
    "Food & Dining",
    "Lunch",
    620,
    "expense",
    "Food & Dining",
    "UPI",
    "2026-08-18",
  ],
].map((x) => ({
  id: id(),
  description: x[1],
  amount: x[2],
  type: x[3],
  category: x[4],
  payment: x[5],
  date: x[6],
  notes: "",
  createdAt: Date.now(),
}));

function App() {
const [page, setPage] = useState(
  () => sessionStorage.getItem("smart-expense-page") || "dashboard"
);
useEffect(() => {
  sessionStorage.setItem("smart-expense-page", page);
}, [page]);
  const [mobile, setMobile] = useState(false);

  const [dark, setDark] = useState(
    () => localStorage.getItem("set-dark") === "1"
  );

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  /*
   * PostgreSQL-backed transactions
   */
  const [tx, setTx] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionError, setTransactionError] = useState("");

  const [budgets, setBudgets] = useState(
    () =>
      JSON.parse(localStorage.getItem("set-budgets") || "null") || [
        {
          id: id(),
          category: "Food & Dining",
          amount: 6000,
          month: "2026-08",
        },
        {
          id: id(),
          category: "Groceries",
          amount: 9000,
          month: "2026-08",
        },
        {
          id: id(),
          category: "Transportation",
          amount: 4000,
          month: "2026-08",
        },
        {
          id: id(),
          category: "Shopping",
          amount: 5000,
          month: "2026-08",
        },
      ]
  );

  const [toast, setToast] = useState("");

  useEffect(() => {
    localStorage.setItem("set-budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("set-dark", dark ? "1" : "0");
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  /*
   * ----------------------------------------------------
   * SUPABASE AUTHENTICATION
   * ----------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const {
          data: { user: currentUser },
          error,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (error || !currentUser) {
          setUser(null);
        } else {
          setUser({
            id: currentUser.id,
            email: currentUser.email,
            name:
              currentUser.user_metadata?.name ||
              currentUser.email?.split("@")[0] ||
              "User",
          });
        }
      } catch (error) {
        console.error("Load user error:", error);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          name:
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User",
        });
      } else {
        setUser(null);
        setTx([]);
      }

      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * ----------------------------------------------------
   * LOAD TRANSACTIONS FROM POSTGRESQL
   * ----------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const loadTransactions = async () => {
      if (!user) {
        setTx([]);
        setTransactionsLoading(false);
        setTransactionError("");
        return;
      }

      setTransactionsLoading(true);
      setTransactionError("");

      try {
        const data = await getTransactions();

        if (!mounted) return;

        /*
         * Backend returns an array.
         */
        if (Array.isArray(data)) {
          setTx(data);
        } else {
          setTx([]);
          console.warn("Unexpected transactions response:", data);
        }
      } catch (error) {
        console.error("Load transactions error:", error);

        if (!mounted) return;

        setTransactionError(
          error.message || "Unable to load transactions."
        );
      } finally {
        if (mounted) {
          setTransactionsLoading(false);
        }
      }
    };

    loadTransactions();

    return () => {
      mounted = false;
    };
  }, [user]);

  /*
   * ----------------------------------------------------
   * NOTIFICATION
   * ----------------------------------------------------
   */

  const notify = (message) => {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 2500);
  };

  /*
   * ----------------------------------------------------
   * ADD TRANSACTION
   * PostgreSQL INSERT
   * ----------------------------------------------------
   */

  const addTx = async (transaction) => {
    try {
      setTransactionError("");

      const savedTransaction = await createTransaction({
        description: transaction.description,
        amount: Number(transaction.amount),
        type: transaction.type,
        category: transaction.category,
        payment: transaction.payment,
        date: transaction.date,
        notes: transaction.notes || "",
      });

      setTx((current) => [savedTransaction, ...current]);

      notify("Transaction added");
    } catch (error) {
      console.error("Add transaction error:", error);

      setTransactionError(
        error.message || "Unable to add transaction."
      );

      notify("Unable to add transaction");
    }
  };

  /*
   * ----------------------------------------------------
   * UPDATE TRANSACTION
   * PostgreSQL UPDATE
   * ----------------------------------------------------
   */

  const updateTx = async (transaction) => {
    try {
      setTransactionError("");

      const updatedTransaction = await updateTransaction(
        transaction.id,
        {
          description: transaction.description,
          amount: Number(transaction.amount),
          type: transaction.type,
          category: transaction.category,
          payment: transaction.payment,
          date: transaction.date,
          notes: transaction.notes || "",
        }
      );

      setTx((current) =>
        current.map((item) =>
          item.id === updatedTransaction.id
            ? updatedTransaction
            : item
        )
      );

      notify("Transaction updated");
    } catch (error) {
      console.error("Update transaction error:", error);

      setTransactionError(
        error.message || "Unable to update transaction."
      );

      notify("Unable to update transaction");
    }
  };

  /*
   * ----------------------------------------------------
   * DELETE TRANSACTION
   * PostgreSQL DELETE
   * ----------------------------------------------------
   */

  const deleteTx = async (transaction) => {
    try {
      setTransactionError("");

      await deleteTransaction(transaction.id);

      setTx((current) =>
        current.filter((item) => item.id !== transaction.id)
      );

      notify("Transaction deleted");
    } catch (error) {
      console.error("Delete transaction error:", error);

      setTransactionError(
        error.message || "Unable to delete transaction."
      );

      notify("Unable to delete transaction");
    }
  };

  /*
   * ----------------------------------------------------
   * AUTH LOADING
   * ----------------------------------------------------
   */

  if (authLoading) {
    return (
      <div className="auth">
        <div className="auth-card">
          <div className="brand large">
            <span className="brand-mark">
              <WalletCards size={22} />
            </span>
            <span>Smart Expense</span>
          </div>

          <div className="auth-copy">
            <p className="eyebrow">SMART EXPENSE</p>

            <h1>Loading your account...</h1>

            <p>Checking your secure session.</p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ----------------------------------------------------
   * NOT SIGNED IN
   * ----------------------------------------------------
   */

  if (!user) {
    return <Auth dark={dark} setDark={setDark} />;
  }

  /*
   * ----------------------------------------------------
   * MAIN APP
   * ----------------------------------------------------
   */

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={setPage}
        onLogout={async () => {
          try {
            await supabase.auth.signOut();
          } catch (error) {
            console.error("Logout error:", error);
          }

          setUser(null);
          setTx([]);
        }}
        mobile={mobile}
        setMobile={setMobile}
        user={user}
      />

      <main className="main">
        <header className="topbar">
          <button
            className="icon-btn mobile-menu"
            onClick={() => setMobile(!mobile)}
          >
            <Menu size={20} />
          </button>

          <div className="crumb">
            <span>Workspace</span>
            <b>/</b>
            <strong>
              {page === "dashboard"
                ? "Dashboard"
                : page[0].toUpperCase() + page.slice(1)}
            </strong>
          </div>

          <div className="top-actions">
            <button className="icon-btn">
              <Bell size={19} />
            </button>

            <button
              className="icon-btn"
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <div className="avatar">
              {(user.name || "P").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="content">
          {transactionError && (
            <div className="api-error">
              <AlertTriangle size={18} />

              <div>
                <strong>Transaction database error</strong>

                <span>{transactionError}</span>
              </div>

              <button
                className="icon-btn ghost"
                onClick={() => setTransactionError("")}
              >
                <X size={17} />
              </button>
            </div>
          )}

          {page === "dashboard" && (
            <Dashboard
              tx={tx}
              budgets={budgets}
              setPage={setPage}
              loading={transactionsLoading}
              user={user}
            />
          )}

          {page === "transactions" && (
            <Transactions
              tx={tx}
              onAdd={addTx}
              onUpdate={updateTx}
              onDelete={deleteTx}
              loading={transactionsLoading}
            />
          )}

          {page === "budgets" && (
            <Budgets
              budgets={budgets}
              setBudgets={setBudgets}
              tx={tx}
              notify={notify}
            />
          )}

          {page === "analytics" && <Analytics tx={tx} />}

          {page === "insights" && (
            <Insights tx={tx} budgets={budgets} />
          )}

          {page === "settings" && (
            <Settings
              user={user}
              setUser={setUser}
              tx={tx}
              setTx={setTx}
              dark={dark}
              setDark={setDark}
              notify={notify}
            />
          )}
        </div>
      </main>

      {toast && (
        <div className="toast">
          <CheckCircle2 size={18} />
          {toast}
        </div>
      )}
    </div>
  );
}

/*
 * =========================================================
 * AUTH
 * =========================================================
 */

function Auth({ dark, setDark }) {
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email || !password || (signup && !name)) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (signup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim(),
            },
          },
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          setMessage("Account created successfully.");
        } else {
          setMessage(
            "Account created. Please check your email to confirm your account."
          );
        }
      } else {
        const { error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) {
          throw error;
        }
      }
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="brand large">
          <span className="brand-mark">
            <WalletCards size={22} />
          </span>

          <span>Smart Expense</span>
        </div>

        <div className="auth-copy">
          <p className="eyebrow">
            PERSONAL FINANCE, SIMPLIFIED
          </p>

          <h1>
            {signup
              ? "Build better money habits."
              : "Welcome back."}
          </h1>

          <p>
            Track smarter. Spend better. Understand your money.
          </p>
        </div>

        <form onSubmit={submit}>
          {signup&&<label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your full name" autoComplete="name"/></label>}

          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete={
                signup ? "new-password" : "current-password"
              }
            />
          </label>

          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-message">
              {message}
            </div>
          )}

          <button
            className="primary wide"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : signup
              ? "Create account"
              : "Sign in"}

            {!loading && <ArrowUpRight size={17} />}
          </button>
        </form>

        <div className="auth-switch">
          {signup
            ? "Already have an account?"
            : "New to Smart Expense?"}{" "}

          <button
            type="button"
            onClick={() => {
              setSignup(!signup);
              setError("");
              setMessage("");
            }}
          >
            {signup ? "Sign in" : "Create an account"}
          </button>
        </div>

        <button
          className="theme-auth"
          type="button"
          onClick={() => setDark(!dark)}
        >
          {dark ? <Sun size={17} /> : <Moon size={17} />}

          {dark ? "Light mode" : "Dark mode"}
        </button>

        <p className="demo-note">
          Your account is secured by Supabase Authentication.
          Your financial data is stored securely in PostgreSQL.
        </p>
      </div>

      <div className="auth-art">
        <div className="art-glow" />

        <div className="art-card">
          <div className="mini-head">
            <span>August overview</span>
            <TrendingUp size={17} />
          </div>

          <div className="art-value">₹58,720</div>

          <div className="mini-chart">
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>

          <div className="mini-row">
            <b>Monthly savings</b>
            <strong>+18.4%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * SIDEBAR
 * =========================================================
 */

function Sidebar({
  page,
  setPage,
  onLogout,
  mobile,
  setMobile,
  user,
}) {
  const nav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["transactions", "Transactions", ReceiptText],
    ["budgets", "Budgets", WalletCards],
    ["analytics", "Analytics", BarChart3],
    ["insights", "AI Insights", Sparkles],
  ];

  const displayName =
    user?.name ||
    user?.email?.split("@")[0] ||
    "User";

  return (
    <aside
      className={"sidebar " + (mobile ? "open" : "")}
    >
      <div className="brand">
        <span className="brand-mark">
          <WalletCards size={20} />
        </span>

        <span>Smart Expense</span>
      </div>

      <div className="side-label">OVERVIEW</div>

      <nav>
        {nav.map(([k, n, I]) => (
          <button
            key={k}
            className={page === k ? "active" : ""}
            onClick={() => {
              setPage(k);
              setMobile(false);
            }}
          >
            <I size={18} />

            <span>{n}</span>

            {k === "insights" && (
              <span className="ai-pill">AI</span>
            )}
          </button>
        ))}
      </nav>

      <div className="side-bottom">
        <button
          className={page === "settings" ? "active" : ""}
          onClick={() => {
            setPage("settings");
            setMobile(false);
          }}
        >
          <SettingsIcon size={18} />
          Settings
        </button>

        <div className="side-user">
          <div className="avatar">
            {displayName.slice(0, 1).toUpperCase()}
          </div>

          <div>
            <b>{displayName}</b>
            <span>Personal account</span>
          </div>

          <MoreHorizontal size={17} />
        </div>

        <button className="logout" onClick={onLogout}>
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

/*
 * =========================================================
 * DASHBOARD
 * =========================================================
 */

function Dashboard({
  tx,
  budgets,
  setPage,
  loading,
  user,
}) {
  const month = tx.filter((t) =>
    String(t.date || "").startsWith("2026-08")
  );

  const income = month
    .filter((t) => t.type === "income")
    .reduce((a, t) => a + Number(t.amount || 0), 0);

  const expense = month
    .filter((t) => t.type === "expense")
    .reduce((a, t) => a + Number(t.amount || 0), 0);

  const cats = Object.entries(
    month
      .filter((t) => t.type === "expense")
      .reduce((a, t) => {
        a[t.category] =
          (a[t.category] || 0) + Number(t.amount || 0);

        return a;
      }, {})
  ).sort((a, b) => b[1] - a[1]);

  const days = [1, 4, 7, 10, 13, 16, 19, 22].map(
    (d) => ({
      day: `Aug ${d}`,
      spend: month
        .filter(
          (t) =>
            t.type === "expense" &&
            +String(t.date).slice(8) <= d
        )
        .reduce((a, t) => a + Number(t.amount || 0), 0),
    })
  );

  return (
    <>
      <PageTitle
        title={`Good morning, ${(user?.name || user?.email?.split("@")[0] || "User").trim().split(/\s+/)[0]}`}
        sub="Here's your financial overview."
        action={
          <button
            className="primary"
            onClick={() => setPage("transactions")}
          >
            <Plus size={17} />
            Add transaction
          </button>
        }
      />

      {loading ? (
        <div className="card loading-card">
          <LoaderCircle
            size={22}
            className="spin"
          />
          <span>Loading your transactions...</span>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <Stat
              title="Total balance"
              value={money(income - expense)}
              trend="+8.2%"
              positive
              icon={WalletCards}
            />

            <Stat
              title="Total income"
              value={money(income)}
              trend="+12.5%"
              positive
              icon={ArrowDownRight}
            />

            <Stat
              title="Total expenses"
              value={money(expense)}
              trend="-4.8%"
              positive
              icon={ArrowUpRight}
            />

            <Stat
              title="Savings"
              value={money(income - expense)}
              trend="+18.4%"
              positive
              icon={Target}
            />
          </div>

          <div className="dashboard-grid">
            <section className="card span-2">
              <CardHead
                title="Spending overview"
                action={
                  <div className="seg">
                    <button className="selected">
                      Monthly
                    </button>

                    <button>Weekly</button>
                  </div>
                }
              />

              <div className="chart">
                <ResponsiveContainer
                  width="100%"
                  height={255}
                >
                  <AreaChart data={days}>
                    <defs>
                      <linearGradient
                        id="fill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#6366f1"
                          stopOpacity=".22"
                        />

                        <stop
                          offset="100%"
                          stopColor="#6366f1"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e7e9ee"
                    />

                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) =>
                        `₹${v / 1000}k`
                      }
                    />

                    <Tooltip
                      formatter={(v) => money(v)}
                    />

                    <Area
                      type="monotone"
                      dataKey="spend"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fill="url(#fill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card">
              <CardHead
                title="Expense breakdown"
                action={
                  <button
                    className="text-btn"
                    onClick={() =>
                      setPage("analytics")
                    }
                  >
                    View all
                  </button>
                }
              />

              <div className="donut-wrap">
                <ResponsiveContainer
                  width="52%"
                  height={170}
                >
                  <PieChart>
                    <Pie
                      data={cats
                        .slice(0, 6)
                        .map(([name, value]) => ({
                          name,
                          value,
                        }))}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                    >
                      {cats
                        .slice(0, 6)
                        .map((_, i) => (
                          <Cell
                            key={i}
                            fill={
                              [
                                "#6366f1",
                                "#14b8a6",
                                "#f59e0b",
                                "#f43f5e",
                                "#38bdf8",
                                "#a78bfa",
                              ][i]
                            }
                          />
                        ))}
                    </Pie>

                    <Tooltip
                      formatter={(v) => money(v)}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="legend">
                  {cats.slice(0, 5).map(
                    ([n, v], i) => (
                      <div key={n}>
                        <span
                          className="dot"
                          style={{
                            background: [
                              "#6366f1",
                              "#14b8a6",
                              "#f59e0b",
                              "#f43f5e",
                              "#38bdf8",
                            ][i],
                          }}
                        />

                        <span>{n}</span>

                        <b>{money(v)}</b>
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>

            <section className="card">
              <CardHead
                title="AI spending insight"
                icon={<Sparkles size={17} />}
              />

              <div className="insight-box">
                <div className="insight-icon">
                  <Lightbulb size={20} />
                </div>

                <div>
                  <b>Dining is trending down</b>

                  <p>
                    Your dining spend is 11% lower
                    than the previous period. Keeping
                    this habit could free up about
                    ₹1,200 this month.
                  </p>
                </div>
              </div>

              <button
                className="secondary wide"
                onClick={() => setPage("insights")}
              >
                <Sparkles size={16} />
                View detailed insights
              </button>
            </section>

            <section className="card span-2">
              <CardHead
                title="Recent transactions"
                action={
                  <button
                    className="text-btn"
                    onClick={() =>
                      setPage("transactions")
                    }
                  >
                    View all
                  </button>
                }
              />

              <TxList tx={tx.slice(0, 5)} />
            </section>

            <section className="card">
              <CardHead
                title="Budget overview"
                action={
                  <button
                    className="text-btn"
                    onClick={() =>
                      setPage("budgets")
                    }
                  >
                    Manage
                  </button>
                }
              />

              {budgets.map((b) => {
                const spent = month
                  .filter(
                    (t) =>
                      t.type === "expense" &&
                      t.category === b.category
                  )
                  .reduce(
                    (a, t) =>
                      a + Number(t.amount || 0),
                    0
                  );

                return (
                  <BudgetLine
                    key={b.id}
                    name={b.category}
                    spent={spent}
                    total={b.amount}
                  />
                );
              })}
            </section>
          </div>
        </>
      )}
    </>
  );
}

/*
 * =========================================================
 * COMMON COMPONENTS
 * =========================================================
 */

function Stat({
  title,
  value,
  trend,
  positive,
  icon: Icon,
}) {
  return (
    <div className="stat card">
      <div className="stat-top">
        <span>{title}</span>

        <span className="stat-icon">
          <Icon size={17} />
        </span>
      </div>

      <strong>{value}</strong>

      <div
        className={
          "trend " + (positive ? "up" : "down")
        }
      >
        {positive ? (
          <TrendingUp size={14} />
        ) : (
          <TrendingDown size={14} />
        )}

        {trend}

        <span>vs last month</span>
      </div>
    </div>
  );
}

function PageTitle({ title, sub, action }) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>

      {action}
    </div>
  );
}

function CardHead({ title, action, icon }) {
  return (
    <div className="card-head">
      <h3>
        {icon}
        {title}
      </h3>

      {action}
    </div>
  );
}

function BudgetLine({ name, spent, total }) {
  const p = Math.min(
    100,
    total ? (spent / total) * 100 : 0
  );

  return (
    <div className="budget-line">
      <div>
        <span>{name}</span>

        <b>
          {money(spent)}{" "}
          <small>/ {money(total)}</small>
        </b>
      </div>

      <div className="progress">
        <i
          style={{
            width: p + "%",
            background:
              p > 100
                ? "#ef4444"
                : p > 80
                ? "#f59e0b"
                : "#6366f1",
          }}
        />
      </div>
    </div>
  );
}

function TxList({ tx, onDelete }) {
  return (
    <div className="tx-list">
      {tx.map((t) => (
        <div className="tx-row" key={t.id}>
          <div className="tx-icon">
            {t.type === "income" ? (
              <ArrowDownRight size={17} />
            ) : (
              <ArrowUpRight size={17} />
            )}
          </div>

          <div className="tx-info">
            <b>{t.description}</b>

            <span>
              {t.category} · {t.date}
            </span>
          </div>

          <strong className={t.type}>
            {t.type === "income" ? "+" : "-"}
            {money(t.amount)}
          </strong>

          {onDelete && (
            <button
              className="icon-btn ghost"
              onClick={() => onDelete(t)}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}

      {!tx.length && (
        <div className="empty compact">
          <ReceiptText size={28} />

          <b>No transactions yet</b>

          <span>
            Add your first transaction to get started.
          </span>
        </div>
      )}
    </div>
  );
}

/*
 * =========================================================
 * TRANSACTIONS
 * =========================================================
 */

function Transactions({
  tx,
  onAdd,
  onUpdate,
  onDelete,
  loading,
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = tx.filter(
    (t) =>
      (type === "all" || t.type === type) &&
      `${t.description} ${t.category}`
        .toLowerCase()
        .includes(q.toLowerCase())
  );

  const handleSave = async (x) => {
    setSaving(true);

    try {
      if (editing) {
        await onUpdate(x);
      } else {
        await onAdd(x);
      }

      setAdding(false);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageTitle
        title="Transactions"
        sub="Keep every rupee accounted for."
        action={
          <button
            className="primary"
            onClick={() => setAdding(true)}
          >
            <Plus size={17} />
            Add transaction
          </button>
        }
      />

      <div className="card table-card">
        <div className="filters">
          <div className="search">
            <Search size={17} />

            <input
              value={q}
              onChange={(e) =>
                setQ(e.target.value)
              }
              placeholder="Search transactions..."
            />
          </div>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value)
            }
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-card inside">
            <LoaderCircle
              size={22}
              className="spin"
            />

            <span>
              Loading transactions from PostgreSQL...
            </span>
          </div>
        ) : (
          <>
            <div className="table">
              <div className="tr th">
                <span>Date</span>
                <span>Description</span>
                <span>Category</span>
                <span>Payment</span>
                <span>Amount</span>
                <span />
              </div>

              {filtered.map((t) => (
                <div className="tr" key={t.id}>
                  <span>{t.date}</span>

                  <span className="desc">
                    <span
                      className={"tiny " + t.type}
                    >
                      {t.type === "income" ? (
                        <ArrowDownRight size={13} />
                      ) : (
                        <ArrowUpRight size={13} />
                      )}
                    </span>

                    <b>{t.description}</b>
                  </span>

                  <span>{t.category}</span>

                  <span>{t.payment}</span>

                  <strong className={t.type}>
                    {t.type === "income"
                      ? "+"
                      : "-"}
                    {money(t.amount)}
                  </strong>

                  <span className="row-actions">
                    <button
                      className="icon-btn ghost"
                      onClick={() =>
                        setEditing(t)
                      }
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      className="icon-btn ghost danger"
                      onClick={() =>
                        onDelete(t)
                      }
                    >
                      <Trash2 size={15} />
                    </button>
                  </span>
                </div>
              ))}
            </div>

            {!filtered.length && (
              <div className="empty">
                <ReceiptText size={35} />

                <b>No transactions found</b>

                <span>
                  Try another search or add your
                  first transaction.
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {(adding || editing) && (
        <TxModal
          initial={editing}
          saving={saving}
          onClose={() => {
            if (!saving) {
              setAdding(false);
              setEditing(null);
            }
          }}
          onSave={handleSave}
        />
      )}
    </>
  );
}

/*
 * =========================================================
 * TRANSACTION MODAL
 * =========================================================
 */

function TxModal({
  initial,
  onClose,
  onSave,
  saving,
}) {
  const [f, setF] = useState(
    initial || {
      type: "expense",
      amount: "",
      category: "Food & Dining",
      description: "",
      date: new Date()
        .toISOString()
        .slice(0, 10),
      payment: "UPI",
      notes: "",
    }
  );

  const set = (k, v) =>
    setF((x) => ({
      ...x,
      [k]: v,
    }));

  const submit = async (e) => {
    e.preventDefault();

    if (!f.amount || !f.description) {
      return;
    }

    await onSave({
      ...f,
      amount: Number(f.amount),
    });
  };

  const cats = CATS.filter(
    (x) => x[1] === f.type
  );

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <h2>
              {initial
                ? "Edit transaction"
                : "Add transaction"}
            </h2>

            <p>
              Enter the details below.
            </p>
          </div>

          <button
            className="icon-btn"
            onClick={onClose}
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit}>
          <div className="type-toggle">
            <button
              type="button"
              className={
                f.type === "expense"
                  ? "on"
                  : ""
              }
              onClick={() => {
                set("type", "expense");
                set(
                  "category",
                  "Food & Dining"
                );
              }}
              disabled={saving}
            >
              Expense
            </button>

            <button
              type="button"
              className={
                f.type === "income"
                  ? "on"
                  : ""
              }
              onClick={() => {
                set("type", "income");
                set("category", "Salary");
              }}
              disabled={saving}
            >
              Income
            </button>
          </div>

          <div className="form-grid">
            <label>
              Amount

              <input
                type="number"
                min="1"
                value={f.amount}
                onChange={(e) =>
                  set(
                    "amount",
                    e.target.value
                  )
                }
                placeholder="0"
                disabled={saving}
              />
            </label>

            <label>
              Date

              <input
                type="date"
                value={f.date}
                onChange={(e) =>
                  set("date", e.target.value)
                }
                disabled={saving}
              />
            </label>

            <label>
              Description

              <input
                value={f.description}
                onChange={(e) =>
                  set(
                    "description",
                    e.target.value
                  )
                }
                placeholder="e.g. Grocery shopping"
                disabled={saving}
              />
            </label>

            <label>
              Category

              <select
                value={f.category}
                onChange={(e) =>
                  set(
                    "category",
                    e.target.value
                  )
                }
                disabled={saving}
              >
                {cats.map((c) => (
                  <option key={c[0]}>
                    {c[0]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Payment method

              <select
                value={f.payment}
                onChange={(e) =>
                  set(
                    "payment",
                    e.target.value
                  )
                }
                disabled={saving}
              >
                {[
                  "UPI",
                  "Cash",
                  "Credit Card",
                  "Debit Card",
                  "Bank Transfer",
                  "Other",
                ].map((x) => (
                  <option key={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Notes

              <textarea
                value={f.notes || ""}
                onChange={(e) =>
                  set(
                    "notes",
                    e.target.value
                  )
                }
                placeholder="Optional note"
                disabled={saving}
              />
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              className="primary"
              disabled={saving}
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={16}
                    className="spin"
                  />

                  Saving...
                </>
              ) : initial ? (
                "Save changes"
              ) : (
                "Save transaction"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * BUDGETS
 * =========================================================
 */

function Budgets({
  budgets,
  setBudgets,
  tx,
  notify,
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [cat, setCat] =
    useState("Food & Dining");
  const [amount, setAmount] = useState("");

  const month = "2026-08";

  const expenses = tx.filter(
    (t) =>
      t.type === "expense" &&
      String(t.date).startsWith(month)
  );

  const save = () => {
    if (!amount) return;

    const x = {
      id: editing?.id || id(),
      category: cat,
      amount: Number(amount),
      month,
    };

    setBudgets((v) =>
      editing
        ? v.map((b) =>
            b.id === x.id ? x : b
          )
        : [...v, x]
    );

    setOpen(false);
    setEditing(null);
    setAmount("");

    notify(
      editing
        ? "Budget updated"
        : "Budget created"
    );
  };

  const total = budgets.reduce(
    (a, b) => a + Number(b.amount || 0),
    0
  );

  const spent = expenses.reduce(
    (a, t) => a + Number(t.amount || 0),
    0
  );

  return (
    <>
      <PageTitle
        title="Budgets"
        sub="Give every category a clear spending limit."
        action={
          <button
            className="primary"
            onClick={() => setOpen(true)}
          >
            <Plus size={17} />
            Create budget
          </button>
        }
      />

      <div className="stat-grid three">
        <Stat
          title="Total budget"
          value={money(total)}
          trend="+5.2%"
          positive
          icon={WalletCards}
        />

        <Stat
          title="Spent"
          value={money(spent)}
          trend="-4.8%"
          positive
          icon={ArrowUpRight}
        />

        <Stat
          title="Remaining"
          value={money(total - spent)}
          trend="+10.1%"
          positive
          icon={Target}
        />
      </div>

      <div className="budget-grid">
        {budgets.map((b) => {
          const s = expenses
            .filter(
              (t) =>
                t.category === b.category
            )
            .reduce(
              (a, t) =>
                a + Number(t.amount || 0),
              0
            );

          return (
            <div
              className="card budget-card"
              key={b.id}
            >
              <div className="budget-card-head">
                <div className="cat-avatar">
                  {b.category[0]}
                </div>

                <div>
                  <h3>{b.category}</h3>

                  <span>
                    August 2026
                  </span>
                </div>

                <button
                  className="icon-btn"
                  onClick={() => {
                    setEditing(b);
                    setCat(b.category);
                    setAmount(b.amount);
                    setOpen(true);
                  }}
                >
                  <Pencil size={15} />
                </button>
              </div>

              <div className="big-budget">
                {money(s)}{" "}
                <small>
                  of {money(b.amount)}
                </small>
              </div>

              <BudgetLine
                name=""
                spent={s}
                total={b.amount}
              />

              <div
                className={
                  "budget-status " +
                  (s > b.amount
                    ? "bad"
                    : s > b.amount * 0.8
                    ? "warn"
                    : "good")
                }
              >
                {s > b.amount ? (
                  <AlertTriangle size={15} />
                ) : (
                  <CheckCircle2 size={15} />
                )}

                {s > b.amount
                  ? "Over budget"
                  : s > b.amount * 0.8
                  ? "Near limit"
                  : "On track"}

                <button
                  onClick={() => {
                    setBudgets((v) =>
                      v.filter(
                        (x) =>
                          x.id !== b.id
                      )
                    );

                    notify(
                      "Budget deleted"
                    );
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {open && (
        <div className="modal-backdrop">
          <div className="modal small">
            <div className="modal-head">
              <div>
                <h2>
                  {editing
                    ? "Edit budget"
                    : "Create budget"}
                </h2>

                <p>
                  Set a monthly limit.
                </p>
              </div>

              <button
                className="icon-btn"
                onClick={() => {
                  setOpen(false);
                  setEditing(null);
                }}
              >
                <X />
              </button>
            </div>

            <label>
              Category

              <select
                value={cat}
                onChange={(e) =>
                  setCat(e.target.value)
                }
              >
                {CATS.filter(
                  (x) => x[1] === "expense"
                ).map((x) => (
                  <option key={x[0]}>
                    {x[0]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Monthly amount

              <input
                type="number"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
                }
                placeholder="5000"
              />
            </label>

            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() =>
                  setOpen(false)
                }
              >
                Cancel
              </button>

              <button
                className="primary"
                onClick={save}
              >
                {editing
                  ? "Save changes"
                  : "Create budget"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/*
 * =========================================================
 * ANALYTICS
 * =========================================================
 */

function Analytics({ tx }) {
  const expenses = tx.filter(
    (t) => t.type === "expense"
  );

  const income = tx.filter(
    (t) => t.type === "income"
  );

  const cats = Object.entries(
    expenses.reduce((a, t) => {
      a[t.category] =
        (a[t.category] || 0) +
        Number(t.amount || 0);

      return a;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const data = cats
    .slice(0, 7)
    .map(([name, amount]) => ({
      name,
      amount,
    }));

  const trend = [
    1, 5, 9, 13, 17, 21, 25,
  ].map((d) => ({
    day: d,
    expenses: expenses
      .filter(
        (t) =>
          +String(t.date).slice(8) <= d
      )
      .reduce(
        (a, t) =>
          a + Number(t.amount || 0),
        0
      ),
  }));

  return (
    <>
      <PageTitle
        title="Analytics"
        sub="Understand where your money is going."
        action={
          <div className="date-pill">
            <CalendarDays size={16} />
            August 2026
            <ChevronDown size={15} />
          </div>
        }
      />

      <div className="analytics-grid">
        <section className="card span-2">
          <CardHead title="Spending over time" />

          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <AreaChart data={trend}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e7e9ee"
              />

              <XAxis
                dataKey="day"
                tickFormatter={(v) =>
                  `Aug ${v}`
                }
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(v) => money(v)}
              />

              <Area
                type="monotone"
                dataKey="expenses"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity=".12"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        <section className="card">
          <CardHead title="Top categories" />

          <div className="rank-list">
            {cats.slice(0, 6).map(
              ([n, v], i) => (
                <div key={n}>
                  <span className="rank">
                    {i + 1}
                  </span>

                  <b>{n}</b>

                  <strong>
                    {money(v)}
                  </strong>
                </div>
              )
            )}
          </div>
        </section>

        <section className="card">
          <CardHead title="Income vs expenses" />

          <ResponsiveContainer
            width="100%"
            height={240}
          >
            <BarChart
              data={[
                {
                  name: "August",
                  income: income.reduce(
                    (a, t) =>
                      a +
                      Number(
                        t.amount || 0
                      ),
                    0
                  ),
                  expenses: expenses.reduce(
                    (a, t) =>
                      a +
                      Number(
                        t.amount || 0
                      ),
                    0
                  ),
                },
              ]}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e7e9ee"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(v) => money(v)}
              />

              <Bar
                dataKey="income"
                fill="#10b981"
                radius={[
                  6, 6, 0, 0,
                ]}
              />

              <Bar
                dataKey="expenses"
                fill="#f43f5e"
                radius={[
                  6, 6, 0, 0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="card">
          <CardHead title="Spending mix" />

          <ResponsiveContainer
            width="100%"
            height={240}
          >
            <PieChart>
              <Pie
                data={data}
                dataKey="amount"
                nameKey="name"
                innerRadius={60}
                outerRadius={85}
              >
                {data.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      [
                        "#6366f1",
                        "#14b8a6",
                        "#f59e0b",
                        "#f43f5e",
                        "#38bdf8",
                        "#a78bfa",
                        "#fb7185",
                      ][i]
                    }
                  />
                ))}
              </Pie>

              <Tooltip
                formatter={(v) => money(v)}
              />
            </PieChart>
          </ResponsiveContainer>
        </section>
      </div>
    </>
  );
}

/*
 * =========================================================
 * AI INSIGHTS
 * =========================================================
 */

function Insights({ tx, budgets }) {
  const expenses = tx.filter(
    (t) => t.type === "expense"
  );

  const income = tx.filter(
    (t) => t.type === "income"
  );

  const total = expenses.reduce(
    (a, t) =>
      a + Number(t.amount || 0),
    0
  );

  const inc = income.reduce(
    (a, t) =>
      a + Number(t.amount || 0),
    0
  );

  const cats = Object.entries(
    expenses.reduce((a, t) => {
      a[t.category] =
        (a[t.category] || 0) +
        Number(t.amount || 0);

      return a;
    }, {})
  ).sort((a, b) => b[1] - a[1]);

  const top =
    cats[0]?.[0] ||
    "your top category";

  const topValue =
    cats[0]?.[1] || 0;

  return (
    <>
      <PageTitle
        title="AI Insights"
        sub="Helpful observations based on your spending patterns."
        action={
          <button className="primary">
            <Sparkles size={17} />
            Generate AI insights
          </button>
        }
      />

      <div className="ai-hero">
        <div className="ai-orb">
          <Sparkles size={28} />
        </div>

        <div>
          <p className="eyebrow">
            SMART SUMMARY
          </p>

          <h2>
            Your spending is mostly under
            control.
          </h2>

          <p>
            Based on your current
            transactions, you've spent{" "}
            <b>{money(total)}</b> against{" "}
            <b>{money(inc)}</b> of income.
            Your largest category is{" "}
            <b>{top}</b> at{" "}
            <b>{money(topValue)}</b>.
          </p>
        </div>

        <div className="ai-score">
          <span>Health score</span>

          <strong>82</strong>

          <small>Good</small>
        </div>
      </div>

      <div className="insight-grid">
        <InsightCard
          icon={<TrendingDown />}
          title="Positive trend"
          text="Your recent dining spend is trending lower. Keep this habit going and redirect the difference toward your savings goal."
          tone="good"
        />

        <InsightCard
          icon={<AlertTriangle />}
          title="Watch your budget"
          text={
            budgets.length
              ? `Review ${
                  budgets.filter(
                    (b) =>
                      expenses
                        .filter(
                          (t) =>
                            t.category ===
                            b.category
                        )
                        .reduce(
                          (a, t) =>
                            a +
                            Number(
                              t.amount || 0
                            ),
                          0
                        ) >
                      b.amount * 0.8
                  ).length
                } budget categories that are approaching their limits.`
              : "Create a few budgets to unlock budget warnings."
          }
          tone="warn"
        />

        <InsightCard
          icon={<Target />}
          title="Savings opportunity"
          text="A small weekly reduction in non-essential spending could noticeably increase your monthly savings without changing your essential bills."
          tone="ai"
        />

        <InsightCard
          icon={<Sparkles />}
          title="Personalized recommendation"
          text="Try setting a weekly discretionary spending cap and review it every Sunday. Consistent small adjustments are easier to maintain."
          tone="ai"
        />
      </div>

      <p className="disclaimer">
        AI-style insights are informational and
        are not professional financial advice.
        Connect an OpenAI or Gemini API key in
        the included backend to enable live
        generated insights.
      </p>
    </>
  );
}

function InsightCard({
  icon,
  title,
  text,
  tone,
}) {
  return (
    <div
      className={
        "card insight-card " + tone
      }
    >
      <div className="insight-card-icon">
        {icon}
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <button className="text-btn">
        Learn more
        <ArrowUpRight size={14} />
      </button>
    </div>
  );
}

/*
 * =========================================================
 * SETTINGS
 * =========================================================
 */

function Settings({
  user,
  setUser,
  tx,
  setTx,
  dark,
  setDark,
  notify,
}) {
  const [name, setName] = useState(user.name || "");

  const [email, setEmail] = useState(
    user.email || ""
  );

  const [savingProfile, setSavingProfile] =
    useState(false);

  const save = async () => {
    if (!name.trim()) {
      notify("Please enter your name");
      return;
    }

    setSavingProfile(true);

    try {
      const { data, error } =
        await supabase.auth.updateUser({
          data: {
            name: name.trim(),
          },
        });

      if (error) {
        throw error;
      }

      const updatedUser =
        data?.user || null;

      setUser({
        ...user,
        name:
          updatedUser?.user_metadata?.name ||
          name.trim(),
        email:
          updatedUser?.email ||
          email,
      });

      notify("Profile updated");
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      notify(
        error.message ||
          "Unable to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify(tx, null, 2)],
      {
        type: "application/json",
      }
    );

    const a = document.createElement("a");

    a.href =
      URL.createObjectURL(blob);

    a.download =
      "smart-expense-transactions.json";

    a.click();

    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageTitle
        title="Settings"
        sub="Manage your profile and app preferences."
      />

      <div className="settings-grid">
        <section className="card settings-card">
          <CardHead title="Profile" />

          <div className="profile-big">
            <div className="avatar xl">
              {(name || "P")
                .slice(0, 1)
                .toUpperCase()}
            </div>

            <div>
              <h3>
                {name || "Your name"}
              </h3>

              <span>{email}</span>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Full name

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />
            </label>

            <label>
              Email

              <input
                value={email}
                readOnly
              />
            </label>
          </div>

          <button
            className="primary"
            onClick={save}
            disabled={savingProfile}
          >
            {savingProfile ? (
              <>
                <LoaderCircle
                  size={16}
                  className="spin"
                />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </section>

        <section className="card settings-card">
          <CardHead title="Preferences" />

          <div className="setting-row">
            <div>
              <b>Currency</b>
              <span>
                Default display currency
              </span>
            </div>

            <select>
              <option>
                INR — ₹
              </option>

              <option>
                USD — $
              </option>

              <option>
                EUR — €
              </option>
            </select>
          </div>

          <div className="setting-row">
            <div>
              <b>Theme</b>

              <span>
                Choose your preferred
                appearance
              </span>
            </div>

            <button
              className="secondary"
              onClick={() =>
                setDark(!dark)
              }
            >
              {dark ? (
                <Sun size={16} />
              ) : (
                <Moon size={16} />
              )}

              {dark ? "Light" : "Dark"}
            </button>
          </div>

          <div className="setting-row">
            <div>
              <b>Export data</b>

              <span>
                Download your transactions
                as JSON
              </span>
            </div>

            <button
              className="secondary"
              onClick={exportData}
            >
              <Download size={16} />
              Export
            </button>
          </div>

          <div className="setting-row danger-row">
            <div>
              <b>Reset demo data</b>

              <span>
                Replace current browser data
                with sample transactions
              </span>
            </div>

            <button
              className="secondary"
              onClick={() => {
                setTx(demo);
                notify(
                  "Demo data restored locally"
                );
              }}
            >
              <Upload size={16} />
              Reset
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

export default App;
