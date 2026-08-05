"use strict";

const customerModal =
  document.getElementById("customerModal");

const customerForm =
  document.getElementById("customerForm");

const customersTableBody =
  document.querySelector(
    "#customersTable tbody"
  );

const customersCount =
  document.getElementById("customersCount");

const customerSearch =
  document.getElementById("customerSearch");

const addCustomerButton =
  document.querySelector(".gold-button");

const customerNameInput =
  document.getElementById("customerName");

const customerPhoneInput =
  document.getElementById("customerPhone");

const customerCityInput =
  document.getElementById("customerCity");

const customerEmailInput =
  document.getElementById("customerEmail");

let customers = [];
let editingCustomerId = null;

async function fetchJson(
  url,
  options = {}
) {
  const response = await fetch(url, {
    credentials: "include",
    ...options
  });

  let result = {};

  try {
    result = await response.json();
  } catch {
    result = {};
  }

  if (!response.ok) {
    throw new Error(
      result.message ||
      "The request could not be completed."
    );
  }

  return result;
}

async function loadCustomers() {
  if (customersTableBody) {
    customersTableBody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="empty-state"
        >
          Loading customers...
        </td>
      </tr>
    `;
  }

  try {
    const result =
      await fetchJson("/api/customers");

    customers =
      result.customers || [];

    renderCustomers(
      customerSearch?.value || ""
    );
  } catch (error) {
    console.error(
      "Load customers error:",
      error
    );

    customers = [];

    if (customersTableBody) {
      customersTableBody.innerHTML = `
        <tr>
          <td
            colspan="5"
            class="empty-state"
          >
            ${escapeHtml(error.message)}
          </td>
        </tr>
      `;
    }

    updateCustomersCount();
  }
}

function updateCustomersCount() {
  if (!customersCount) return;

  const total = customers.length;

  customersCount.textContent =
    total === 1
      ? "1 Customer"
      : `${total} Customers`;
}

function renderCustomers(
  searchText = ""
) {
  if (!customersTableBody) return;

  customersTableBody.innerHTML = "";

  const normalizedSearch =
    String(searchText)
      .trim()
      .toLowerCase();

  const filteredCustomers =
    customers.filter((customer) => {
      const fullText = [
        customer.name,
        customer.phone,
        customer.city,
        customer.email
      ]
        .join(" ")
        .toLowerCase();

      return fullText.includes(
        normalizedSearch
      );
    });

  if (
    filteredCustomers.length === 0
  ) {
    customersTableBody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="empty-state"
        >
          No customers found.
        </td>
      </tr>
    `;

    updateCustomersCount();
    return;
  }

  filteredCustomers.forEach(
    (customer) => {
      const row =
        document.createElement("tr");

      row.innerHTML = `
        <td>
          ${escapeHtml(
            customer.name || "-"
          )}
        </td>

        <td>
          ${escapeHtml(
            customer.phone || "-"
          )}
        </td>

        <td>
          ${escapeHtml(
            customer.city || "-"
          )}
        </td>

        <td>
          ${escapeHtml(
            customer.email || "-"
          )}
        </td>

        <td>
          <button
            class="action-button edit-button"
            type="button"
            onclick="editCustomer(
              ${Number(customer.id)}
            )"
          >
            Edit
          </button>

          <button
            class="action-button delete-button"
            type="button"
            onclick="deleteCustomer(
              ${Number(customer.id)}
            )"
          >
            Delete
          </button>
        </td>
      `;

      customersTableBody.appendChild(
        row
      );
    }
  );

  updateCustomersCount();
}

function openCustomerModal() {
  if (!customerModal) return;

  customerModal.classList.add("show");
}

function closeCustomerModal() {
  if (!customerModal) return;

  customerModal.classList.remove("show");

  customerForm?.reset();

  editingCustomerId = null;

  const modalTitle =
    customerModal.querySelector(
      ".customer-modal-header h3"
    );

  const submitButton =
    customerForm?.querySelector(
      'button[type="submit"]'
    );

  if (modalTitle) {
    modalTitle.textContent =
      "Add New Customer";
  }

  if (submitButton) {
    submitButton.textContent =
      "Save Customer";
  }
}

