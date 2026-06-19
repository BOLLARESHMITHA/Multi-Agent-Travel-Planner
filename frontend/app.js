/* ==========================================================================
   VoyageAI Client-Side Application Logic (Vanilla JavaScript)
   ========================================================================== */

const API_BASE = "http://127.0.0.1:8000";

// Global App State
const state = {
    token: localStorage.getItem("token") || null,
    username: localStorage.getItem("username") || null,
    trips: [],
    activeTrip: null
};

// DOM Elements
const elements = {
    // Auth
    authSection: document.getElementById("authSection"),
    authTabs: document.querySelectorAll(".auth-tab"),
    loginForm: document.getElementById("loginForm"),
    signupForm: document.getElementById("signupForm"),
    loginUsername: document.getElementById("loginUsername"),
    loginPassword: document.getElementById("loginPassword"),
    signupUsername: document.getElementById("signupUsername"),
    signupEmail: document.getElementById("signupEmail"),
    signupPassword: document.getElementById("signupPassword"),
    loginError: document.getElementById("loginError"),
    signupError: document.getElementById("signupError"),
    signupSuccess: document.getElementById("signupSuccess"),
    
    // Header
    userProfile: document.getElementById("userProfile"),
    usernameDisplay: document.getElementById("usernameDisplay"),
    logoutBtn: document.getElementById("logoutBtn"),

    // Dashboard
    dashboardSection: document.getElementById("dashboardSection"),
    newTripBtn: document.getElementById("newTripBtn"),
    tripsList: document.getElementById("tripsList"),
    emptyState: document.getElementById("emptyState"),
    emptyStateBtn: document.getElementById("emptyStateBtn"),

    // Wizard Form
    wizardSection: document.getElementById("wizardSection"),
    backToDashboardBtn: document.getElementById("backToDashboardBtn"),
    tripForm: document.getElementById("tripForm"),
    tripSource: document.getElementById("tripSource"),
    tripDestination: document.getElementById("tripDestination"),
    tripDate: document.getElementById("tripDate"),
    tripDays: document.getElementById("tripDays"),
    tripBudget: document.getElementById("tripBudget"),
    preferencesChips: document.getElementById("preferencesChips"),
    tripRequirements: document.getElementById("tripRequirements"),

    // Loading Screen
    loadingSection: document.getElementById("loadingSection"),
    loadingTitle: document.getElementById("loadingTitle"),
    loadingDescription: document.getElementById("loadingDescription"),

    // Details View
    detailsSection: document.getElementById("detailsSection"),
    backToDashFromDetails: document.getElementById("backToDashFromDetails"),
    detailsDestTitle: document.getElementById("detailsDestTitle"),
    detailsMetaSubtitle: document.getElementById("detailsMetaSubtitle"),
    destinationHighlights: document.getElementById("destinationHighlights"),
    detailsTabs: document.querySelectorAll(".details-tab"),
    tabContents: document.querySelectorAll(".tab-content"),
    
    // Tab Contents
    itineraryTimeline: document.getElementById("itineraryTimeline"),
    hotelList: document.getElementById("hotelList"),
    recommendedTransport: document.getElementById("recommendedTransport"),
    altTransportList: document.getElementById("altTransportList"),
    weatherForecastGrid: document.getElementById("weatherForecastGrid"),
    weatherSuggestionsList: document.getElementById("weatherSuggestionsList"),
    budgetTotalVal: document.getElementById("budgetTotalVal"),
    budgetSpentVal: document.getElementById("budgetSpentVal"),
    budgetRemainingVal: document.getElementById("budgetRemainingVal"),
    budgetBars: document.getElementById("budgetBars"),
    budgetStatusAlert: document.getElementById("budgetStatusAlert"),
    budgetStatusText: document.getElementById("budgetStatusText"),
    finalRecScore: document.getElementById("finalRecScore"),
    finalRecHotel: document.getElementById("finalRecHotel"),
    finalRecTransport: document.getElementById("finalRecTransport"),
    aiRecommendationsList: document.getElementById("aiRecommendationsList")
};

