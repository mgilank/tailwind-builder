/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  safelist: [
    // Spacing controls used in inspector
    { pattern: /^m-(?:0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|8|10|12|16|20|24)$/ },
    { pattern: /^p-(?:0|0\.5|1|1\.5|2|2\.5|3|3\.5|4|5|6|8|10|12|16|20|24)$/ },
    // Text color: palette + white/black
    { pattern: /^(?:text)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^(?:text)-(?:white|black)$/ },
    // Background color: palette + white/black
    { pattern: /^(?:bg)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^(?:bg)-(?:white|black)$/ },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
