/* ==========================================================================
   VoyageAI Tours Client-Side Logic (Modal Auth & Landing Page Integration)
   ========================================================================== */

const API_BASE = "http://127.0.0.1:8000";

// Global App State
const state = {
    token: localStorage.getItem("token") || null,
    username: localStorage.getItem("username") || null,
    trips: [],
    activeTrip: null,
    pendingTripPlan: null // Stores parameters if user clicks "Plan Trip" before logging in
};

// DOM Elements
const elements = {
    // Auth Modal & Forms
    authModal: document.getElementById("authModal"),
    closeAuthModalBtn: document.getElementById("closeAuthModalBtn"),
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
    toggleToSignup: document.getElementById("toggleToSignup"),
    toggleToLogin: document.getElementById("toggleToLogin"),
    
    // Header & Navigation
    anonActions: document.getElementById("anonActions"),
    userProfile: document.getElementById("userProfile"),
    usernameDisplay: document.getElementById("usernameDisplay"),
    logoutBtn: document.getElementById("logoutBtn"),
    navLoginBtn: document.getElementById("navLoginBtn"),
    navSignupBtn: document.getElementById("navSignupBtn"),
    navDashLink: document.getElementById("navDashLink"),
    landingNav: document.getElementById("landingNav"),

    // Landing Page
    landingSection: document.getElementById("landingSection"),
    heroExploreBtn: document.getElementById("heroExploreBtn"),
    heroDemoBtn: document.getElementById("heroDemoBtn"),

    // Dashboard
    dashboardSection: document.getElementById("dashboardSection"),
    newTripBtn: document.getElementById("newTripBtn"),
    heroPlanBtn: document.getElementById("heroPlanBtn"),
    tripsList: document.getElementById("tripsList"),
    emptyState: document.getElementById("emptyState"),
    emptyStateBtn: document.getElementById("emptyStateBtn"),
    tripSearchInput: document.getElementById("tripSearchInput"),
    statTotalTrips: document.getElementById("statTotalTrips"),
    statSpentBudget: document.getElementById("statSpentBudget"),

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
    wizardProgressFill: document.getElementById("wizardProgressFill"),
    prevStepBtn: document.getElementById("prevStepBtn"),
    nextStepBtn: document.getElementById("nextStepBtn"),
    submitTripBtn: document.getElementById("submitTripBtn"),

    // Loading Screen
    loadingSection: document.getElementById("loadingSection"),
    loadingTitle: document.getElementById("loadingTitle"),
    loadingDescription: document.getElementById("loadingDescription"),
    terminalLogs: document.getElementById("terminalLogs"),

    // Details View
    detailsSection: document.getElementById("detailsSection"),
    backToDashFromDetails: document.getElementById("backToDashFromDetails"),
    detailsDestTitle: document.getElementById("detailsDestTitle"),
    detailsMetaSubtitle: document.getElementById("detailsMetaSubtitle"),
    destinationHighlights: document.getElementById("destinationHighlights"),
    detailsTabs: document.querySelectorAll(".details-tab"),
    tabContents: document.querySelectorAll(".tab-content"),
    expandAllDays: document.getElementById("expandAllDays"),
    collapseAllDays: document.getElementById("collapseAllDays"),
    
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
    budgetRingFill: document.getElementById("budgetRingFill"),
    budgetPercentVal: document.getElementById("budgetPercentVal"),
    budgetStatusAlert: document.getElementById("budgetStatusAlert"),
    budgetStatusText: document.getElementById("budgetStatusText"),
    finalRecScore: document.getElementById("finalRecScore"),
    finalRecHotel: document.getElementById("finalRecHotel"),
    finalRecTransport: document.getElementById("finalRecTransport"),
    aiRecommendationsList: document.getElementById("aiRecommendationsList")
};

// Wizard State Manager
let wizardCurrentStep = 1;
const wizardTotalSteps = 3;

const isDashboardPage = !!document.getElementById("dashboardSection");

// ==========================================
// Initialization & Navigation
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initApp();
    setupEventListeners();
    if (isDashboardPage) {
        handleLocalStoragePrefills();
    }
});