// ==========================================
// Initialization & Navigation
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    // Set min date for wizard form to today
    const today = new Date().toISOString().split("T")[0];
    elements.tripDate.setAttribute("min", today);
    elements.tripDate.value = today;

    if (state.token) {
        showDashboard();
    } else {
        showAuth();
    }
}

function setupEventListeners() {
    // Auth Tabs Toggle
    elements.authTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            elements.authTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            
            const tabId = tab.dataset.tab;
            if (tabId === "loginTab") {
                elements.loginForm.classList.add("active-form");
                elements.signupForm.classList.remove("active-form");
            } else {
                elements.loginForm.classList.remove("active-form");
                elements.signupForm.classList.add("active-form");
            }
        });
    });

    // Auth Forms Submit
    elements.loginForm.addEventListener("submit", handleLogin);
    elements.signupForm.addEventListener("submit", handleSignup);
    elements.logoutBtn.addEventListener("click", logout);

    // Dashboard Actions
    elements.newTripBtn.addEventListener("click", showWizard);
    elements.emptyStateBtn.addEventListener("click", showWizard);
    elements.backToDashboardBtn.addEventListener("click", showDashboard);
    elements.backToDashFromDetails.addEventListener("click", showDashboard);

    // Form Wizard Chips
    elements.preferencesChips.addEventListener("click", (e) => {
        if (e.target.classList.contains("chip")) {
            e.target.classList.toggle("selected");
        }
    });

    // Trip Wizard Submit
    elements.tripForm.addEventListener("submit", handleCreateTrip);

    // Details Tabs Toggle
    elements.detailsTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            elements.detailsTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const contentId = tab.dataset.content;
            elements.tabContents.forEach(content => {
                if (content.id === contentId) {
                    content.classList.add("active-content");
                } else {
                    content.classList.remove("active-content");
                }
            });
        });
    });
}

// ==========================================
// Auth Handling
// ==========================================
async function handleLogin(e) {
    e.preventDefault();
    elements.loginError.textContent = "";
    
    const username = elements.loginUsername.value.trim();
    const password = elements.loginPassword.value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Authentication failed");
        }

        const data = await response.json();
        saveAuth(data.token, username);
        showDashboard();
        
        // Clear inputs
        elements.loginUsername.value = "";
        elements.loginPassword.value = "";
    } catch (err) {
        elements.loginError.textContent = err.message;
    }
}

async function handleSignup(e) {
    e.preventDefault();
    elements.signupError.textContent = "";
    elements.signupSuccess.textContent = "";
    
    const username = elements.signupUsername.value.trim();
    const email = elements.signupEmail.value.trim();
    const password = elements.signupPassword.value;

    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Registration failed");
        }

        elements.signupSuccess.textContent = "Account created successfully! Please log in.";
        elements.signupForm.reset();
        
        // Switch to login tab after 2s
        setTimeout(() => {
            const loginTab = document.querySelector('[data-tab="loginTab"]');
            if (loginTab) loginTab.click();
        }, 1500);
    } catch (err) {
        elements.signupError.textContent = err.message;
    }
}

function saveAuth(token, username) {
    state.token = token;
    state.username = username;
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
}

function logout() {
    state.token = null;
    state.username = null;
    state.trips = [];
    state.activeTrip = null;
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    showAuth();
}

// ==========================================
// UI Transition Helpers
// ==========================================
function hideAllSections() {
    elements.authSection.style.display = "none";
    elements.dashboardSection.style.display = "none";
    elements.wizardSection.style.display = "none";
    elements.detailsSection.style.display = "none";
    elements.loadingSection.style.display = "none";
    elements.userProfile.style.display = "none";
}

function showAuth() {
    hideAllSections();
    elements.authSection.style.display = "block";
}

