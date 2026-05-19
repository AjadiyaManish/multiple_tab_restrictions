/** @odoo-module **/

(function () {
    const KEY = "odoo_single_tab_lock";
    const TAB_ID_KEY = "odoo_current_tab_id";
    const DIALOG_SHOWN_KEY = "odoo_dialog_shown_key";

    // Generate unique ID for this tab
    const currentTabId = Math.random().toString(36).substr(2, 9) + "_" + Date.now();
    sessionStorage.setItem(TAB_ID_KEY, currentTabId);

    let isThisTabActive = false;
    let lastHeartbeatValue = null;

    function removeExistingDialog() {
        const existingOverlay = document.getElementById("odoo_multiple_tab_overlay");
        if (existingOverlay) {
            existingOverlay.remove();
        }
    }

    function createPopup() {
        // Remove any existing dialog first
        removeExistingDialog();

        // Ensure body exists, wait if needed
        if (!document.body) {
            document.addEventListener("DOMContentLoaded", createPopup);
            return;
        }

        const overlay = document.createElement("div");
        overlay.id = "odoo_multiple_tab_overlay";
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100%";
        overlay.style.height = "100%";
        overlay.style.background = "rgba(0,0,0,0.6)";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.zIndex = "9999";

        const box = document.createElement("div");
        box.style.background = "#fff";
        box.style.padding = "30px";
        box.style.borderRadius = "10px";
        box.style.textAlign = "center";
        box.style.fontFamily = "Arial, sans-serif";
        box.style.maxWidth = "400px";
        box.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";

        const title = document.createElement("h2");
        title.innerText = "Multiple Tab Detected";
        title.style.margin = "0 0 15px 0";
        title.style.color = "#333";
        title.style.fontSize = "18px";

        const msg = document.createElement("p");
        msg.innerText = "Only one Odoo tab can be open at a time. Please use the existing tab.";
        msg.style.margin = "0 0 20px 0";
        msg.style.color = "#666";
        msg.style.fontSize = "14px";
        msg.style.lineHeight = "1.6";

        const btn = document.createElement("button");
        btn.innerText = "Close This Tab";
        btn.style.padding = "10px 20px";
        btn.style.cursor = "pointer";
        btn.style.backgroundColor = "#dc3545";
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.borderRadius = "5px";
        btn.style.fontSize = "14px";
        btn.style.fontWeight = "bold";
        btn.style.transition = "background-color 0.2s";

        btn.onmouseover = function () {
            btn.style.backgroundColor = "#c82333";
        };
        btn.onmouseout = function () {
            btn.style.backgroundColor = "#dc3545";
        };

        btn.onclick = function () {
            // Disable the button during redirect
            btn.disabled = true;
            btn.innerText = "Redirecting...";

            // Redirect to login page (neutralizes the unauthorized tab)
            setTimeout(function() {
                window.location.href = "/web/login";
            }, 300);
        };

        box.appendChild(title);
        box.appendChild(msg);
        box.appendChild(btn);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    }

    function isAnotherTabActive() {
        const existingTabData = localStorage.getItem(KEY);

        if (!existingTabData) {
            return false;
        }

        try {
            const data = JSON.parse(existingTabData);
            const currentTime = Date.now();
            const timeSinceHeartbeat = currentTime - data.heartbeat;

            // If heartbeat is recent (within 5 seconds) AND it's not this tab, another tab is active
            // Increased grace period from 3s to 5s to handle slower systems and reloads
            if (timeSinceHeartbeat < 5000 && data.tabId !== currentTabId) {
                return true;
            }
        } catch (e) {
            console.log("Error checking multiple tabs:", e);
        }

        return false;
    }

    function checkAndShowDialogIfNeeded() {
        if (!isThisTabActive && isAnotherTabActive()) {
            createPopup();
        }
    }

    function checkAndRegisterTab() {
        if (isAnotherTabActive()) {
            // Another tab is already active - show dialog and don't register this tab
            createPopup();
            isThisTabActive = false;
            // Still do heartbeat check but from another tab's perspective
            startDialogMonitoring();
        } else {
            // This tab can be active - register it
            registerTab();
            isThisTabActive = true;
        }
    }

    function registerTab() {
        const tabData = {
            tabId: currentTabId,
            heartbeat: Date.now()
        };
        localStorage.setItem(KEY, JSON.stringify(tabData));
        lastHeartbeatValue = tabData.heartbeat;

        // Send heartbeat every 500ms to keep the lock alive
        setInterval(function () {
            if (isThisTabActive) {
                const currentData = localStorage.getItem(KEY);
                if (currentData) {
                    try {
                        const data = JSON.parse(currentData);
                        // Only update if this tab still owns the lock
                        if (data.tabId === currentTabId) {
                            data.heartbeat = Date.now();
                            lastHeartbeatValue = data.heartbeat;
                            localStorage.setItem(KEY, JSON.stringify(data));
                        } else {
                            // Another tab took over, stop being active
                            isThisTabActive = false;
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }
            }
        }, 500);
    }

    function startDialogMonitoring() {
        // For non-active tabs, continuously check if they should show dialog
        setInterval(function () {
            checkAndShowDialogIfNeeded();
        }, 800);
    }

    function onStorageChange(event) {
        // When localStorage changes (heartbeat from another tab), immediately re-check
        if (event.key === KEY) {
            // Small delay to ensure data is synced across tabs
            setTimeout(function () {
                if (!isThisTabActive) {
                    checkAndShowDialogIfNeeded();
                }
            }, 50);
        }
    }

    // Listen for storage events from other tabs
    window.addEventListener("storage", onStorageChange);

    // Initial check after small delay
    setTimeout(checkAndRegisterTab, 150);

    // Regular check every 1.5 seconds as fallback (in case storage events fail)
    setInterval(function () {
        if (!isThisTabActive && isAnotherTabActive()) {
            // If we should be showing dialog but aren't, create it
            if (!document.getElementById("odoo_multiple_tab_overlay")) {
                checkAndShowDialogIfNeeded();
            }
        }
    }, 1500);

    // Cleanup on tab close
    window.addEventListener("beforeunload", function () {
        localStorage.removeItem(KEY);
    });

})();