function editCustomer(customerId) {
  const customer = customers.find(
    (item) =>
      Number(item.id) ===
      Number(customerId)
  );

  if (!customer) {
    alert("Customer not found.");
    return;
  }

  editingCustomerId =
    Number(customerId);

  if (customerNameInput) {
    customerNameInput.value =
      customer.name || "";
  }

  if (customerPhoneInput) {
    customerPhoneInput.value =
      customer.phone || "";
  }

  if (customerCityInput) {
    customerCityInput.value =
      customer.city || "";
  }

  if (customerEmailInput) {
    customerEmailInput.value =
      customer.email || "";
  }

  const modalTitle =
    customerModal?.querySelector(
      ".customer-modal-header h3"
    );

  const submitButton =
    customerForm?.querySelector(
      'button[type="submit"]'
    );

  if (modalTitle) {
    modalTitle.textContent =
      "Edit Customer";
  }

  if (submitButton) {
    submitButton.textContent =
      "Update Customer";
  }

  openCustomerModal();
}

async function deleteCustomer(
  customerId
) {
  const customer = customers.find(
    (item) =>
      Number(item.id) ===
      Number(customerId)
  );

  if (!customer) {
    alert("Customer not found.");
    return;
  }

  const confirmed =
    window.confirm(
      `Delete ${customer.name}?`
    );

  if (!confirmed) return;

  try {
    const result = await fetchJson(
      `/api/customers/${customerId}`,
      {
        method: "DELETE"
      }
    );

    alert(
      result.message ||
      "Customer deleted successfully."
    );

    await loadCustomers();
  } catch (error) {
    console.error(
      "Delete customer error:",
      error
    );

    alert(error.message);
  }
}

function searchCustomers() {
  renderCustomers(
    customerSearch?.value || ""
  );
}

async function saveCustomer(
  event
) {
  event.preventDefault();

  const name =
    customerNameInput?.value.trim() ||
    "";

  const phone =
    customerPhoneInput?.value.trim() ||
    "";

  const city =
    customerCityInput?.value.trim() ||
    "";

  const email =
    customerEmailInput?.value.trim() ||
    "";

  if (!name || !phone || !city) {
    alert(
      "Please fill in name, phone, and city."
    );

    return;
  }

  const submitButton =
    customerForm?.querySelector(
      'button[type="submit"]'
    );

  if (submitButton) {
    submitButton.disabled = true;

    submitButton.textContent =
      editingCustomerId
        ? "Updating..."
        : "Saving...";
  }

  try {
    const url = editingCustomerId
      ? `/api/customers/${editingCustomerId}`
      : "/api/customers";

    const method = editingCustomerId
      ? "PUT"
      : "POST";

    const result = await fetchJson(
      url,
      {
        method,

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          name,
          phone,
          email,
          adress: city
        })
      }
    );

    alert(
      result.message ||
      (
        editingCustomerId
          ? "Customer updated successfully."
          : "Customer added successfully."
      )
    );

    closeCustomerModal();

    await loadCustomers();
  } catch (error) {
    console.error(
      "Save customer error:",
      error
    );

    alert(error.message);
  } finally {
    if (submitButton) {
      submitButton.disabled = false;

      submitButton.textContent =
        editingCustomerId
          ? "Update Customer"
          : "Save Customer";
    }
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (addCustomerButton) {
  addCustomerButton.addEventListener(
    "click",
    openCustomerModal
  );
}

if (customerSearch) {
  customerSearch.addEventListener(
    "input",
    searchCustomers
  );
}

if (customerModal) {
  customerModal.addEventListener(
    "click",
    (event) => {
      if (
        event.target ===
        customerModal
      ) {
        closeCustomerModal();
      }
    }
  );
}

if (customerForm) {
  customerForm.addEventListener(
    "submit",
    saveCustomer
  );
}

document.addEventListener(
  "DOMContentLoaded",
  loadCustomers
);

window.openCustomerModal =
  openCustomerModal;

window.closeCustomerModal =
  closeCustomerModal;

window.editCustomer =
  editCustomer;

window.deleteCustomer =
  deleteCustomer;

window.searchCustomers =
  searchCustomers;