function injectAndInitAuthModal() {
    const authModal = document.getElementById("authModal");
    if (!authModal) return;

    if (!authModal.querySelector(".modal-card-wrapper")) {
        authModal.innerHTML = `
            <div class="modal-card-wrapper">
                <button id="closeAuthModalBtn" class="close-modal-btn"><i class="fa-solid fa-xmark"></i></button>
                
                <section id="authSection" class="auth-container">
                    <!-- Left quote showcase panel -->
                    <div class="auth-showcase">
                        <div class="showcase-content">
                            <h2>VoyageAI Tours</h2>
                            <p class="showcase-quote">"Travel is the only purchase that enriches you in ways beyond material wealth."</p>
                        </div>
                        <div class="cloud-decoration cloud-1"></div>
                        <div class="cloud-decoration cloud-2"></div>
                    </div>

                    <!-- Right Form Panel -->
                    <div class="auth-card">
                        <div class="auth-body">
                            <!-- Login Form -->
                            <form id="loginForm" class="auth-form active-form">
                                <h2>Welcome</h2>
                                <p class="auth-subtitle">Login with Email</p>
                                
                                <div class="form-group">
                                    <label for="loginUsername">Email Id / Username</label>
                                    <div class="input-with-icon">
                                        <input type="text" id="loginUsername" required placeholder="thisuix@mail.com">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="loginPassword">Password</label>
                                    <div class="input-with-icon">
                                        <input type="password" id="loginPassword" required placeholder="••••••••••••••">
                                        <button type="button" class="password-toggle" onclick="togglePasswordVisibility('loginPassword')">
                                            <i class="fa-regular fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="forgot-pwd-row">
                                    <a href="#" class="forgot-link">Forgot your password?</a>
                                </div>
                                
                                <button type="submit" class="btn btn-primary btn-block btn-blue">
                                    LOGIN
                                </button>
                                
                                <div class="divider-text"><span>OR</span></div>
                                
                                <!-- Social Logins -->
                                <div class="social-login-row">
                                    <button type="button" class="btn-social google" onclick="openOAuthPopup('google')"><i class="fa-brands fa-google"></i></button>
                                    <button type="button" class="btn-social facebook" onclick="openOAuthPopup('facebook')"><i class="fa-brands fa-facebook-f"></i></button>
                                    <button type="button" class="btn-social apple" onclick="openOAuthPopup('apple')"><i class="fa-brands fa-apple"></i></button>
                                </div>

                                <div class="auth-toggle-msg">
                                    Don't have account? <a href="#" id="toggleToSignup">Register Now</a>
                                </div>

                                <div class="auth-error" id="loginError"></div>
                            </form>

                            <!-- Signup Form -->
                            <form id="signupForm" class="auth-form">
                                <h2>Join Us</h2>
                                <p class="auth-subtitle">Create Account</p>
                                
                                <div class="form-group">
                                    <label for="signupUsername">Username</label>
                                    <div class="input-with-icon">
                                        <input type="text" id="signupUsername" required placeholder="Choose a username">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="signupEmail">Email Address</label>
                                    <div class="input-with-icon">
                                        <input type="email" id="signupEmail" required placeholder="you@example.com">
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="signupPassword">Password</label>
                                    <div class="input-with-icon">
                                        <input type="password" id="signupPassword" required placeholder="Create strong password">
                                        <button type="button" class="password-toggle" onclick="togglePasswordVisibility('signupPassword')">
                                            <i class="fa-regular fa-eye"></i>
                                        </button>
                                    </div>
                                </div>
                                
                                <button type="submit" class="btn btn-primary btn-block btn-blue">
                                    REGISTER
                                </button>
                                
                                <div class="auth-toggle-msg">
                                    Already have an account? <a href="#" id="toggleToLogin">Login Now</a>
                                </div>
                                <div class="auth-error" id="signupError"></div>
                                <div class="auth-success" id="signupSuccess"></div>
                            </form>
                        </div>
                        
                        <!-- Landmarks Silhouette Art at bottom -->
                        <div class="landmarks-silhouette">
                            <svg viewBox="0 0 400 60" preserveAspectRatio="none">
                                <path d="M 0 60 L 0 45 L 5 45 L 5 40 L 10 35 L 10 25 L 12 25 L 12 15 L 14 15 L 14 5 L 16 5 L 16 15 L 18 15 L 18 25 L 20 25 L 20 35 L 25 40 L 25 45 L 30 45 L 30 60 M 35 60 L 35 48 L 45 48 L 45 35 L 48 35 L 48 20 L 52 20 L 52 35 L 55 35 L 55 48 L 65 48 L 65 60 M 70 60 L 70 50 L 78 50 L 78 40 L 74 40 L 74 15 L 82 15 L 82 40 L 78 40 L 78 50 L 86 50 L 86 60 M 90 60 L 92 60 L 92 35 L 94 35 L 94 30 L 98 25 L 98 15 L 100 12 L 102 12 L 104 15 L 104 25 L 108 30 L 108 35 L 110 35 L 110 60 M 115 60 L 115 30 L 125 30 L 125 10 L 135 10 L 135 30 L 145 30 L 145 60 M 150 60 L 150 50 L 155 45 L 155 30 L 160 30 L 160 20 L 165 20 L 165 15 L 170 15 L 170 20 L 175 20 L 175 30 L 180 30 L 180 45 L 185 50 L 185 60" stroke="#0ea5e9" stroke-width="1.5" fill="none" opacity="0.3"></path>
                            </svg>
                        </div>
                    </div>
                </section>
            </div>
        `;
    }

    // Now re-cache the modal elements in elements object
    elements.closeAuthModalBtn = document.getElementById("closeAuthModalBtn");
    elements.loginForm = document.getElementById("loginForm");
    elements.signupForm = document.getElementById("signupForm");
    elements.loginUsername = document.getElementById("loginUsername");
    elements.loginPassword = document.getElementById("loginPassword");
    elements.signupUsername = document.getElementById("signupUsername");
    elements.signupEmail = document.getElementById("signupEmail");
    elements.signupPassword = document.getElementById("signupPassword");
    elements.loginError = document.getElementById("loginError");
    elements.signupError = document.getElementById("signupError");
    elements.signupSuccess = document.getElementById("signupSuccess");
    elements.toggleToSignup = document.getElementById("toggleToSignup");
    elements.toggleToLogin = document.getElementById("toggleToLogin");
}

function initApp() {
    // Inject auth modal HTML markup dynamically if #authModal exists
    injectAndInitAuthModal();

    // Check header login status UI
    updateHeaderAuthUI();

    if (isDashboardPage) {
        if (!state.token) {
            location.href = "index.html";
            return;
        }

        // Set min date for wizard form to today
        const today = new Date().toISOString().split("T")[0];
        if (elements.tripDate) {
            elements.tripDate.setAttribute("min", today);
            elements.tripDate.value = today;
        }

        showDashboard();
    } else {
        // We are on index.html, about.html, or trips.html
        setupFamousTripsListeners();
        if (document.querySelector(".hero-slides")) {
            initHeroSlider();
        }
    }
}

// Hero Carousel Slideshow Logic
function initHeroSlider() {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".indicator-dot");
    const titleEl = document.getElementById("heroTitle");
    const subtitleEl = document.getElementById("heroSubtitle");

    if (!slides.length) return;

    const heroSlidesData = [
        {
            title: "EXPLORE THE WORLD WITH US.",
            subtitle: "Leverage collaborative AI agents to build weather-optimized, budget-friendly itineraries in seconds."
        },
        {
            title: "EXPERIENCE MODERN TOKYO.",
            subtitle: "Dive into neon-lit streets, historic temples, and exquisite culinary adventures customized for your style."
        },
        {
            title: "ROMANCE IN PARIS.",
            subtitle: "Stroll along the Seine, explore world-class museums, and enjoy cozy sidewalk cafes curated by AI."
        }
    ];

    let currentSlide = 0;
    let slideInterval = null;

    function startTimer() {
        stopTimer();
        slideInterval = setInterval(nextSlide, 6000);
    }

    function stopTimer() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    }

    function goToSlide(index) {
        if (index < 0 || index >= slides.length) return;

        // Deactivate current slide and dot
        slides[currentSlide].classList.remove("active");
        if (dots[currentSlide]) dots[currentSlide].classList.remove("active");

        currentSlide = index;

        // Activate new slide and dot
        slides[currentSlide].classList.add("active");
        if (dots[currentSlide]) dots[currentSlide].classList.add("active");

        // Fade text out, change contents, fade back in
        if (titleEl && subtitleEl) {
            titleEl.style.opacity = 0;
            subtitleEl.style.opacity = 0;

            setTimeout(() => {
                titleEl.textContent = heroSlidesData[currentSlide].title;
                subtitleEl.textContent = heroSlidesData[currentSlide].subtitle;
                titleEl.style.opacity = 1;
                subtitleEl.style.opacity = 1;
            }, 300);
        }
    }

    function nextSlide() {
        let next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }

    // Set initial transition styles
    if (titleEl && subtitleEl) {
        titleEl.style.transition = "opacity 0.3s ease-in-out";
        subtitleEl.style.transition = "opacity 0.3s ease-in-out";
    }

    // Add click listeners to indicator dots
    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            goToSlide(index);
            startTimer();
        });
    });

    // Start rotation
    startTimer();
}

