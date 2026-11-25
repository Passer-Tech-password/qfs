const res = await fetch("https://www.qfstier-4bwallet.com/api/auth/username-login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ identifier: "testuser123", password: "wrongpass1" }),
});
console.log("STATUS=" + res.status);
console.log("BODY=" + await res.text());