async function showDashboard() {
    hideAllSections();
    elements.userProfile.style.display = "flex";
    elements.usernameDisplay.textContent = state.username;
    elements.dashboardSection.style.display = "block";
    
    await loadTripsList();
}

function showWizard() {
    hideAllSections();
    elements.userProfile.style.display = "flex";
    elements.wizardSection.style.display = "block";
    elements.tripForm.reset();
    
    // Clear select chips
    elements.preferencesChips.querySelectorAll(".chip").forEach(chip => {
        chip.classList.remove("selected");
    });
}

// ==========================================
// Dashboard Data Loading
// ==========================================
async function loadTripsList() {
    elements.tripsList.innerHTML = "";
    elements.emptyState.style.display = "none";
    
    try {
        const response = await fetch(`${API_BASE}/trip/`, {
            headers: { "Authorization": `Bearer ${state.token}` }
        });

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) throw new Error("Failed to load trips");

        state.trips = await response.json();

        if (state.trips.length === 0) {
            elements.emptyState.style.display = "flex";
            return;
        }

        state.trips.forEach(trip => {
            const card = document.createElement("div");
            card.className = "trip-card glass-panel";
            card.addEventListener("click", () => loadTripDetails(trip.trip_id));
            
            // Format dates briefly
            const dateStr = trip.travel_date;
            
            card.innerHTML = `
                <div class="trip-card-header">
                    <div>
                        <div class="trip-dest">${trip.destination}</div>
                        <div class="trip-dates"><i class="fa-regular fa-calendar"></i> ${dateStr}</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="trip-badge">${trip.days} Days</span>
                        <button class="delete-trip-btn" title="Delete Trip"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div class="trip-card-footer">
                    <div class="trip-budget-info">
                        <span class="trip-budget-label">Budget Limit</span>
                        <span class="trip-budget-val">₹${Number(trip.budget).toLocaleString()}</span>
                    </div>
                    <div class="trip-go-btn">
                        <i class="fa-solid fa-arrow-right"></i>
                    </div>
                </div>
            `;
            
            const deleteBtn = card.querySelector(".delete-trip-btn");
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                deleteTrip(trip.trip_id, trip.destination);
            });

            elements.tripsList.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        elements.tripsList.innerHTML = `<p class="auth-error">Error loading dashboard: ${err.message}</p>`;
    }
}


async function deleteTrip(tripId, destinationName) {
    if (!confirm(`Are you sure you want to delete your trip to ${destinationName}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/trip/${tripId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${state.token}` }
        });
        
        if (response.status === 401) {
            logout();
            return;
        }
        
        if (!response.ok) throw new Error("Failed to delete trip");
        
        loadTripsList();
    } catch (err) {
        console.error(err);
        alert(`Error deleting trip: ${err.message}`);
    }
}

// ==========================================
// Trip Details Loading & Rendering
// ==========================================
async function loadTripDetails(tripId) {
    hideAllSections();
    elements.loadingSection.style.display = "flex";
    elements.userProfile.style.display = "flex";
    
    // Set immediate loading labels
    elements.loadingTitle.textContent = "Loading Trip Details...";
    elements.loadingDescription.textContent = "Contacting database repository to recover agent reports.";
    resetAgentLoaderSteps();

    try {
        const response = await fetch(`${API_BASE}/trip/${tripId}`, {
            headers: { "Authorization": `Bearer ${state.token}` }
        });

        if (!response.ok) throw new Error("Could not fetch trip plan details");

        const tripPlan = await response.json();
        state.activeTrip = tripPlan;
        
        // Finish loader animation quickly
        setAllStepsComplete();
        setTimeout(() => {
            renderTripPlan(tripPlan);
        }, 600);
    } catch (err) {
        elements.loadingSection.style.display = "none";
        alert(err.message);
        showDashboard();
    }
}