function updateHeaderAuthUI() {
    if (state.token) {
        if (elements.anonActions) elements.anonActions.style.display = "none";
        if (elements.userProfile) elements.userProfile.style.display = "flex";
        if (elements.navDashLink) elements.navDashLink.style.display = "inline-block";
        if (elements.usernameDisplay) elements.usernameDisplay.textContent = state.username;
    } else {
        if (elements.anonActions) elements.anonActions.style.display = "flex";
        if (elements.userProfile) elements.userProfile.style.display = "none";
        if (elements.navDashLink) elements.navDashLink.style.display = "none";
    }
}

function handleLocalStoragePrefills() {
    const prefillStr = localStorage.getItem("pendingTripPrefill");
    if (prefillStr) {
        try {
            const prefill = JSON.parse(prefillStr);
            triggerPrefilledWizard(prefill.destination, prefill.days, prefill.budget, prefill.vibes);
        } catch (e) {
            console.error("Error loading prefilled wizard states", e);
        }
        localStorage.removeItem("pendingTripPrefill");
    }
}

window.openOAuthPopup = function(provider) {
    const width = 500;
    const height = 600;
    const left = (screen.width - width) / 2;
    const top = (screen.height - height) / 2;
    window.open(
        `oauth-mock.html?provider=${provider}`,
        "OAuthPopup",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );
};

