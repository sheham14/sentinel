const BASE_URL = "http://localhost:3000";

type Result = {
  route: string;
  method: string;
  status: number;
  ok: boolean;
  error?: string;
};

const results: Result[] = [];

async function test(
  method: string,
  path: string,
  body?: object,
  expectedStatus: number = 200,
): Promise<void> {
  const route = `${method} ${path}`;
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    const ok = res.status === expectedStatus;
    results.push({ route, method, status: res.status, ok });
  } catch (e: any) {
    results.push({ route, method, status: 0, ok: false, error: e.message });
  }
}

async function run() {
  console.log("🔥 Running smoke tests against", BASE_URL);
  console.log("─".repeat(60));

  // Health
  await test("GET", "/api/health");

  // Products
  await test("GET", "/api/products");
  await test("GET", "/api/products?q=milk");
  await test("GET", "/api/products?category=dairy");
  await test("GET", "/api/products/prod_milk_natrel");
  await test("GET", "/api/products/prod_milk_natrel/prices");
  await test("GET", "/api/products/prod_milk_natrel/prices?range=30d");
  await test("GET", "/api/products/nonexistent-id", undefined, 404);

  // Stores
  await test("GET", "/api/stores");
  await test("GET", "/api/stores?chain=walmart");

  // Flyers
  await test("GET", "/api/flyers");

  // Watchlist
  await test("GET", "/api/watchlist", undefined, 401);
  await test(
    "POST",
    "/api/watchlist",
    { productId: "prod_butter_lactantia", targetPrice: 5.5 },
    401,
  );
  await test(
    "PATCH",
    "/api/watchlist/prod_butter_lactantia",
    { targetPrice: 5.0 },
    401,
  );
  await test("DELETE", "/api/watchlist/prod_butter_lactantia", undefined, 401);

  // Lists
  await test("GET", "/api/lists", undefined, 401);
  await test("POST", "/api/lists", { name: "Smoke Test List" }, 401);

  // User
  await test("GET", "/api/user", undefined, 401);
  await test("PATCH", "/api/user", { name: "Updated Test User" }, 401);
  await test("GET", "/api/user/export", undefined, 401);

  // Notifications
  await test("GET", "/api/notifications/preferences", undefined, 401);
  await test(
    "PATCH",
    "/api/notifications/preferences",
    { emailNotifications: true },
    401,
  );

  // Pantry
  await test("GET", "/api/pantry", undefined, 401);
  await test(
    "POST",
    "/api/pantry",
    { name: "Test item", quantity: 1, unit: "kg" },
    401,
  );

  // Recipes
  await test("GET", "/api/recipes");
  await test("GET", "/api/recipes?q=spaghetti");
  await test(
    "POST",
    "/api/recipes/ask",
    { query: "quick meals under $15", budget: 15 },
    401,
  );

  // Alerts
  await test("GET", "/api/alerts", undefined, 401);

  // Scan
  await test("GET", "/api/scan?barcode=065684012345");
  await test("GET", "/api/scan?barcode=000000000000", undefined, 404);

  // Results
  console.log("\n📊 Results:\n");
  let passed = 0;
  let failed = 0;

  for (const r of results) {
    const icon = r.ok ? "✅" : "❌";
    const label = r.ok ? "PASS" : "FAIL";
    console.log(
      `${icon} ${label}  ${r.method.padEnd(6)} ${r.route.replace(r.method + " ", "")}  →  ${r.status}`,
    );
    r.ok ? passed++ : failed++;
  }

  console.log("\n" + "─".repeat(60));
  console.log(
    `✅ ${passed} passed  ❌ ${failed} failed  📋 ${results.length} total`,
  );

  if (failed > 0) process.exit(1);
}

run();