function renderTripPlan(plan) {
    hideAllSections();
    elements.detailsSection.style.display = "block";
    
    // Header Info
    elements.detailsDestTitle.textContent = plan.destination;
    elements.detailsMetaSubtitle.innerHTML = `
        <i class="fa-solid fa-route"></i> From ${plan.source} &nbsp;&bull;&nbsp; 
        <i class="fa-solid fa-calendar-days"></i> ${plan.travel_date} &nbsp;&bull;&nbsp;
        <i class="fa-solid fa-clock"></i> ${plan.days} Days &nbsp;&bull;&nbsp;
        <i class="fa-solid fa-indian-rupee-sign"></i> Budget: ₹${Number(plan.budget).toLocaleString()}
    `;

    // Highlights tags
    elements.destinationHighlights.innerHTML = "";
    if (plan.destination_highlights && plan.destination_highlights.length > 0) {
        plan.destination_highlights.forEach(hl => {
            const span = document.createElement("span");
            span.className = "highlight-tag";
            span.textContent = hl;
            elements.destinationHighlights.appendChild(span);
        });
    }

    // Default to first tab
    elements.detailsTabs[0].click();

    // 1. ITINERARY
    elements.itineraryTimeline.innerHTML = "";
    plan.itinerary.forEach(day => {
        const section = document.createElement("div");
        section.className = "day-section";
        section.innerHTML = `
            <div class="day-marker">${day.day}</div>
            <div class="day-content-card glass-panel">
                <div class="day-header">
                    <h4>Day ${day.day} Schedule</h4>
                    <span class="day-cost">Est. Expense: ₹${Number(day.estimated_spend).toLocaleString()}</span>
                </div>
                <div class="time-slots">
                    <div class="time-slot">
                        <div class="time-slot-label"><i class="fa-solid fa-sun-plant-wilt"></i> Morning</div>
                        <div class="time-slot-text">${day.morning}</div>
                    </div>
                    <div class="time-slot">
                        <div class="time-slot-label"><i class="fa-solid fa-sun"></i> Afternoon</div>
                        <div class="time-slot-text">${day.afternoon}</div>
                    </div>
                    <div class="time-slot">
                        <div class="time-slot-label"><i class="fa-solid fa-cloud-moon"></i> Evening</div>
                        <div class="time-slot-text">${day.evening}</div>
                    </div>
                    <div class="time-slot">
                        <div class="time-slot-label"><i class="fa-solid fa-moon"></i> Night</div>
                        <div class="time-slot-text">${day.night}</div>
                    </div>
                </div>
            </div>
        `;
        elements.itineraryTimeline.appendChild(section);
    });

    // 2. STAYS & TRANSPORT
    // Stays list
    elements.hotelList.innerHTML = "";
    plan.hotels.forEach(hotel => {
        const card = document.createElement("div");
        card.className = "hotel-card";
        
        let starsHtml = "";
        const fullStars = Math.floor(hotel.rating);
        for(let i=0; i<fullStars; i++) starsHtml += '<i class="fa-solid fa-star"></i>';
        if(hotel.rating % 1 !== 0) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
        
        const amenitiesHtml = hotel.features.map(f => `<span class="amenity-badge">${f}</span>`).join("");

        card.innerHTML = `
            <div class="hotel-info">
                <h4>${hotel.name}</h4>
                <div class="hotel-meta">
                    <span class="hotel-rating">${starsHtml} ${hotel.rating}</span>
                    <span><i class="fa-solid fa-map-pin"></i> ${hotel.location}</span>
                </div>
                <div class="hotel-amenities">
                    ${amenitiesHtml}
                </div>
            </div>
            <div class="hotel-price-box">
                <div class="hotel-cost">₹${Number(hotel.total_cost).toLocaleString()}</div>
                <div class="hotel-nightly">₹${Number(hotel.cost_per_night).toLocaleString()} / night</div>
            </div>
        `;
        elements.hotelList.appendChild(card);
    });

    // Transport Recommended
    const tRec = plan.transport;
    const cheapestFlight = (tRec.available_options && tRec.available_options.length > 0)
        ? (tRec.available_options.find(opt => opt.cost === tRec.recommended_cost) || tRec.available_options[0])
        : null;

    const recommendedProvider = cheapestFlight ? cheapestFlight.provider : "Flight";
    const recommendedDep = cheapestFlight ? cheapestFlight.departure_time : "N/A";
    const recommendedDur = cheapestFlight ? cheapestFlight.duration : "N/A";

    elements.recommendedTransport.innerHTML = `
        <span class="rec-title-badge" style="background-color: var(--success-light); color: var(--success);"><i class="fa-solid fa-thumbs-up"></i> Swarm Pick</span>
        <div class="trans-main-row">
            <div class="trans-mode"><i class="fa-solid fa-plane"></i> ${recommendedProvider}</div>
            <div class="trans-cost">₹${Number(tRec.recommended_cost).toLocaleString()}</div>
        </div>
        <div class="trans-details">
            <div><strong>Departure Time:</strong> ${recommendedDep}</div>
            <div><strong>Flight Duration:</strong> ${recommendedDur}</div>
        </div>
        <div class="trans-reason" style="margin-top: 12px;">
            "${tRec.reason}"
        </div>
    `;

    // Render all available flights list
    elements.altTransportList.innerHTML = "";
    if (tRec.available_options && tRec.available_options.length > 0) {
        tRec.available_options.forEach(opt => {
            const isCheapest = (cheapestFlight && opt.cost === cheapestFlight.cost && opt.provider === cheapestFlight.provider && opt.departure_time === cheapestFlight.departure_time);
            
            const item = document.createElement("div");
            item.className = "alt-trans-item";
            
            if (isCheapest) {
                item.style.borderColor = "var(--success)";
                item.style.background = "rgba(16, 185, 129, 0.05)";
            }

            const badgeHtml = isCheapest 
                ? `<span class="rec-title-badge" style="margin: 0 0 0 10px; padding: 2px 8px; font-size: 0.7rem; background-color: var(--success-light); color: var(--success);"><i class="fa-solid fa-star"></i> Cheapest</span>` 
                : "";

            item.innerHTML = `
                <div class="alt-trans-mode">
                    <i class="fa-solid fa-plane"></i> ${opt.provider || opt.mode} ${badgeHtml}
                </div>
                <div>
                    <span style="color: var(--text-secondary); margin-right: 15px;">Dep: ${opt.departure_time || '12:00'} (${opt.duration})</span>
                    <strong>₹${Number(opt.cost).toLocaleString()}</strong>
                </div>
            `;
            elements.altTransportList.appendChild(item);
        });
    }

    // 3. WEATHER FORECAST
    elements.weatherForecastGrid.innerHTML = "";
    plan.weather.forecast.forEach(w => {
        const wCard = document.createElement("div");
        wCard.className = "weather-card";
        
        let weatherIcon = "fa-cloud-sun";
        const cond = w.condition.toLowerCase();
        if (cond.includes("rain") || cond.includes("shower")) weatherIcon = "fa-cloud-showers-heavy";
        else if (cond.includes("sunny") || cond.includes("clear")) weatherIcon = "fa-sun";
        else if (cond.includes("thunder") || cond.includes("storm")) weatherIcon = "fa-cloud-bolt";
        else if (cond.includes("snow")) weatherIcon = "fa-snowflake";
        else if (cond.includes("cloud") || cond.includes("overcast")) weatherIcon = "fa-cloud";

        wCard.innerHTML = `
            <div class="weather-date">${w.date}</div>
            <div class="weather-day">${w.day_label}</div>
            <i class="fa-solid ${weatherIcon} weather-icon"></i>
            <div class="weather-temp">${w.temperature}</div>
            <div class="weather-cond">${w.condition}</div>
        `;
        elements.weatherForecastGrid.appendChild(wCard);
    });

    elements.weatherSuggestionsList.innerHTML = "";
    plan.weather.suggestions.forEach(s => {
        const li = document.createElement("li");
        li.textContent = s;
        elements.weatherSuggestionsList.appendChild(li);
    });

    // 4. BUDGET ANALYSIS & AI TIPS
    elements.budgetTotalVal.textContent = `₹${Number(plan.budget).toLocaleString()}`;
    elements.budgetSpentVal.textContent = `₹${Number(plan.budget_analysis.total_spent).toLocaleString()}`;
    
    const remaining = plan.budget_analysis.remaining_budget;
    elements.budgetRemainingVal.textContent = `₹${Number(remaining).toLocaleString()}`;
    if (remaining < 0) {
        elements.budgetRemainingVal.className = "stat-value text-danger";
        elements.budgetStatusAlert.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
        elements.budgetStatusAlert.style.color = "var(--danger)";
        elements.budgetStatusAlert.style.borderColor = "rgba(239, 68, 68, 0.2)";
        elements.budgetStatusAlert.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Over Budget! The plan exceeds your target by ₹${Math.abs(remaining).toLocaleString()}.`;
    } else {
        elements.budgetRemainingVal.className = "stat-value text-success";
        elements.budgetStatusAlert.style.backgroundColor = "var(--success-light)";
        elements.budgetStatusAlert.style.color = "var(--success)";
        elements.budgetStatusAlert.style.borderColor = "rgba(16, 185, 129, 0.2)";
        elements.budgetStatusAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span id="budgetStatusText">Under Budget! Buffer of ₹${remaining.toLocaleString()} preserved successfully.</span>`;
    }

    // Budget Bars
    elements.budgetBars.innerHTML = "";
    const breakdown = plan.budget_analysis.breakdown;
    const totalSpent = plan.budget_analysis.total_spent || 1;
    
    for (const [category, cost] of Object.entries(breakdown)) {
        const percentage = Math.min((cost / totalSpent) * 100, 100);
        const barItem = document.createElement("div");
        barItem.className = "budget-bar-item";
        barItem.innerHTML = `
            <div class="bar-labels">
                <span class="bar-cat">${capitalizeFirstLetter(category)}</span>
                <span class="bar-val">₹${Number(cost).toLocaleString()} (${Math.round(percentage)}%)</span>
            </div>
            <div class="bar-bg">
                <div class="bar-fill" style="width: ${percentage}%"></div>
            </div>
        `;
        elements.budgetBars.appendChild(barItem);
    }

    // Final recommendation summary
    elements.finalRecScore.textContent = plan.final_recommendation.overall_score.toFixed(1);
    elements.finalRecHotel.textContent = plan.final_recommendation.hotel;
    elements.finalRecTransport.textContent = plan.final_recommendation.transport;

    // AI Tips list
    elements.aiRecommendationsList.innerHTML = "";
    plan.ai_recommendations.forEach(tip => {
        const item = document.createElement("div");
        item.className = "ai-tip-item";
        
        // Use warning icon if it's an error message
        let icon = "fa-lightbulb";
        if (tip.toLowerCase().includes("could not be loaded") || tip.toLowerCase().includes("failed")) {
            icon = "fa-circle-exclamation";
            item.style.borderColor = "var(--danger)";
            item.style.color = "var(--text-secondary)";
            item.innerHTML = `<i class="fa-solid ${icon}" style="color: var(--danger);"></i> <span>${tip}</span>`;
        } else {
            item.innerHTML = `<i class="fa-regular ${icon}"></i> <span>${tip}</span>`;
        }
        elements.aiRecommendationsList.appendChild(item);
    });
}