// Listen to message returns from OAuth Popup Choice
window.addEventListener("message", async (event) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data && event.data.type === 'oauth-success') {
        const { provider, email, name } = event.data;
        const username = `${provider}_${name.replace(/\s+/g, "").toLowerCase()}`;
        const password = "mockOAuthPassword123!";
        
        try {
            let response = await fetch(`${API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            
            if (!response.ok) {
                const regResponse = await fetch(`${API_BASE}/auth/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });
                
                if (!regResponse.ok) {
                    const err = await regResponse.json();
                    throw new Error(err.detail || "Mock Social Registration failed");
                }
                
                response = await fetch(`${API_BASE}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });
                
                if (!response.ok) {
                    throw new Error("Mock Social Authentication failed");
                }
            }
            
            const data = await response.json();
            saveAuth(data.token, username);
            hideAuthModal();
            
            if (state.pendingTripPlan) {
                const trip = state.pendingTripPlan;
                state.pendingTripPlan = null;
                if (isDashboardPage) {
                    triggerPrefilledWizard(trip.destination, trip.days, trip.budget, trip.vibes);
                } else {
                    localStorage.setItem("pendingTripPrefill", JSON.stringify(trip));
                    location.href = "dashboard.html";
                }
            } else {
                if (isDashboardPage) {
                    showDashboard();
                } else {
                    location.href = "dashboard.html";
                }
            }
        } catch (err) {
            alert("Social Login failed: " + err.message);
        }
    }
});

function setupEventListeners() {
    // Header navigation login/register buttons to open modal
    if (elements.navLoginBtn) elements.navLoginBtn.addEventListener("click", () => showAuthModal("login"));
    if (elements.navSignupBtn) elements.navSignupBtn.addEventListener("click", () => showAuthModal("signup"));
    
    // Modal close actions
    if (elements.closeAuthModalBtn) elements.closeAuthModalBtn.addEventListener("click", hideAuthModal);
    if (elements.authModal) {
        elements.authModal.addEventListener("click", (e) => {
            if (e.target === elements.authModal) hideAuthModal();
        });
    }

    // Form inside modal toggle links
    if (elements.toggleToSignup) {
        elements.toggleToSignup.addEventListener("click", (e) => {
            e.preventDefault();
            switchAuthTab("signup");
        });
    }
    if (elements.toggleToLogin) {
        elements.toggleToLogin.addEventListener("click", (e) => {
            e.preventDefault();
            switchAuthTab("login");
        });
    }

    // Auth Forms Submit
    if (elements.loginForm) elements.loginForm.addEventListener("submit", handleLogin);
    if (elements.signupForm) elements.signupForm.addEventListener("submit", handleSignup);
    if (elements.logoutBtn) elements.logoutBtn.addEventListener("click", logout);

    // Dashboard Actions
    if (elements.newTripBtn) elements.newTripBtn.addEventListener("click", showWizard);
    if (elements.heroPlanBtn) elements.heroPlanBtn.addEventListener("click", showWizard);
    if (elements.emptyStateBtn) elements.emptyStateBtn.addEventListener("click", showWizard);
    if (elements.backToDashboardBtn) elements.backToDashboardBtn.addEventListener("click", showDashboard);
    if (elements.backToDashFromDetails) elements.backToDashFromDetails.addEventListener("click", showDashboard);

    // Landing Hero Actions
    if (elements.heroExploreBtn) {
        elements.heroExploreBtn.addEventListener("click", () => {
            if (state.token) {
                if (isDashboardPage) {
                    showWizard();
                } else {
                    location.href = "dashboard.html";
                }
            } else {
                showAuthModal("signup");
            }
        });
    }
    if (elements.heroDemoBtn) {
        elements.heroDemoBtn.addEventListener("click", () => {
            alert("VoyageAI Tours presentation video loading... (Demonstration only)");
        });
    }

    // Filter Trips Search Input
    if (elements.tripSearchInput) {
        elements.tripSearchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase().trim();
            const cards = elements.tripsList.querySelectorAll(".trip-card");
            cards.forEach(card => {
                const dest = card.querySelector(".trip-dest").textContent.toLowerCase();
                if (dest.includes(query)) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // Form Wizard Step Navigation
    if (elements.nextStepBtn) elements.nextStepBtn.addEventListener("click", navigateWizardNext);
    if (elements.prevStepBtn) elements.prevStepBtn.addEventListener("click", navigateWizardPrev);

    // Form Wizard Chips
    if (elements.preferencesChips) {
        elements.preferencesChips.addEventListener("click", (e) => {
            if (e.target.classList.contains("chip")) {
                e.target.classList.toggle("selected");
            }
        });
    }

    // Trip Wizard Submit
    if (elements.tripForm) elements.tripForm.addEventListener("submit", handleCreateTrip);

    // Details Tabs Toggle
    if (elements.detailsTabs) {
        elements.detailsTabs.forEach(tab => {
            tab.addEventListener("click", () => {
                elements.detailsTabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");

                const contentId = tab.dataset.content;
                if (elements.tabContents) {
                    elements.tabContents.forEach(content => {
                        if (content.id === contentId) {
                            content.classList.add("active-content");
                        } else {
                            content.classList.remove("active-content");
                        }
                    });
                }

                if (contentId === "budgetTab") {
                    setTimeout(animateBudgetVisuals, 100);
                }
            });
        });
    }

    // Itinerary Accordion Expand/Collapse All controls
    if (elements.expandAllDays) {
        elements.expandAllDays.addEventListener("click", () => {
            document.querySelectorAll(".day-section").forEach(sec => sec.classList.add("expanded"));
        });
    }
    if (elements.collapseAllDays) {
        elements.collapseAllDays.addEventListener("click", () => {
            document.querySelectorAll(".day-section").forEach(sec => sec.classList.remove("expanded"));
        });
    }
}

// Prefill Famous Trip Planning logic
function setupFamousTripsListeners() {
    const planButtons = document.querySelectorAll(".famous-plan-btn");
    planButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const destination = btn.dataset.destination;
            const days = btn.dataset.days;
            const budget = btn.dataset.budget;
            const vibes = btn.dataset.vibes ? btn.dataset.vibes.split(",") : [];

            if (state.token) {
                if (isDashboardPage) {
                    triggerPrefilledWizard(destination, days, budget, vibes);
                } else {
                    localStorage.setItem("pendingTripPrefill", JSON.stringify({ destination, days, budget, vibes }));
                    location.href = "dashboard.html";
                }
            } else {
                state.pendingTripPlan = { destination, days, budget, vibes };
                showAuthModal("login");
                alert("Please log in or sign up first to plan this trip!");
            }
        });
    });
}

function triggerPrefilledWizard(dest, days, budget, vibes) {
    showWizard();
    if (elements.tripDestination) elements.tripDestination.value = dest;
    if (elements.tripDays) elements.tripDays.value = days;
    if (elements.tripBudget) elements.tripBudget.value = budget;

    // Reset preferences chips selection
    if (elements.preferencesChips) {
        elements.preferencesChips.querySelectorAll(".chip").forEach(chip => {
            chip.classList.remove("selected");
            if (vibes.includes(chip.dataset.val)) {
                chip.classList.add("selected");
            }
        });
    }
}

// Global section routing helper
window.navigateToSection = function(sectionId) {
    if (!elements.landingNav) return;
    const links = elements.landingNav.querySelectorAll(".nav-link");
    links.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sectionId}`) {
            link.classList.add("active");
        }
    });

    // Toggle views
    if (elements.dashboardSection) elements.dashboardSection.style.display = "none";
    if (elements.wizardSection) elements.wizardSection.style.display = "none";
    if (elements.detailsSection) elements.detailsSection.style.display = "none";
    if (elements.landingSection) elements.landingSection.style.display = "flex";

    // Scroll smoothly to target section
    if (sectionId === "home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (sectionId === "about") {
        const aboutEl = document.getElementById("aboutSection");
        if (aboutEl) aboutEl.scrollIntoView({ behavior: "smooth" });
    } else if (sectionId === "trips") {
        const tripsEl = document.getElementById("tripsSection");
        if (tripsEl) tripsEl.scrollIntoView({ behavior: "smooth" });
    }
};

// Modal handlers
function showAuthModal(tab = "login") {
    elements.authModal.style.display = "flex";
    switchAuthTab(tab);
}

function hideAuthModal() {
    elements.authModal.style.display = "none";
    state.pendingTripPlan = null; // Clear if modal dismissed
}

function switchAuthTab(tab) {
    if (tab === "login") {
        elements.loginForm.classList.add("active-form");
        elements.signupForm.classList.remove("active-form");
        elements.loginError.textContent = "";
    } else {
        elements.loginForm.classList.remove("active-form");
        elements.signupForm.classList.add("active-form");
        elements.signupError.textContent = "";
        elements.signupSuccess.textContent = "";
    }
}

