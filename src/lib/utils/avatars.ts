// Generate a deterministic gradient avatar from a wallet address
export function walletToGradient(address: string): {
  from: string;
  to: string;
} {
  const hash = address.toLowerCase().slice(2);
  const hue1 = parseInt(hash.slice(0, 4), 16) % 360;
  const hue2 = (hue1 + 40 + (parseInt(hash.slice(4, 8), 16) % 80)) % 360;

  return {
    from: `hsl(${hue1}, 70%, 60%)`,
    to: `hsl(${hue2}, 70%, 50%)`,
  };
}

export function walletToColor(address: string): string {
  const hash = address.toLowerCase().slice(2);
  const hue = parseInt(hash.slice(0, 4), 16) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
