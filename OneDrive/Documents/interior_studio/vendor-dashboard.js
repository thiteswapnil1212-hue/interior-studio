const PRODUCTS_KEY = "products";

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getProducts() {
  const raw = localStorage.getItem(PRODUCTS_KEY);
  const products = safeJsonParse(raw, []);
  return Array.isArray(products) ? products : [];
}

function setProducts(products) {
  const safe = Array.isArray(products) ? products : [];
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(safe));
}

function createId(prefix) {
  return `${prefix || "id"}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function ensureErrorEl(input) {
  if (!input || !input.parentElement) return null;
  let errorEl = input.parentElement.querySelector(".field-error");
  if (!errorEl) {
    errorEl = document.createElement("p");
    errorEl.className = "field-error";
    errorEl.setAttribute("aria-live", "polite");
    input.parentElement.appendChild(errorEl);
  }
  return errorEl;
}

function clearErrors(form) {
  if (!form) return;
  form.querySelectorAll(".field-error").forEach((el) => {
    el.textContent = "";
    el.style.display = "none";
  });
}

function setFieldError(form, fieldName, message) {
  const input = form?.querySelector(`[name="${fieldName}"]`);
  const errorEl = ensureErrorEl(input);
  if (!errorEl) return;
  errorEl.textContent = message || "";
  errorEl.style.display = message ? "block" : "none";
}

function requireUser(user) {
  if (user) return user;
  window.location.href = window.LOGIN_URL || "login.html";
  return null;
}

function renderUserProducts(user) {
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("productEmpty");
  const countEl = document.getElementById("productCount");
  if (!grid || !empty || !countEl) return;

  const products = getProducts();
  const uid = user?.uid || "";
  const userProducts = uid ? products.filter((p) => p.uid === uid) : [];

  countEl.textContent = `${userProducts.length}`;
  grid.textContent = "";

  if (userProducts.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  userProducts.forEach((product) => {
    const card = document.createElement("article");
    card.className = "pm-product-card";

    const imgWrap = document.createElement("div");
    imgWrap.className = "pm-product-img";

    const img = document.createElement("img");
    img.alt = product.productName || "Product image";
    img.loading = "lazy";
    img.decoding = "async";
    img.src = product.imageDataUrl || "";
    imgWrap.appendChild(img);

    const body = document.createElement("div");
    body.className = "pm-product-body";

    const title = document.createElement("h4");
    title.className = "pm-product-title";
    title.textContent = product.productName || "";

    const meta = document.createElement("div");
    meta.className = "pm-product-meta";

    const addMetaRow = (label, value) => {
      const row = document.createElement("div");
      row.className = "pm-meta-row";
      const labelEl = document.createElement("span");
      labelEl.className = "pm-meta-label";
      labelEl.textContent = label;
      const valueEl = document.createElement("span");
      valueEl.className = "pm-meta-value";
      valueEl.textContent = value || "";
      row.appendChild(labelEl);
      row.appendChild(valueEl);
      meta.appendChild(row);
    };

    addMetaRow("Price", product.price);
    addMetaRow("Contact", product.contactNumber);
    addMetaRow("Shop", product.shopName);

    const actions = document.createElement("div");
    actions.className = "pm-product-actions";

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "pm-danger-btn";
    delBtn.textContent = "Delete";
    delBtn.dataset.productId = product.id;
    delBtn.setAttribute(
      "aria-label",
      `Delete ${product.productName || "product"}`
    );

    actions.appendChild(delBtn);

    body.appendChild(title);
    body.appendChild(meta);
    body.appendChild(actions);

    card.appendChild(imgWrap);
    card.appendChild(body);

    grid.appendChild(card);
  });
}

async function addProduct(user, event) {
  if (event) event.preventDefault();

  const safeUser = requireUser(user);
  if (!safeUser) return;

  const form = event?.target || document.getElementById("productForm");
  if (!form) return;

  clearErrors(form);

  const formData = new FormData(form);
  const productName = String(formData.get("productName") || "").trim();
  const price = String(formData.get("price") || "").trim();
  const contactNumber = String(formData.get("contactNumber") || "").trim();
  const shopName = String(formData.get("shopName") || "").trim();
  const file = form.querySelector('input[name="imageFile"]')?.files?.[0] || null;

  let hasError = false;
  if (!productName) {
    setFieldError(form, "productName", "Please fill all fields.");
    hasError = true;
  }
  if (!price) {
    setFieldError(form, "price", "Please fill all fields.");
    hasError = true;
  }
  if (!contactNumber) {
    setFieldError(form, "contactNumber", "Please fill all fields.");
    hasError = true;
  }
  if (!shopName) {
    setFieldError(form, "shopName", "Please fill all fields.");
    hasError = true;
  }
  if (!file) {
    setFieldError(form, "imageFile", "Please choose an image.");
    hasError = true;
  }
  if (hasError) return;

  if (file && file.size > 1_500_000) {
    setFieldError(form, "imageFile", "Image too large (max ~1.5MB).");
    return;
  }

  let imageDataUrl = "";
  try {
    imageDataUrl = await fileToDataUrl(file);
  } catch {
    alert("Could not read image. Please try another file.");
    return;
  }

  const products = getProducts();
  products.unshift({
    id: createId("prod"),
    uid: safeUser.uid,
    email: safeUser.email || "",
    productName,
    price,
    contactNumber,
    shopName,
    imageDataUrl,
    createdAt: new Date().toISOString(),
  });
  setProducts(products);

  form.reset();
  renderUserProducts(safeUser);
}

function deleteProduct(user, productId) {
  const safeUser = requireUser(user);
  if (!safeUser) return;
  if (!productId) return;

  const products = getProducts();
  const next = products.filter((p) => !(p.id === productId && p.uid === safeUser.uid));
  setProducts(next);
  renderUserProducts(safeUser);
}

let isDashboardInitialized = false;
function initDashboard(user) {
  if (isDashboardInitialized) return;
  isDashboardInitialized = true;

  const form = document.getElementById("productForm");
  const grid = document.getElementById("productGrid");

  if (form) {
    form.addEventListener("submit", (e) => addProduct(user, e));
  }

  if (grid) {
    grid.addEventListener("click", (e) => {
      const btn = e.target?.closest?.("button[data-product-id]");
      const productId = btn?.dataset?.productId || "";
      if (!productId) return;

      const ok = confirm("Delete this product?");
      if (!ok) return;
      deleteProduct(user, productId);
    });
  }

  renderUserProducts(user);

  const viewsEl = document.getElementById("statProductViews");
  const enquiriesEl = document.getElementById("statCustomerEnquiries");
  if (viewsEl) viewsEl.textContent = "0";
  if (enquiriesEl) enquiriesEl.textContent = "0";
}

document.addEventListener("DOMContentLoaded", () => {
  const checkAuth = () => {
    const authInstance = window.auth || (window.firebase && window.firebase.auth());
    
    if (!authInstance) {
      // Wait longer if Firebase SDK is still downloading
      setTimeout(checkAuth, 250);
      return;
    }

    authInstance.onAuthStateChanged((user) => {
      if (!user) {
        window.location.href = window.LOGIN_URL || "login.html";
        return;
      }
      initDashboard(user);
    });
  };

  // Wait for the scripts to initialize the global auth object
  setTimeout(checkAuth, 100);
});