// Password toggle helper (accessible globally)
window.togglePasswordVisibility = function(id) {
    const input = document.getElementById(id);
    const btnIcon = input.nextElementSibling.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        btnIcon.className = 'fa-regular fa-eye-slash';
    } else {
        input.type = 'password';
        btnIcon.className = 'fa-regular fa-eye';
    }
};

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
        
        hideAuthModal();
        
        // Check if there was a pending trip card selected
        if (state.pendingTripPlan) {
            const trip = state.pendingTripPlan;
            state.pendingTripPlan = null;
            if (isDashboardPage) {
                triggerPrefilledWizard(trip.destination, trip.days, trip.budget, trip.vibes);
            } else {
                localStorage.setItem("pendingTripPrefill", JSON.stringify(trip));
                location.href = "dashboard.html";
            }
        } else {
            if (isDashboardPage) {
                showDashboard();
            } else {
                location.href = "dashboard.html";
            }
        }
        
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

        elements.signupSuccess.textContent = "Account created successfully! Logging in...";
        
        // Auto login on register success
        setTimeout(async () => {
            try {
                const loginRes = await fetch(`${API_BASE}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });
                if (loginRes.ok) {
                    const loginData = await loginRes.json();
                    saveAuth(loginData.token, username);
                    hideAuthModal();
                    
                    if (state.pendingTripPlan) {
                        const trip = state.pendingTripPlan;
                        state.pendingTripPlan = null;
                        if (isDashboardPage) {
                            triggerPrefilledWizard(trip.destination, trip.days, trip.budget, trip.vibes);
                        } else {
                            localStorage.setItem("pendingTripPrefill", JSON.stringify(trip));
                            location.href = "dashboard.html";
                        }
                    } else {
                        if (isDashboardPage) {
                            showDashboard();
                        } else {
                            location.href = "dashboard.html";
                        }
                    }
                }
            } catch (err) {
                switchAuthTab("login");
            }
        }, 1200);
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
    
    if (isDashboardPage) {
        location.href = "index.html";
    } else {
        updateHeaderAuthUI();
    }
}

// ==========================================
// UI View State Swaps
// ==========================================
function showLandingPage() {
    hideAllSections();
    if (elements.anonActions) elements.anonActions.style.display = "flex";
    if (elements.userProfile) elements.userProfile.style.display = "none";
    if (elements.navDashLink) elements.navDashLink.style.display = "none";
    if (elements.landingSection) elements.landingSection.style.display = "flex";
    
    // Reset active nav tab to HOME
    if (elements.landingNav) {
        elements.landingNav.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        const homeNav = elements.landingNav.querySelector('[href="#home"]');
        if (homeNav) homeNav.classList.add("active");
    }
    window.scrollTo({ top: 0, behavior: "instant" });
}

async function showDashboard() {
    hideAllSections();
    if (elements.anonActions) elements.anonActions.style.display = "none";
    if (elements.userProfile) elements.userProfile.style.display = "flex";
    if (elements.navDashLink) elements.navDashLink.style.display = "inline-block";
    if (elements.usernameDisplay) elements.usernameDisplay.textContent = state.username;
    if (elements.dashboardSection) elements.dashboardSection.style.display = "block";
    
    // Highlight dashboard link in nav
    if (elements.landingNav) {
        elements.landingNav.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        if (elements.navDashLink) elements.navDashLink.classList.add("active");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    if (elements.tripSearchInput) elements.tripSearchInput.value = "";
    await loadTripsList();
}

function showWizard() {
    hideAllSections();
    if (elements.anonActions) elements.anonActions.style.display = "none";
    if (elements.userProfile) elements.userProfile.style.display = "flex";
    if (elements.navDashLink) elements.navDashLink.style.display = "inline-block";
    if (elements.wizardSection) elements.wizardSection.style.display = "block";
    if (elements.tripForm) elements.tripForm.reset();
    
    if (elements.preferencesChips) {
        elements.preferencesChips.querySelectorAll(".chip").forEach(chip => {
            chip.classList.remove("selected");
        });
    }

    wizardCurrentStep = 1;
    updateWizardUI();
}

function hideAllSections() {
    if (elements.landingSection) elements.landingSection.style.display = "none";
    if (elements.dashboardSection) elements.dashboardSection.style.display = "none";
    if (elements.wizardSection) elements.wizardSection.style.display = "none";
    if (elements.detailsSection) elements.detailsSection.style.display = "none";
    if (elements.loadingSection) elements.loadingSection.style.display = "none";
}

// Multi-step Wizard Navigation
function updateWizardUI() {
    document.querySelectorAll(".wizard-step").forEach(step => {
        step.classList.remove("active-step");
        if (parseInt(step.dataset.step, 10) === wizardCurrentStep) {
            step.classList.add("active-step");
        }
    });

    document.querySelectorAll(".wizard-stepper .step-node").forEach(node => {
        const stepNum = parseInt(node.dataset.step, 10);
        node.classList.remove("active", "complete");
        
        if (stepNum === wizardCurrentStep) {
            node.classList.add("active");
        } else if (stepNum < wizardCurrentStep) {
            node.classList.add("complete");
        }
    });

    const progressPercent = ((wizardCurrentStep - 1) / (wizardTotalSteps - 1)) * 100;
    elements.wizardProgressFill.style.width = `${progressPercent}%`;

    if (wizardCurrentStep === 1) {
        elements.prevStepBtn.style.display = "none";
    } else {
        elements.prevStepBtn.style.display = "inline-flex";
    }

    if (wizardCurrentStep === wizardTotalSteps) {
        elements.nextStepBtn.style.display = "none";
        elements.submitTripBtn.style.display = "inline-flex";
    } else {
        elements.nextStepBtn.style.display = "inline-flex";
        elements.submitTripBtn.style.display = "none";
    }
}

function validateWizardStep(stepNum) {
    if (stepNum === 1) {
        if (!elements.tripSource.value.trim() || !elements.tripDestination.value.trim() || !elements.tripDate.value || !elements.tripDays.value) {
            alert("Please fill in all routing and schedule fields.");
            return false;
        }
        if (parseInt(elements.tripDays.value, 10) <= 0 || parseInt(elements.tripDays.value, 10) > 30) {
            alert("Duration must be between 1 and 30 days.");
            return false;
        }
    } else if (stepNum === 2) {
        if (!elements.tripBudget.value || parseFloat(elements.tripBudget.value) < 1000) {
            alert("Please provide a valid budget (minimum ₹1,000).");
            return false;
        }
    }
    return true;
}

function navigateWizardNext() {
    if (validateWizardStep(wizardCurrentStep)) {
        if (wizardCurrentStep < wizardTotalSteps) {
            wizardCurrentStep++;
            updateWizardUI();
        }
    }
}

function navigateWizardPrev() {
    if (wizardCurrentStep > 1) {
        wizardCurrentStep--;
        updateWizardUI();
    }
}

// ==========================================
// Dashboard Data Loading & Stats Update
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
        updateDashboardStats(state.trips);

        if (state.trips.length === 0) {
            elements.emptyState.style.display = "flex";
            return;
        }

        state.trips.forEach(trip => {
            const card = document.createElement("div");
            card.className = "trip-card glass-panel";
            card.addEventListener("click", () => loadTripDetails(trip.trip_id));
            
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
        elements.tripsList.innerHTML = `<p class="auth-error" style="grid-column: span 3;">Error loading dashboard: ${err.message}</p>`;
    }
}

function updateDashboardStats(trips) {
    if (elements.statTotalTrips) {
        elements.statTotalTrips.textContent = trips.length;
    }
    if (elements.statSpentBudget) {
        const totalBudget = trips.reduce((sum, trip) => sum + parseFloat(trip.budget || 0), 0);
        elements.statSpentBudget.textContent = `₹${totalBudget.toLocaleString()}`;
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
        
        await loadTripsList();
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
    
    elements.loadingTitle.textContent = "Retrieving Swarm Data...";
    elements.loadingDescription.textContent = "Accessing database vault to retrieve collaborative sub-agent summaries.";
    resetAgentLoaderSteps();
    clearTerminalLogs();

    const animInterval = runSimulatedTerminalLogs(true);

    try {
        const response = await fetch(`${API_BASE}/trip/${tripId}`, {
            headers: { "Authorization": `Bearer ${state.token}` }
        });

        clearInterval(animInterval);

        if (!response.ok) throw new Error("Could not fetch trip plan details");

        const tripPlan = await response.json();
        state.activeTrip = tripPlan;
        
        setAllStepsComplete();
        appendTerminalLog("success", "[SYSTEM] Swarm data retrieved successfully. Entering details view.");
        
        setTimeout(() => {
            renderTripPlan(tripPlan);
        }, 500);
    } catch (err) {
        clearInterval(animInterval);
        elements.loadingSection.style.display = "none";
        alert(err.message);
        showDashboard();
    }
}

function renderTripPlan(plan) {
    hideAllSections();
    elements.detailsSection.style.display = "block";
    
    // Set ticket attributes
    if (document.getElementById("detailsTripId")) {
        document.getElementById("detailsTripId").textContent = `#${plan.trip_id.slice(-4)}`;
    }
    if (document.getElementById("detailsSourceCity")) {
        document.getElementById("detailsSourceCity").textContent = plan.source;
        document.getElementById("detailsSourceCode").textContent = plan.source.substring(0, 3).toUpperCase();
    }
    if (document.getElementById("detailsDestCode")) {
        document.getElementById("detailsDestCode").textContent = plan.destination.substring(0, 3).toUpperCase();
    }
    elements.detailsDestTitle.textContent = plan.destination;
    elements.detailsMetaSubtitle.innerHTML = `
        <i class="fa-solid fa-route"></i> From ${plan.source} &nbsp;&bull;&nbsp; 
        <i class="fa-solid fa-calendar-days"></i> ${plan.travel_date} &nbsp;&bull;&nbsp;
        <i class="fa-solid fa-clock"></i> ${plan.days} Days &nbsp;&bull;&nbsp;
        <i class="fa-solid fa-indian-rupee-sign"></i> Budget Limit: ₹${Number(plan.budget).toLocaleString()}
    `;

    // Render Highlights tags
    elements.destinationHighlights.innerHTML = "";
    if (plan.destination_highlights && plan.destination_highlights.length > 0) {
        plan.destination_highlights.forEach(hl => {
            const span = document.createElement("span");
            span.className = "highlight-tag";
            span.textContent = hl;
            elements.destinationHighlights.appendChild(span);
        });
    }

    elements.detailsTabs[0].click();

    // 1. ITINERARY TIMELINE
    elements.itineraryTimeline.innerHTML = "";
    plan.itinerary.forEach((day, index) => {
        const section = document.createElement("div");
        section.className = "day-section";
        if (index === 0) section.classList.add("expanded");
        
        section.innerHTML = `
            <div class="day-marker">${day.day}</div>
            <div class="day-content-card glass-panel">
                <div class="day-header" onclick="this.parentElement.parentElement.classList.toggle('expanded')">
                    <h4><i class="fa-solid fa-plane"></i> Day ${day.day} Itinerary</h4>
                    <span class="day-cost">Est. Spend: ₹${Number(day.estimated_spend).toLocaleString()}</span>
                    <i class="fa-solid fa-chevron-down accordion-icon"></i>
                </div>
                <div class="time-slots-wrapper">
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
            </div>
        `;
        elements.itineraryTimeline.appendChild(section);
    });

    // 2. STAYS & TRANSPORT
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
                    <span class="hotel-location-link"><i class="fa-solid fa-map-pin"></i> ${hotel.location}</span>
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
        
        // Open location on Google Maps when card is clicked
        card.addEventListener("click", () => {
            const query = encodeURIComponent(`${hotel.name}, ${hotel.location}`);
            window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
        });

        elements.hotelList.appendChild(card);
    });

    // Recommended Transport Box
    const tRec = plan.transport;
    const cheapestFlight = (tRec.available_options && tRec.available_options.length > 0)
        ? (tRec.available_options.find(opt => opt.cost === tRec.recommended_cost) || tRec.available_options[0])
        : null;

    const recommendedProvider = cheapestFlight ? cheapestFlight.provider : "Flight";
    const recommendedDep = cheapestFlight ? cheapestFlight.departure_time : "N/A";
    const recommendedDur = cheapestFlight ? cheapestFlight.duration : "N/A";

    elements.recommendedTransport.innerHTML = `
        <span class="rec-title-badge"><i class="fa-solid fa-thumbs-up"></i> Swarm Selection</span>
        <div class="trans-main-row">
            <div class="trans-mode"><i class="fa-solid fa-plane"></i> ${recommendedProvider}</div>
            <div class="trans-cost">₹${Number(tRec.recommended_cost).toLocaleString()}</div>
        </div>
        <div class="trans-details">
            <div><strong>Departure:</strong> ${recommendedDep}</div>
            <div><strong>Duration:</strong> ${recommendedDur}</div>
        </div>
        <div class="trans-reason">
            "${tRec.reason}"
        </div>
    `;

    // Render Alternative Flights
    elements.altTransportList.innerHTML = "";
    if (tRec.available_options && tRec.available_options.length > 0) {
        tRec.available_options.forEach(opt => {
            const isCheapest = (cheapestFlight && opt.cost === cheapestFlight.cost && opt.provider === cheapestFlight.provider && opt.departure_time === cheapestFlight.departure_time);
            
            const item = document.createElement("div");
            item.className = "alt-trans-item";
            
            if (isCheapest) {
                item.style.borderColor = "var(--success)";
                item.style.background = "var(--success-light)";
            }

            const badgeHtml = isCheapest 
                ? `<span class="rec-title-badge" style="margin: 0 0 0 10px; padding: 2px 8px; font-size: 0.65rem;"><i class="fa-solid fa-star"></i> Cheapest</span>` 
                : "";

            item.innerHTML = `
                <div class="alt-trans-mode">
                    <i class="fa-solid fa-plane"></i> ${opt.provider || opt.mode} ${badgeHtml}
                </div>
                <div>
                    <span style="color: var(--text-secondary); margin-right: 15px; font-size: 0.8rem;">Dep: ${opt.departure_time || '12:00'} (${opt.duration})</span>
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

    // 4. BUDGET ANALYSIS
    elements.budgetTotalVal.textContent = `₹${Number(plan.budget).toLocaleString()}`;
    elements.budgetSpentVal.textContent = `₹${Number(plan.budget_analysis.total_spent).toLocaleString()}`;
    
    const remaining = plan.budget_analysis.remaining_budget;
    elements.budgetRemainingVal.textContent = `₹${Number(remaining).toLocaleString()}`;
    
    if (remaining < 0) {
        elements.budgetRemainingVal.className = "stat-value text-danger";
        elements.budgetStatusAlert.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
        elements.budgetStatusAlert.style.color = "var(--danger)";
        elements.budgetStatusAlert.style.borderColor = "rgba(239, 68, 68, 0.18)";
        elements.budgetStatusAlert.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> Over budget limit! Plan exceeds limit by ₹${Math.abs(remaining).toLocaleString()}.`;
    } else {
        elements.budgetRemainingVal.className = "stat-value text-success";
        elements.budgetStatusAlert.style.backgroundColor = "var(--success-light)";
        elements.budgetStatusAlert.style.color = "var(--success)";
        elements.budgetStatusAlert.style.borderColor = "rgba(16, 185, 129, 0.15)";
        elements.budgetStatusAlert.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Under Budget! Preserved reserve buffer of ₹${remaining.toLocaleString()}.</span>`;
    }

    // Budget Bars Rendering
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
                <div class="bar-fill" data-width="${percentage}%" style="width: 0%;"></div>
            </div>
        `;
        elements.budgetBars.appendChild(barItem);
    }

    // Final recommendation summary
    elements.finalRecScore.textContent = plan.final_recommendation.overall_score.toFixed(1);
    elements.finalRecHotel.textContent = plan.final_recommendation.hotel;
    elements.finalRecTransport.textContent = plan.final_recommendation.transport;

    // AI Tips list rendered with Agent Avatars
    elements.aiRecommendationsList.innerHTML = "";
    plan.ai_recommendations.forEach(tip => {
        const item = document.createElement("div");
        item.className = "ai-tip-item";
        
        let agentName = "Swarm Coordinator";
        let avatarIcon = "fa-network-wired";
        
        const tipLower = tip.toLowerCase();
        if (tipLower.includes("weather") || tipLower.includes("rain") || tipLower.includes("temperature")) {
            agentName = "Weather Agent";
            avatarIcon = "fa-cloud-sun";
        } else if (tipLower.includes("budget") || tipLower.includes("save") || tipLower.includes("cost") || tipLower.includes("expensive")) {
            agentName = "Budget Agent";
            avatarIcon = "fa-chart-pie";
        } else if (tipLower.includes("hotel") || tipLower.includes("stay") || tipLower.includes("resort")) {
            agentName = "Hotel Agent";
            avatarIcon = "fa-hotel";
        } else if (tipLower.includes("transit") || tipLower.includes("flight") || tipLower.includes("train")) {
            agentName = "Transit Agent";
            avatarIcon = "fa-plane-departure";
        }

        if (tipLower.includes("could not be loaded") || tipLower.includes("failed")) {
            item.style.borderColor = "var(--danger)";
            item.innerHTML = `<i class="fa-solid fa-circle-exclamation" style="color: var(--danger);"></i> <div><strong>System Warning:</strong> ${tip}</div>`;
        } else {
            item.innerHTML = `<i class="fa-solid ${avatarIcon}"></i> <div><strong>${agentName}:</strong> ${tip}</div>`;
        }
        elements.aiRecommendationsList.appendChild(item);
    });
}

function animateBudgetVisuals() {
    if (!state.activeTrip) return;
    
    // 1. Animate circular gauge ring
    const total = state.activeTrip.budget || 1;
    const spent = state.activeTrip.budget_analysis.total_spent || 0;
    const percentage = Math.min(Math.round((spent / total) * 100), 100);
    
    const offset = 314 - (314 * percentage / 100);
    
    if (elements.budgetRingFill) {
        elements.budgetRingFill.style.strokeDashoffset = offset;
    }
    if (elements.budgetPercentVal) {
        elements.budgetPercentVal.textContent = `${percentage}%`;
    }

    // 2. Animate budget breakdown bars
    document.querySelectorAll(".budget-bar-item .bar-fill").forEach(bar => {
        const targetWidth = bar.getAttribute("data-width");
        setTimeout(() => {
            bar.style.width = targetWidth;
        }, 150);
    });
}

// ==========================================
// Trip Wizard Plan Creation
// ==========================================
async function handleCreateTrip(e) {
    e.preventDefault();

    const source = elements.tripSource.value.trim();
    const destination = elements.tripDestination.value.trim();
    const rawDate = elements.tripDate.value; 
    const days = parseInt(elements.tripDays.value, 10);
    const budget = parseFloat(elements.tripBudget.value);
    const requirements = elements.tripRequirements.value.trim();

    // Convert date YYYY-MM-DD -> DD-MM-YYYY
    const dateParts = rawDate.split("-");
    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

    // Collect preferences chips
    const preferences = [];
    elements.preferencesChips.querySelectorAll(".chip.selected").forEach(chip => {
        preferences.push(chip.dataset.val);
    });

    hideAllSections();
    elements.loadingSection.style.display = "flex";
    
    elements.loadingTitle.textContent = "Deploying Swarm Coordinator...";
    elements.loadingDescription.textContent = "Establishing secure agent threads. Submitting requirements payload.";
    
    resetAgentLoaderSteps();
    clearTerminalLogs();

    const logsInterval = runSimulatedTerminalLogs(false);

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

        clearInterval(logsInterval);

        if (response.status === 401) {
            logout();
            return;
        }

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Multi-Agent planner failed to generate itinerary.");
        }

        const plan = await response.json();
        
        setAllStepsComplete();
        appendTerminalLog("success", "[SYSTEM] Swarm plan compilation verified. Redirecting...");
        
        setTimeout(() => {
            renderTripPlan(plan);
        }, 500);
    } catch (err) {
        clearInterval(logsInterval);
        elements.loadingSection.style.display = "none";
        alert(err.message);
        showWizard();
    }
}

