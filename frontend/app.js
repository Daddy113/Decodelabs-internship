/* ==========================================================================
   DecodeLabs - Frontend Application Logic (app.js)
   Project 4: Full-Stack Integration with CRUD Operations
   Enhanced Edition: Dark Mode, Sorting, Avatars, Stats, Custom Modal
   ========================================================================== */

/**
 * @fileoverview Frontend application for the DecodeLabs Intern Registry.
 * Handles intern CRUD operations (Create, Read, Update, Delete) via the
 * Django REST API, with mock fallback mode when the backend is offline.
 */

// ---------------------------------------------------------------------------
// State Management
// ---------------------------------------------------------------------------

/** @type {Array<Object>} In-memory store of intern records */
let mockInterns = [
    {
        id: 1,
        name: "Alice Vance",
        email: "alice@decodelabs.tech",
        role: "Frontend",
        bio: "Passionate about styling with custom CSS Grid and building accessible components.",
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
        id: 2,
        name: "Bob Miller",
        email: "bob@decodelabs.tech",
        role: "Backend",
        bio: "Specializes in Python, Django REST API design, and database schema optimizations.",
        created_at: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
        id: 3,
        name: "Charlie Smith",
        email: "charlie@decodelabs.tech",
        role: "Full Stack",
        bio: "Likes bridging the gap between responsive design and database integrity. Full stack lover.",
        created_at: new Date(Date.now() - 3600000 * 24).toISOString()
    }
];

/** @type {string} Base URL for the Django REST API */
const API_URL = "http://127.0.0.1:8000/api/interns/";

/** @type {boolean} Tracks whether the backend API is reachable */
let isIntegrated = false;

/** @type {number|null} ID of the intern currently being edited, or null for create mode */
let currentEditId = null;

/** @type {number|null} ID of the intern pending deletion (for custom modal) */
let pendingDeleteId = null;

/** @type {number} Search debounce timer ID */
let searchDebounceTimer = null;

/** @type {string} Current sort preference */
let currentSort = "newest";

// ---------------------------------------------------------------------------
// Avatar Color Palette
// ---------------------------------------------------------------------------

const AVATAR_COLORS = [
    "#C69A7E", "#8FA399", "#D9A05B", "#B85A48",
    "#708238", "#7B6DAA", "#5A8FAD", "#AD7E5A"
];

/**
 * Generates a deterministic color for an avatar based on name hash.
 * @param {string} name - The intern's name
 * @returns {string} A hex color string
 */
function getAvatarColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/**
 * Gets initials from a name (first letter of first and last name).
 * @param {string} name - The full name
 * @returns {string} Up to 2-character initials
 */
function getInitials(name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// ---------------------------------------------------------------------------
// DOM Element References
// ---------------------------------------------------------------------------

const registerForm = document.getElementById("register-form");
const nameInput = document.getElementById("input-name");
const emailInput = document.getElementById("input-email");
const roleSelect = document.getElementById("input-role");
const bioTextarea = document.getElementById("input-bio");
const btnSubmit = document.getElementById("btn-submit");
const btnSubmitText = document.getElementById("btn-submit-text");
const submitLoader = document.getElementById("submit-loader");
const btnCancelEdit = document.getElementById("btn-cancel-edit");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const bioCounter = document.getElementById("bio-counter");

// Modal Registration Form elements
const formModal = document.getElementById("form-modal");
const btnOpenRegister = document.getElementById("btn-open-register");
const btnCloseFormModal = document.getElementById("btn-close-form-modal");
const formModalCard = formModal ? formModal.querySelector(".modal-card") : null;

const searchInput = document.getElementById("search-input");
const filterRole = document.getElementById("filter-role");
const sortSelect = document.getElementById("sort-select");
const internsGrid = document.getElementById("interns-grid");
const internCount = document.getElementById("intern-count");
const emptyState = document.getElementById("empty-state");
const registryLoader = document.getElementById("registry-loader");
const bannerContainer = document.getElementById("banner-container");
const apiStatusIndicator = document.getElementById("api-status-indicator");

// Theme elements
const btnThemeToggle = document.getElementById("btn-theme-toggle");
const themeIcon = document.getElementById("theme-icon");

// Stats elements
const statTotalCount = document.getElementById("stat-total-count");
const statFrontendCount = document.getElementById("stat-frontend-count");
const statBackendCount = document.getElementById("stat-backend-count");
const statFullstackCount = document.getElementById("stat-fullstack-count");

// Modal elements
const deleteModal = document.getElementById("delete-modal");
const modalMessage = document.getElementById("modal-message");
const modalCancel = document.getElementById("modal-cancel");
const modalConfirm = document.getElementById("modal-confirm");

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    checkBackendConnection();
    loadInterns();
});