// ==========================================
// Trip Wizard Plan Creation
// ==========================================
async function handleCreateTrip(e) {
    e.preventDefault();

    const source = elements.tripSource.value.trim();
    const destination = elements.tripDestination.value.trim();
    const rawDate = elements.tripDate.value; // YYYY-MM-DD
    const days = parseInt(elements.tripDays.value, 10);
    const budget = parseFloat(elements.tripBudget.value);
    const requirements = elements.tripRequirements.value.trim();

    // Convert date YYYY-MM-DD -> DD-MM-YYYY
    const dateParts = rawDate.split("-");
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    // Collect chips preferences
    const preferences = [];
    elements.preferencesChips.querySelectorAll(".chip.selected").forEach(chip => {
        preferences.push(chip.dataset.val);
    });

    // Hide wizard and open Loading Swarm simulation
    hideAllSections();
    elements.loadingSection.style.display = "flex";
    elements.userProfile.style.display = "flex";
    
    // Set custom text
    elements.loadingTitle.textContent = "Deploying Agent Swarm...";
    elements.loadingDescription.textContent = "Connecting to the coordinator agent. Resolving tasks...";
    resetAgentLoaderSteps();

    // Start loader timeline animation simulation
    const animationInterval = runLoaderAnimation();

    const payload = {
        source,
        destination,
        travel_date: formattedDate,
        days,
        budget,
        preferences,
        additional_requirements: requirements
    };

    try {
        const response = await fetch(`${API_BASE}/trip/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${state.token}`
            },
            body: JSON.stringify(payload)
        });

        clearInterval(animationInterval);

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Multi-Agent planner failed to generate itinerary.");
        }

        const plan = await response.json();
        
        // Fast completion ticks
        setAllStepsComplete();
        setTimeout(() => {
            renderTripPlan(plan);
        }, 500);
    } catch (err) {
        clearInterval(animationInterval);
        elements.loadingSection.style.display = "none";
        alert(err.message);
        showWizard();
    }
}

