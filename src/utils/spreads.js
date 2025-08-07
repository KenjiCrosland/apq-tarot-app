export const spreads = {
  threeCard: {
    name: 'Three-Card',
    positions: [
      { id: 'pos1', label: 'Past', area: 'a' },
      { id: 'pos2', label: 'Present', area: 'b' },
      { id: 'pos3', label: 'Future', area: 'c' },
    ],
    templates: { lg: `"a b c"`, sm: `"a" "b" "c"` },
    columns: { lg: 'repeat(3, auto)', sm: '1fr' },
    rows: { lg: 'auto', sm: 'auto auto auto' },
  },
  celticCross: {
    name: 'Celtic Cross',
    positions: [
      { id: 'sig', label: 'Significator', area: 'sig' },
      { id: 'cross', label: 'Crossing', area: 'cross' },
      { id: 'abv', label: 'Above', area: 'abv' },
      { id: 'blw', label: 'Below', area: 'blw' },
      { id: 'pst', label: 'Past', area: 'pst' },
      { id: 'fut', label: 'Future', area: 'fut' },
      { id: 'self', label: 'Self', area: 'self' },
      { id: 'env', label: 'Environment', area: 'env' },
      { id: 'hop', label: 'Hopes/Fears', area: 'hop' },
      { id: 'out', label: 'Outcome', area: 'out' },
    ],
    templates: {
      lg: `
        ".    abv  .    .    ."
        pst  sig  cross fut  .
        ".    blw  .    .    ."
        ".    self env  hop  out"
      `,
      sm: `
        "sig"
        "cross"
        "abv"
        "blw"
        "pst"
        "fut"
        "self"
        "env"
        "hop"
        "out"
      `,
    },
    columns: { lg: 'repeat(5, auto)', sm: '1fr' },
    rows: { lg: 'auto auto auto auto', sm: 'repeat(10, auto)' },
  },
};
