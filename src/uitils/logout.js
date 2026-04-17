// ─── Logout utility — استخدمها في أي مكان بتعمل فيه logout ──────────────────
// utils/logout.js

export const logout = (router) => {
  // 1. Clear user data
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  // 2. Dispatch event so RouteProtection knows
  window.dispatchEvent(new Event("user-logout"));

  // 3. Replace ALL history with login page
  //    This is the key — back button can't go to /account anymore
  window.location.replace("/login");
};