// ==========================================
// Loading Overlay Swarm Simulator Animation
// ==========================================
const stepConfigs = [
    { id: "step-coord", label: "Coordinator Swarm Ready", order: 0 },
    { id: "step-dest", label: "Destination Agent analyzed highlights", order: 1 },
    { id: "step-weather", label: "Weather Agent pulled forecast reports", order: 2 },
    { id: "step-hotel", label: "Hotel Agent curated accommodation deals", order: 3 },
    { id: "step-transport", label: "Transport Agent matching routes and costs", order: 4 },
    { id: "step-budget", label: "Budget Agent optimized spending categories", order: 5 },
    { id: "step-llm", label: "Recommendation Agent processing LLM reports (Groq)", order: 6 }
];

function resetAgentLoaderSteps() {
    stepConfigs.forEach(step => {
        const el = document.getElementById(step.id);
        if (el) {
            el.className = "agent-step";
            el.innerHTML = `<i class="fa-solid fa-circle-minus"></i> ${step.label}`;
        }
    });
}

function setAllStepsComplete() {
    stepConfigs.forEach(step => {
        const el = document.getElementById(step.id);
        if (el) {
            el.className = "agent-step";
            el.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${step.label}`;
        }
    });
}

function runLoaderAnimation() {
    let currentStep = 0;
    
    // Complete first coordinator step immediately
    const firstEl = document.getElementById(stepConfigs[0].id);
    if(firstEl) firstEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${stepConfigs[0].label}`;

    const interval = setInterval(() => {
        if (currentStep < stepConfigs.length - 1) {
            // Set current running to spin
            const currentEl = document.getElementById(stepConfigs[currentStep].id);
            if (currentEl) {
                currentEl.className = "agent-step";
                currentEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${stepConfigs[currentStep].label}`;
            }

            currentStep++;

            // Set next to loading spin
            const nextEl = document.getElementById(stepConfigs[currentStep].id);
            if (nextEl) {
                nextEl.className = "agent-step";
                nextEl.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${stepConfigs[currentStep].label}`;
                elements.loadingDescription.textContent = `${stepConfigs[currentStep].label}...`;
            }
        }
    }, 1800); // Progress step every 1.8 seconds

    return interval;
}

// ==========================================
// Formatting Helpers
// ==========================================
function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}