// ==========================================
// Loading Overlay Swarm Simulator
// ==========================================
const stepConfigs = [
    { id: "step-coord", label: "Coordinator", order: 0 },
    { id: "step-dest", label: "Destination", order: 1 },
    { id: "step-weather", label: "Weather", order: 2 },
    { id: "step-hotel", label: "Hotels", order: 3 },
    { id: "step-transport", label: "Transport", order: 4 },
    { id: "step-budget", label: "Budget", order: 5 },
    { id: "step-llm", label: "LLM Expert", order: 6 }
];

function resetAgentLoaderSteps() {
    stepConfigs.forEach(step => {
        const el = document.getElementById(step.id);
        if (el) {
            el.className = "agent-step-node";
            el.querySelector(".step-icon").innerHTML = `<i class="fa-solid fa-circle-minus"></i>`;
        }
    });
}

function setAllStepsComplete() {
    stepConfigs.forEach(step => {
        const el = document.getElementById(step.id);
        if (el) {
            el.className = "agent-step-node complete";
            el.querySelector(".step-icon").innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
        }
    });
}

function clearTerminalLogs() {
    elements.terminalLogs.innerHTML = "";
}

function appendTerminalLog(type, text) {
    const entry = document.createElement("p");
    entry.className = `log-entry ${type}`;
    
    const now = new Date();
    const timeStr = `[${now.toTimeString().split(' ')[0]}.${String(now.getMilliseconds()).padStart(3, '0')}]`;
    
    entry.textContent = `${timeStr} ${text}`;
    elements.terminalLogs.appendChild(entry);
    
    elements.terminalLogs.scrollTop = elements.terminalLogs.scrollHeight;
}