// ---------------------------------------------------------------------------
// Event Listeners
// ---------------------------------------------------------------------------

registerForm.addEventListener("submit", handleFormSubmit);
searchInput.addEventListener("input", debounceSearch);
filterRole.addEventListener("change", renderFilteredInterns);
sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    renderFilteredInterns();
});

/** Bio character counter — updates on every keystroke */
bioTextarea.addEventListener("input", () => {
    const len = bioTextarea.value.length;
    bioCounter.textContent = `${len} / 200`;
    bioCounter.classList.remove("near-limit", "at-limit");
    if (len >= 200) {
        bioCounter.classList.add("at-limit");
    } else if (len >= 160) {
        bioCounter.classList.add("near-limit");
    }
});

/** Cancel edit/register button */
btnCancelEdit.addEventListener("click", cancelEdit);

/** Open registration modal button */
btnOpenRegister.addEventListener("click", openRegisterModal);

/** Close registration modal button */
btnCloseFormModal.addEventListener("click", closeFormModal);

/** Close form modal on overlay click */
formModal.addEventListener("click", (e) => {
    if (e.target === formModal) closeFormModal();
});

/** Theme toggle */
btnThemeToggle.addEventListener("click", toggleTheme);

/** Modal buttons */
modalCancel.addEventListener("click", closeDeleteModal);
modalConfirm.addEventListener("click", confirmDelete);

/** Close delete modal on overlay click */
deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) closeDeleteModal();
});

/** Keyboard shortcuts */
document.addEventListener("keydown", (e) => {
    // Escape to cancel edit or close modal
    if (e.key === "Escape") {
        if (!deleteModal.classList.contains("hidden")) {
            closeDeleteModal();
        } else if (!formModal.classList.contains("hidden")) {
            closeFormModal();
        }
    }
});

// ---------------------------------------------------------------------------
// Dark Mode / Theme Management
// ---------------------------------------------------------------------------

/**
 * Initializes theme based on localStorage preference or system setting.
 */
function initTheme() {
    const savedTheme = localStorage.getItem("decodelabs-theme");
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Respect system preference
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        applyTheme(prefersDark ? "dark" : "light");
    }
}

/**
 * Toggles between light and dark themes.
 */
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem("decodelabs-theme", newTheme);
}

/**
 * Applies the specified theme.
 * @param {string} theme - "light" or "dark"
 */
function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "dark") {
        themeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    } else {
        themeIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    }
    // Update meta theme-color for mobile browsers
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.content = theme === "dark" ? "#1A1816" : "#C69A7E";
    }
}

// ---------------------------------------------------------------------------
// Search Debounce
// ---------------------------------------------------------------------------

/**
 * Debounces the search input to prevent UI jank during fast typing.
 */
function debounceSearch() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
        renderFilteredInterns();
    }, 200);
}

// ---------------------------------------------------------------------------
// Backend Connectivity Check
// ---------------------------------------------------------------------------

