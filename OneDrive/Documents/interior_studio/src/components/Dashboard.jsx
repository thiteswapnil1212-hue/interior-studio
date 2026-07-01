import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";

const PRODUCTS_KEY = "products";

function getInitials(email) {
  const safeEmail = String(email || "").trim();

  if (!safeEmail) {
    return "U";
  }

  return safeEmail.slice(0, 2).toUpperCase();
}

function readProducts() {
  try {
    const rawValue = localStorage.getItem(PRODUCTS_KEY);
    const parsedValue = JSON.parse(rawValue || "[]");
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function saveProducts(products) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    productName: "",
    price: "",
    contactNumber: "",
    shopName: "",
    imageFile: null,
  });
  const [errors, setErrors] = useState({
    productName: "",
    price: "",
    contactNumber: "",
    shopName: "",
    imageFile: "",
    form: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    document.title = "Vendor Dashboard - Interior Studio Pune";
  }, []);

  useEffect(() => {
    // Local product storage mirrors the current app's dashboard behavior.
    const syncProducts = () => {
      const allProducts = readProducts();
      const userProducts = allProducts.filter((item) => item.uid === user?.uid);
      setProducts(userProducts);
    };

    syncProducts();
    window.addEventListener("storage", syncProducts);

    return () => {
      window.removeEventListener("storage", syncProducts);
    };
  }, [user]);

  function handleChange(event) {
    const { name, value, files } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: files ? files[0] || null : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
      form: "",
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {
      productName: "",
      price: "",
      contactNumber: "",
      shopName: "",
      imageFile: "",
      form: "",
    };

    if (!formData.productName.trim()) {
      nextErrors.productName = "Product name is required.";
    }
    if (!formData.price.trim()) {
      nextErrors.price = "Price is required.";
    }
    if (!formData.contactNumber.trim()) {
      nextErrors.contactNumber = "Contact number is required.";
    }
    if (!formData.shopName.trim()) {
      nextErrors.shopName = "Shop name is required.";
    }
    if (!formData.imageFile) {
      nextErrors.imageFile = "Please choose an image.";
    } else if (formData.imageFile.size > 1_500_000) {
      nextErrors.imageFile = "Image too large. Keep it under 1.5MB.";
    }

    if (
      nextErrors.productName ||
      nextErrors.price ||
      nextErrors.contactNumber ||
      nextErrors.shopName ||
      nextErrors.imageFile
    ) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setErrors({
      productName: "",
      price: "",
      contactNumber: "",
      shopName: "",
      imageFile: "",
      form: "",
    });

    try {
      const imageDataUrl = await fileToDataUrl(formData.imageFile);
      const allProducts = readProducts();

      const nextProduct = {
        id: `prod_${Date.now()}`,
        uid: user.uid,
        email: user.email || "",
        productName: formData.productName.trim(),
        price: formData.price.trim(),
        contactNumber: formData.contactNumber.trim(),
        shopName: formData.shopName.trim(),
        imageDataUrl,
        createdAt: new Date().toISOString(),
      };

      const updatedProducts = [nextProduct, ...allProducts];
      saveProducts(updatedProducts);
      setProducts(updatedProducts.filter((item) => item.uid === user.uid));

      setFormData({
        productName: "",
        price: "",
        contactNumber: "",
        shopName: "",
        imageFile: null,
      });

      event.target.reset();
    } catch {
      setErrors((current) => ({
        ...current,
        form: "The image could not be read. Please try another file.",
      }));
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete(productId) {
    const allProducts = readProducts();
    const updatedProducts = allProducts.filter(
      (item) => !(item.id === productId && item.uid === user.uid)
    );

    saveProducts(updatedProducts);
    setProducts(updatedProducts.filter((item) => item.uid === user.uid));
  }

  async function handleLogout() {
    await signOut(auth);
    navigate("/login", { replace: true });
  }

  return (
    <div className="dashboard-body">
      <div className="dashboard-container">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <h2>Interior Studio</h2>
            <p>Vendor Portal</p>
          </div>

          <nav className="sidebar-nav" aria-label="Vendor navigation">
            <Link to="/dashboard" className="nav-item active" aria-current="page">
              <span>Dashboard</span>
            </Link>
            <a href="#my-products" className="nav-item">
              <span>My Products</span>
            </a>
            <a href="#add-product" className="nav-item">
              <span>Add New</span>
            </a>
            <button type="button" className="nav-item logout" onClick={handleLogout}>
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <main className="dashboard-main">
          <header className="main-header">
            <div className="header-title">
              <h1>Dashboard Overview</h1>
              <p>
                Welcome back, <span>{user.email || "Vendor"}</span>
              </p>
            </div>

            <div className="user-profile">
              <div className="avatar" aria-label="User profile">
                {getInitials(user.email)}
              </div>
              <button
                className="dash-logout-btn"
                type="button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </header>

          <section className="analytics-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>{products.length}</h3>
                <p>My Product Listings</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <h3>0</h3>
                <p>Customer Enquiries</p>
              </div>
            </div>
          </section>

          <section className="product-manager" id="my-products">
            <div className="section-header-row">
              <h2>My Products</h2>
              <a className="btn-gold-sm" href="#add-product">
                Add Product
              </a>
            </div>

            <div className="pm-grid">
              <div className="pm-card" id="add-product">
                <div className="pm-card-header">
                  <h3>Add Product</h3>
                  <p>All fields are required.</p>
                </div>

                {errors.form ? (
                  <p className="field-error" aria-live="polite">
                    {errors.form}
                  </p>
                ) : null}

                <form className="pm-form" onSubmit={handleSubmit} noValidate>
                  <div className="form-group">
                    <label htmlFor="pm-name">Product Name *</label>
                    <input
                      id="pm-name"
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleChange}
                    />
                    {errors.productName ? (
                      <p className="field-error">{errors.productName}</p>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="pm-price">Price *</label>
                    <input
                      id="pm-price"
                      type="text"
                      name="price"
                      inputMode="decimal"
                      placeholder="e.g. 45999"
                      value={formData.price}
                      onChange={handleChange}
                    />
                    {errors.price ? <p className="field-error">{errors.price}</p> : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="pm-contact">Contact Number *</label>
                    <input
                      id="pm-contact"
                      type="tel"
                      name="contactNumber"
                      autoComplete="tel"
                      value={formData.contactNumber}
                      onChange={handleChange}
                    />
                    {errors.contactNumber ? (
                      <p className="field-error">{errors.contactNumber}</p>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="pm-shop">Shop Name *</label>
                    <input
                      id="pm-shop"
                      type="text"
                      name="shopName"
                      value={formData.shopName}
                      onChange={handleChange}
                    />
                    {errors.shopName ? (
                      <p className="field-error">{errors.shopName}</p>
                    ) : null}
                  </div>

                  <div className="form-group">
                    <label htmlFor="pm-image">Image Upload *</label>
                    <input
                      id="pm-image"
                      type="file"
                      name="imageFile"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    {errors.imageFile ? (
                      <p className="field-error">{errors.imageFile}</p>
                    ) : null}
                  </div>

                  <div className="pm-actions">
                    <button
                      type="submit"
                      className="btn-gold-sm"
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Product"}
                    </button>
                  </div>
                </form>
              </div>

              <div className="pm-card">
                <div className="pm-card-header pm-list-header">
                  <div>
                    <h3>Your Product Listings</h3>
                    <p>Only visible to you and filtered by your account.</p>
                  </div>
                  <div className="pm-count" aria-label="Product count">
                    {products.length}
                  </div>
                </div>

                {products.length === 0 ? (
                  <div className="pm-empty">
                    <h4>No products yet</h4>
                    <p>Add your first product using the form.</p>
                  </div>
                ) : (
                  <div className="pm-products-grid" aria-live="polite">
                    {products.map((product) => (
                      <article className="pm-product-card" key={product.id}>
                        <div className="pm-product-img">
                          <img
                            src={product.imageDataUrl}
                            alt={product.productName}
                            loading="lazy"
                          />
                        </div>
                        <div className="pm-product-body">
                          <h4 className="pm-product-title">{product.productName}</h4>
                          <div className="pm-product-meta">
                            <div className="pm-meta-row">
                              <span className="pm-meta-label">Price</span>
                              <span className="pm-meta-value">{product.price}</span>
                            </div>
                            <div className="pm-meta-row">
                              <span className="pm-meta-label">Contact</span>
                              <span className="pm-meta-value">
                                {product.contactNumber}
                              </span>
                            </div>
                            <div className="pm-meta-row">
                              <span className="pm-meta-label">Shop</span>
                              <span className="pm-meta-value">{product.shopName}</span>
                            </div>
                          </div>
                          <div className="pm-product-actions">
                            <button
                              type="button"
                              className="pm-danger-btn"
                              onClick={() => handleDelete(product.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