const simulatedLogSequence = [
    { step: 0, type: "system", text: "Initializing agent stack orchestration threads..." },
    { step: 0, type: "agent-coordinator", text: "[Coordinator] Launching task pipeline context." },
    { step: 0, type: "agent-coordinator", text: "[Coordinator] Submitting configurations payload." },
    { step: 1, type: "agent-dest", text: "[DestinationAgent] Fetching local tourism registers and landmarks..." },
    { step: 1, type: "agent-dest", text: "[DestinationAgent] Tagging beach/cultural venues matching preference parameters." },
    { step: 2, type: "agent-weather", text: "[WeatherAgent] Establishing satellite socket with global database..." },
    { step: 2, type: "agent-weather", text: "[WeatherAgent] Fetching day-by-day forecast coordinates. Rain limits analyzed." },
    { step: 3, type: "agent-hotel", text: "[HotelAgent] Querying active local accommodations matching cost budget..." },
    { step: 3, type: "agent-hotel", text: "[HotelAgent] Retreived 3 candidate resorts. Sourcing real ratings." },
    { step: 4, type: "agent-transport", text: "[TransportAgent] Querying available flight coordinates and arrival estimates..." },
    { step: 4, type: "agent-transport", text: "[TransportAgent] Running price-to-duration algorithms for optimal speed." },
    { step: 5, type: "agent-budget", text: "[BudgetAgent] Running category allocation audit [Hotel, Travel, Dining]..." },
    { step: 5, type: "agent-budget", text: "[BudgetAgent] Recalculating allocations. Optimization fits within budget limits." },
    { step: 6, type: "agent-coordinator", text: "[Coordinator] Compiling structured parameters. Discarding poor choices." },
    { step: 6, type: "system", text: "Invoking Groq LLM recommender engine..." }
];