/**
 * Probes the Django API to determine if the backend is alive.
 * If online, switches from mock mode to full API integration.
 * Retries with exponential backoff on failure.
 */
let connectionRetryCount = 0;
const MAX_RETRIES = 3;

async function checkBackendConnection() {
    try {
        const response = await fetch("http://127.0.0.1:8000/api/interns/", { method: "OPTIONS" });
        if (response.ok || response.status === 200) {
            apiStatusIndicator.classList.remove("offline");
            apiStatusIndicator.classList.add("online");
            const wasOffline = !isIntegrated;
            isIntegrated = true;
            connectionRetryCount = 0;
            console.log("Backend connectivity verified. Switching to full-stack API integration mode.");
            if (wasOffline) {
                loadInterns(); // Reload from API, discarding mock data
            }
        }
    } catch (e) {
        apiStatusIndicator.classList.remove("online");
        apiStatusIndicator.classList.add("offline");
        isIntegrated = false;
        console.log("Backend offline. Running in mock frontend-only mode.");
        
        // Retry with exponential backoff
        if (connectionRetryCount < MAX_RETRIES) {
            connectionRetryCount++;
            const delay = Math.min(1000 * Math.pow(2, connectionRetryCount), 8000);
            console.log(`Retrying connection in ${delay}ms (attempt ${connectionRetryCount}/${MAX_RETRIES})...`);
            setTimeout(checkBackendConnection, delay);
        }
    }
}

// ---------------------------------------------------------------------------
// 1. Load Interns (READ — GET)
// ---------------------------------------------------------------------------

/**
 * Fetches intern data from the API (or uses mock data) and renders the grid.
 */
async function loadInterns() {
    showLoader(true);
    
    if (isIntegrated) {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            const data = await response.json();
            mockInterns = data;
        } catch (error) {
            console.error("Failed to fetch interns from API:", error);
            showBanner(`Could not fetch data from server: ${error.message}. Showing local cache.`, "error");
        } finally {
            showLoader(false);
            renderFilteredInterns();
        }
    } else {
        // Mock delay for UI/UX visual validation of loaders
        setTimeout(() => {
            showLoader(false);
            renderFilteredInterns();
        }, 600);
    }
}

// ---------------------------------------------------------------------------
// 2. Render Cards (Filtered, Sorted View)
// ---------------------------------------------------------------------------

/**
 * Filters and sorts the intern list based on search query, role filter,
 * and sort selection, then renders matching intern cards into the grid.
 */
