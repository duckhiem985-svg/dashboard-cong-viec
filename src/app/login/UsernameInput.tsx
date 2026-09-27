"use client";

import { useState } from "react";

export function UsernameInput() {
  const [value, setValue] = useState("");

  return (
    <input
      id="login-email"
      name="email"
      type="text"
      value={value}
      onChange={(event) => setValue(event.currentTarget.value.replace(/\s+/g, ""))}
      required
      pattern="\S+"
      autoComplete="username"
      autoCapitalize="none"
      spellCheck={false}
      aria-describedby="login-username-hint"
      placeholder="Tên đăng nhập"
    />
  );
}