function runSimulatedTerminalLogs(isDetailsRetrieveOnly = false) {
    let logIndex = 0;
    const intervalMs = isDetailsRetrieveOnly ? 250 : 800;
    
    const firstStepNode = document.getElementById(stepConfigs[0].id);
    if (firstStepNode) {
        firstStepNode.className = "agent-step-node active";
        firstStepNode.querySelector(".step-icon").innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
    }

    appendTerminalLog("system", "[SYSTEM] Establishing secure socket layer with agent swarm core...");

    const interval = setInterval(() => {
        if (logIndex < simulatedLogSequence.length) {
            const currentLog = simulatedLogSequence[logIndex];
            
            appendTerminalLog(currentLog.type, currentLog.text);
            
            const activeStep = stepConfigs[currentLog.step];
            const nodeEl = document.getElementById(activeStep.id);
            if (nodeEl && !nodeEl.classList.contains("complete")) {
                if (currentLog.step > 0) {
                    const prevStep = stepConfigs[currentLog.step - 1];
                    const prevNode = document.getElementById(prevStep.id);
                    if (prevNode) {
                        prevNode.className = "agent-step-node complete";
                        prevNode.querySelector(".step-icon").innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
                    }
                }
                
                nodeEl.className = "agent-step-node active";
                nodeEl.querySelector(".step-icon").innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i>`;
                elements.loadingDescription.textContent = `Active Thread: ${activeStep.label} Agent processing...`;
            }

            logIndex++;
        } else {
            clearInterval(interval);
        }
    }, intervalMs);

    return interval;
}

// ==========================================
// Formatting Helpers
// ==========================================
function capitalizeFirstLetter(string) {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1);
}