function renderFilteredInterns() {
    const searchQuery = searchInput.value.toLowerCase().trim();
    const roleFilter = filterRole.value;

    let filtered = mockInterns.filter(intern => {
        const matchesSearch = intern.name.toLowerCase().includes(searchQuery) || 
                              intern.email.toLowerCase().includes(searchQuery);
        const matchesRole = roleFilter === "all" || intern.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Apply sorting
    filtered = sortInterns(filtered, currentSort);

    // Update count
    internCount.textContent = filtered.length;

    // Update statistics
    updateStats();

    // Clear grid
    internsGrid.innerHTML = "";

    if (filtered.length === 0) {
        emptyState.classList.remove("hidden");
    } else {
        emptyState.classList.add("hidden");
        
        filtered.forEach((intern, index) => {
            const card = createInternCard(intern);
            // Staggered animation delay based on card position
            card.style.animationDelay = `${index * 0.08}s`;
            internsGrid.appendChild(card);
        });
    }
}

/**
 * Sorts the intern array based on the selected sort option.
 * @param {Array<Object>} interns - The array to sort
 * @param {string} sortBy - The sort key
 * @returns {Array<Object>} Sorted copy
 */
function sortInterns(interns, sortBy) {
    const sorted = [...interns];
    switch (sortBy) {
        case "newest":
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case "oldest":
            sorted.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case "name-asc":
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case "name-desc":
            sorted.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case "role":
            sorted.sort((a, b) => a.role.localeCompare(b.role));
            break;
        default:
            break;
    }
    return sorted;
}

// ---------------------------------------------------------------------------
// 3. Statistics Dashboard
// ---------------------------------------------------------------------------

/**
 * Updates the statistics dashboard with current intern counts per track.
 */
function updateStats() {
    const total = mockInterns.length;
    const frontend = mockInterns.filter(i => i.role === "Frontend").length;
    const backend = mockInterns.filter(i => i.role === "Backend").length;
    const fullstack = mockInterns.filter(i => i.role === "Full Stack").length;

    animateCounter(statTotalCount, total);
    animateCounter(statFrontendCount, frontend);
    animateCounter(statBackendCount, backend);
    animateCounter(statFullstackCount, fullstack);
}

/**
 * Animates a counter element from its current value to the target value.
 * @param {HTMLElement} el - The counter element
 * @param {number} target - The target number
 */
function animateCounter(el, target) {
    const current = parseInt(el.textContent) || 0;
    if (current === target) return;

    const diff = target - current;
    const steps = Math.min(Math.abs(diff), 15);
    const stepDuration = 300 / steps;
    let step = 0;

    const interval = setInterval(() => {
        step++;
        const progress = step / steps;
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        el.textContent = Math.round(current + diff * eased);
        if (step >= steps) {
            el.textContent = target;
            clearInterval(interval);
        }
    }, stepDuration);
}

// ---------------------------------------------------------------------------
// 4. Create Intern Card Element
// ---------------------------------------------------------------------------

/**
 * Dynamically creates an intern card DOM element.
 * Uses textContent (not innerHTML) to defend against XSS.
 * @param {Object} intern - The intern data object
 * @returns {HTMLElement} The constructed card element
 */
function createInternCard(intern) {
    const card = document.createElement("article");
    card.className = "intern-card";
    card.setAttribute("role", "listitem");

    // Header container
    const header = document.createElement("div");
    header.className = "intern-card-header";

    // Name group with avatar
    const nameGroup = document.createElement("div");
    nameGroup.className = "intern-name-group";

    // Avatar
    const avatar = document.createElement("div");
    avatar.className = "intern-avatar";
    avatar.textContent = getInitials(intern.name);
    avatar.style.backgroundColor = getAvatarColor(intern.name);

    const name = document.createElement("h3");
    name.className = "intern-name";
    name.textContent = intern.name;

    nameGroup.appendChild(avatar);
    nameGroup.appendChild(name);

    // Action buttons container
    const actions = document.createElement("div");
    actions.className = "card-actions";

    const btnEdit = document.createElement("button");
    btnEdit.className = "btn-edit";
    btnEdit.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;
    btnEdit.title = "Edit Intern";
    btnEdit.setAttribute("aria-label", `Edit ${intern.name}`);
    btnEdit.addEventListener("click", () => editIntern(intern.id));

    const btnDel = document.createElement("button");
    btnDel.className = "btn-delete";
    btnDel.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;
    btnDel.title = "Delete Intern";
    btnDel.setAttribute("aria-label", `Delete ${intern.name}`);
    btnDel.addEventListener("click", () => openDeleteModal(intern.id, intern.name));

    actions.appendChild(btnEdit);
    actions.appendChild(btnDel);

    header.appendChild(nameGroup);
    header.appendChild(actions);

    // Email
    const email = document.createElement("p");
    email.className = "intern-email";
    email.textContent = intern.email;

    // Role badge
    const badge = document.createElement("span");
    badge.className = `intern-role-badge ${intern.role.toLowerCase().replace(" ", "-")}`;
    badge.textContent = intern.role;

    // Bio
    const bio = document.createElement("p");
    bio.className = "intern-bio";
    bio.textContent = intern.bio || "No biography provided.";

    // Date
    const dateStr = new Date(intern.created_at || Date.now()).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
    const dateVal = document.createElement("p");
    dateVal.className = "intern-date";
    dateVal.textContent = `Joined ${dateStr}`;

    // Append all elements to card
    card.appendChild(header);
    card.appendChild(email);
    card.appendChild(badge);
    card.appendChild(bio);
    card.appendChild(dateVal);

    return card;
}

// ---------------------------------------------------------------------------
// 5. Register / Update Intern (POST / PUT)
// ---------------------------------------------------------------------------

/**
 * Handles form submission for both creating and updating interns.
 * Detects edit mode via `currentEditId` and sends POST or PUT accordingly.
 * @param {Event} e - The form submit event
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) return;

    const internData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        role: roleSelect.value,
        bio: bioTextarea.value.trim()
    };

    setFormSubmitting(true);

    if (isIntegrated) {
        try {
            const isEditing = currentEditId !== null;
            const url = isEditing ? `${API_URL}${currentEditId}/` : API_URL;
            const method = isEditing ? "PUT" : "POST";

            const response = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(internData)
            });

            if (response.status === 400) {
                const errorData = await response.json();
                if (errorData.email) {
                    showFieldError("email", errorData.email.join(" "));
                    throw new Error("Validation Failed: An intern with this email is already registered.");
                } else {
                    throw new Error("Invalid request data sent to server.");
                }
            }

            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            const resultIntern = await response.json();

            if (isEditing) {
                // Replace the updated intern in local state
                const idx = mockInterns.findIndex(i => i.id === currentEditId);
                if (idx !== -1) mockInterns[idx] = resultIntern;
                showBanner(`Successfully updated ${resultIntern.name}!`, "success");
            } else {
                mockInterns.unshift(resultIntern);
                showBanner(`Successfully registered ${resultIntern.name}!`, "success");
            }

            cancelEdit();
            registerForm.reset();
            bioCounter.textContent = "0 / 200";
            bioCounter.classList.remove("near-limit", "at-limit");
            renderFilteredInterns();

            // Scroll to new card
            if (!isEditing) {
                scrollToNewCard();
            }
        } catch (error) {
            console.error("Failed to save intern:", error);
            showBanner(error.message, "error");
        } finally {
            setFormSubmitting(false);
        }
    } else {
        // Mock mode processing
        setTimeout(() => {
            const isEditing = currentEditId !== null;

            if (isEditing) {
                // Mock update
                const idx = mockInterns.findIndex(i => i.id === currentEditId);
                if (idx !== -1) {
                    mockInterns[idx] = { ...mockInterns[idx], ...internData };
                    showBanner(`Successfully updated ${internData.name}!`, "success");
                }
            } else {
                // Mock create — check for duplicate email
                const duplicate = mockInterns.some(i => i.email.toLowerCase() === internData.email.toLowerCase());
                if (duplicate) {
                    showFieldError("email", "This email is already registered.");
                    showBanner("Validation Failed: Duplicate email detected.", "error");
                    setFormSubmitting(false);
                    return;
                }

                const mockCreated = {
                    id: Date.now(),
                    ...internData,
                    created_at: new Date().toISOString()
                };
                mockInterns.unshift(mockCreated);
                showBanner(`Successfully registered ${mockCreated.name}!`, "success");
            }

            cancelEdit();
            registerForm.reset();
            bioCounter.textContent = "0 / 200";
            bioCounter.classList.remove("near-limit", "at-limit");
            renderFilteredInterns();
            setFormSubmitting(false);

            // Scroll to new card
            if (!isEditing) {
                scrollToNewCard();
            }
        }, 800);
    }
}

/**
 * Scrolls to the first card in the grid and highlights it.
 */
function scrollToNewCard() {
    setTimeout(() => {
        const firstCard = internsGrid.querySelector(".intern-card");
        if (firstCard) {
            firstCard.classList.add("just-created");
            firstCard.scrollIntoView({ behavior: "smooth", block: "center" });
            // Remove highlight class after animation
            setTimeout(() => firstCard.classList.remove("just-created"), 2500);
        }
    }, 100);
}

// ---------------------------------------------------------------------------
// 6. Edit Intern (Populate Form for PUT)
// ---------------------------------------------------------------------------

/**
 * Opens the registration form modal in clean/create state.
 */
function openRegisterModal() {
    cancelEdit(); // Reset form state
    formModal.classList.remove("hidden");
    nameInput.focus();
}

/**
 * Closes the form modal and resets the form.
 */
function closeFormModal() {
    cancelEdit();
}

/**
 * Enters edit mode: populates the form with the selected intern's data
 * and changes the form UI to indicate update mode.
 * @param {number} id - The ID of the intern to edit
 */
function editIntern(id) {
    const intern = mockInterns.find(i => i.id === id);
    if (!intern) return;

    currentEditId = id;

    // Populate form fields
    nameInput.value = intern.name;
    emailInput.value = intern.email;
    roleSelect.value = intern.role;
    bioTextarea.value = intern.bio || "";

    // Update bio counter
    const len = bioTextarea.value.length;
    bioCounter.textContent = `${len} / 200`;
    bioCounter.classList.remove("near-limit", "at-limit");
    if (len >= 200) bioCounter.classList.add("at-limit");
    else if (len >= 160) bioCounter.classList.add("near-limit");

    // Switch form to edit mode UI
    formTitle.textContent = "Edit Intern";
    formSubtitle.textContent = `Editing: ${intern.name}`;
    btnSubmitText.textContent = "Update Intern";
    if (formModalCard) {
        formModalCard.classList.add("edit-mode");
    }

    // Open the modal
    formModal.classList.remove("hidden");
    nameInput.focus();

    clearAllErrors();
}

/**
 * Cancels edit mode and resets the form back to create/register mode.
 */
function cancelEdit() {
    currentEditId = null;

    formTitle.textContent = "Register New Intern";
    formSubtitle.textContent = "Enter the details below to add a new intern to the team registry.";
    btnSubmitText.textContent = "Register Intern";
    if (formModalCard) {
        formModalCard.classList.remove("edit-mode");
    }

    // Hide form modal
    formModal.classList.add("hidden");

    registerForm.reset();
    bioCounter.textContent = "0 / 200";
    bioCounter.classList.remove("near-limit", "at-limit");
    clearAllErrors();
}

// ---------------------------------------------------------------------------
// 7. Delete Intern (DELETE) — Custom Modal
// ---------------------------------------------------------------------------

/**
 * Opens the custom delete confirmation modal.
 * @param {number} id - The ID of the intern to delete
 * @param {string} name - The name of the intern (for the message)
 */
function openDeleteModal(id, name) {
    pendingDeleteId = id;
    modalMessage.textContent = `Are you sure you want to remove "${name}" from the registry? This action cannot be undone.`;
    deleteModal.classList.remove("hidden");
    modalConfirm.focus();
}

/**
 * Closes the delete confirmation modal without deleting.
 */
function closeDeleteModal() {
    deleteModal.classList.add("hidden");
    pendingDeleteId = null;
}

/**
 * Confirms and executes the deletion after modal approval.
 */
async function confirmDelete() {
    if (pendingDeleteId === null) return;
    const id = pendingDeleteId;
    closeDeleteModal();

    // If we're editing this intern, cancel the edit first
    if (currentEditId === id) {
        cancelEdit();
    }

    showLoader(true);
    if (isIntegrated) {
        try {
            const response = await fetch(`${API_URL}${id}/`, {
                method: "DELETE"
            });

            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }

            mockInterns = mockInterns.filter(intern => intern.id !== id);
            showBanner("Intern removed successfully from server database.", "success");
        } catch (error) {
            console.error("Failed to delete intern:", error);
            showBanner(`Failed to delete intern: ${error.message}`, "error");
        } finally {
            showLoader(false);
            renderFilteredInterns();
        }
    } else {
        // Mock delete processing
        setTimeout(() => {
            mockInterns = mockInterns.filter(intern => intern.id !== id);
            showBanner("Intern removed successfully.", "success");
            showLoader(false);
            renderFilteredInterns();
        }, 400);
    }
}

// ---------------------------------------------------------------------------
// Validation Utilities
// ---------------------------------------------------------------------------

/**
 * Validates all form fields and displays error messages for invalid inputs.
 * @returns {boolean} True if the form is valid, false otherwise
 */
function validateForm() {
    let isValid = true;
    clearAllErrors();

    // Name validation
    const nameVal = nameInput.value.trim();
    if (nameVal.length < 2) {
        showFieldError("name", "Name must be at least 2 characters long.");
        isValid = false;
    }

    // Email validation
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
        showFieldError("email", "Email is required.");
        isValid = false;
    } else if (!emailRegex.test(emailVal)) {
        showFieldError("email", "Please enter a valid email address.");
        isValid = false;
    }

    // Role validation
    if (!roleSelect.value) {
        showFieldError("role", "Please select a development track.");
        isValid = false;
    }

    // Bio length validation
    if (bioTextarea.value.length > 200) {
        showFieldError("bio", "Biography cannot exceed 200 characters.");
        isValid = false;
    }

    return isValid;
}

/**
 * Displays a validation error message for a specific form field.
 * @param {string} field - The field name (name, email, role, bio)
 * @param {string} msg - The error message to display
 */
function showFieldError(field, msg) {
    const errorEl = document.getElementById(`${field}-error`);
    if (errorEl) errorEl.textContent = msg;
    const inputEl = document.getElementById(`input-${field}`);
    if (inputEl) inputEl.classList.add("input-invalid");
}

/**
 * Clears all validation error messages and removes invalid styling.
 */
function clearAllErrors() {
    const errors = document.querySelectorAll(".error-msg");
    errors.forEach(e => e.textContent = "");
    
    const inputs = document.querySelectorAll("input, select, textarea");
    inputs.forEach(i => i.classList.remove("input-invalid"));
}

// ---------------------------------------------------------------------------
// UI State Management Utilities
// ---------------------------------------------------------------------------

/**
 * Shows or hides the registry loading overlay.
 * @param {boolean} show - Whether to display the loader
 */
function showLoader(show) {
    if (show) {
        registryLoader.classList.remove("hidden");
    } else {
        registryLoader.classList.add("hidden");
    }
}

/**
 * Toggles the form into a submitting state (button disabled, spinner shown).
 * @param {boolean} submitting - Whether the form is currently submitting
 */
function setFormSubmitting(submitting) {
    if (submitting) {
        btnSubmit.disabled = true;
        submitLoader.classList.remove("hidden");
    } else {
        btnSubmit.disabled = false;
        submitLoader.classList.add("hidden");
    }
}

// ---------------------------------------------------------------------------
// Notification Toasts
// ---------------------------------------------------------------------------

/**
 * Displays a toast notification banner that auto-dismisses after 4 seconds.
 * @param {string} message - The notification message
 * @param {string} [type="success"] - The banner type: "success" or "error"
 */
function showBanner(message, type = "success") {
    const banner = document.createElement("div");
    banner.className = `banner banner-${type}`;
    
    const icon = document.createElement("span");
    icon.className = "banner-icon";
    if (type === "success") {
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    } else {
        icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    }
    
    const text = document.createElement("span");
    text.textContent = message;

    banner.appendChild(icon);
    banner.appendChild(text);
    bannerContainer.appendChild(banner);

    // Auto-remove after 4 seconds with fade-out
    setTimeout(() => {
        banner.style.opacity = "0";
        setTimeout(() => {
            banner.remove();
        }, 300);
    }, 4000);
}
